/**
 * Voice Input Component
 * Records audio and transcribes using Whisper API
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { Audio } from 'expo-av';
import Ionicons from '@expo/vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '@/theme';
import { transcribeAudioNative, mockTranscribeAudio } from '@/lib/askCarebow/whisperTranscription';

type VoiceInputProps = {
  onTranscriptionComplete: (text: string) => void;
  onRecordingStart?: () => void;
  onRecordingEnd?: () => void;
  apiKey?: string;
  useMock?: boolean;
  disabled?: boolean;
};

type RecordingState = 'idle' | 'recording' | 'processing';

export function VoiceInput({
  onTranscriptionComplete,
  onRecordingStart,
  onRecordingEnd,
  apiKey,
  useMock = false,
  disabled = false,
}: VoiceInputProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  // Pulse animation while recording
  useEffect(() => {
    if (recordingState === 'recording') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [recordingState, pulseAnim]);

  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Microphone permission is needed to record voice input.',
          [{ text: 'OK' }]
        );
        return false;
      }
      return true;
    } catch (err) {
      console.error('Permission error:', err);
      return false;
    }
  };

  const startRecording = async () => {
    if (disabled) return;

    setError(null);

    // Request permissions
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setRecordingState('recording');
      setRecordingDuration(0);
      onRecordingStart?.();

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording');
      setRecordingState('idle');
    }
  };

  const stopRecording = async () => {
    if (!recordingRef.current) return;

    // Stop duration timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    setRecordingState('processing');
    onRecordingEnd?.();

    try {
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;

      if (!uri) {
        throw new Error('No recording URI');
      }

      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      // Transcribe the audio
      let result;
      if (useMock || !apiKey) {
        result = await mockTranscribeAudio(uri, recordingDuration * 1000);
      } else {
        result = await transcribeAudioNative(uri, apiKey);
      }

      if (result.success && result.text) {
        onTranscriptionComplete(result.text);
      } else {
        setError(result.error || 'Failed to transcribe audio');
      }
    } catch (err) {
      console.error('Failed to process recording:', err);
      setError('Failed to process recording');
    } finally {
      setRecordingState('idle');
      setRecordingDuration(0);
    }
  };

  const cancelRecording = async () => {
    if (!recordingRef.current) return;

    // Stop duration timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    try {
      await recordingRef.current.stopAndUnloadAsync();
      recordingRef.current = null;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
    } catch (err) {
      console.error('Failed to cancel recording:', err);
    } finally {
      setRecordingState('idle');
      setRecordingDuration(0);
      onRecordingEnd?.();
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePress = () => {
    if (recordingState === 'idle') {
      startRecording();
    } else if (recordingState === 'recording') {
      stopRecording();
    }
  };

  return (
    <View style={styles.container}>
      {/* Main button */}
      <TouchableOpacity
        style={[
          styles.button,
          recordingState === 'recording' && styles.buttonRecording,
          recordingState === 'processing' && styles.buttonProcessing,
          disabled && styles.buttonDisabled,
        ]}
        onPress={handlePress}
        disabled={disabled || recordingState === 'processing'}
        activeOpacity={0.8}
      >
        <Animated.View
          style={[
            styles.buttonInner,
            recordingState === 'recording' && {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {recordingState === 'idle' && (
            <>
              <Ionicons name="mic" size={24} color={colors.accent} />
              <Text style={styles.buttonText}>Tap to speak</Text>
            </>
          )}
          {recordingState === 'recording' && (
            <>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
              </View>
              <Text style={styles.buttonTextRecording}>
                Recording... {formatDuration(recordingDuration)}
              </Text>
              <Text style={styles.tapToStop}>Tap to finish</Text>
            </>
          )}
          {recordingState === 'processing' && (
            <>
              <Ionicons name="hourglass" size={24} color={colors.accent} />
              <Text style={styles.buttonText}>Processing...</Text>
            </>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Cancel button during recording */}
      {recordingState === 'recording' && (
        <TouchableOpacity style={styles.cancelButton} onPress={cancelRecording}>
          <Ionicons name="close" size={16} color={colors.textTertiary} />
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      )}

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning" size={16} color={colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Help text */}
      {recordingState === 'idle' && !error && (
        <Text style={styles.helpText}>
          Describe your symptoms by speaking. Your words will be transcribed.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  button: {
    width: '100%',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  buttonRecording: {
    borderColor: colors.error,
    backgroundColor: colors.errorSoft,
  },
  buttonProcessing: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonInner: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  buttonText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  buttonTextRecording: {
    ...typography.labelLarge,
    color: colors.error,
  },
  tapToStop: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  recordingIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.errorSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  cancelText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.errorSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
  },
  helpText: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: spacing.lg,
  },
});

export default VoiceInput;
