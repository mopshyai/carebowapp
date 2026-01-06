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
  PermissionsAndroid,
} from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import { transcribeAudioNative, mockTranscribeAudio } from '../../lib/askCarebow/whisperTranscription';

type VoiceInputProps = {
  onTranscriptionComplete: (text: string) => void;
  onRecordingStart?: () => void;
  onRecordingEnd?: () => void;
  apiKey?: string;
  useMock?: boolean;
  disabled?: boolean;
};

type RecordingState = 'idle' | 'recording' | 'processing';

const audioRecorderPlayer = new AudioRecorderPlayer();

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
  const [recordPath, setRecordPath] = useState<string | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingState === 'recording') {
        audioRecorderPlayer.stopRecorder().catch(() => {});
        audioRecorderPlayer.removeRecordBackListener();
      }
    };
  }, [recordingState]);

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
    if (Platform.OS === 'android') {
      try {
        const grants = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ]);

        if (
          grants['android.permission.RECORD_AUDIO'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          return true;
        }
        Alert.alert(
          'Permission Required',
          'Microphone permission is needed to record voice input.',
          [{ text: 'OK' }]
        );
        return false;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    // iOS permissions are handled via Info.plist
    return true;
  };

  const startRecording = async () => {
    if (disabled) return;

    setError(null);

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const path = Platform.select({
        ios: 'carebow_recording.m4a',
        android: `${Date.now()}.mp4`,
      });

      const uri = await audioRecorderPlayer.startRecorder(path);
      setRecordPath(uri);

      audioRecorderPlayer.addRecordBackListener((e) => {
        setRecordingDuration(Math.floor(e.currentPosition / 1000));
      });

      setRecordingState('recording');
      onRecordingStart?.();
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording');
      setRecordingState('idle');
    }
  };

  const stopRecording = async () => {
    if (recordingState !== 'recording') return;

    setRecordingState('processing');
    onRecordingEnd?.();

    try {
      const uri = await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();

      if (!uri) {
        throw new Error('No recording URI');
      }

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
      setRecordPath(null);
    }
  };

  const cancelRecording = async () => {
    if (recordingState !== 'recording') return;

    try {
      await audioRecorderPlayer.stopRecorder();
      audioRecorderPlayer.removeRecordBackListener();
    } catch (err) {
      console.error('Failed to cancel recording:', err);
    } finally {
      setRecordingState('idle');
      setRecordingDuration(0);
      setRecordPath(null);
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
              <Icon name="mic" size={24} color={colors.accent} />
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
              <Icon name="hourglass" size={24} color={colors.accent} />
              <Text style={styles.buttonText}>Processing...</Text>
            </>
          )}
        </Animated.View>
      </TouchableOpacity>

      {/* Cancel button during recording */}
      {recordingState === 'recording' && (
        <TouchableOpacity style={styles.cancelButton} onPress={cancelRecording}>
          <Icon name="close" size={16} color={colors.textTertiary} />
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      )}

      {/* Error message */}
      {error && (
        <View style={styles.errorContainer}>
          <Icon name="warning" size={16} color={colors.error} />
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
