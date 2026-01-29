/**
 * Video Call Screen
 * Video consultation interface with doctor
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../theme';

// ============================================
// TYPES
// ============================================

interface CallState {
  isConnecting: boolean;
  isConnected: boolean;
  duration: number;
  isMuted: boolean;
  isVideoEnabled: boolean;
  isSpeakerOn: boolean;
  isMinimized: boolean;
}

interface RouteParams {
  appointmentId: string;
  doctorName: string;
  doctorSpecialty?: string;
}

// ============================================
// COMPONENT
// ============================================

export default function VideoCallScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();

  const { doctorName = 'Dr. Sarah Chen', doctorSpecialty = 'General Practitioner' } = route.params || {};

  const [callState, setCallState] = useState<CallState>({
    isConnecting: true,
    isConnected: false,
    duration: 0,
    isMuted: false,
    isVideoEnabled: true,
    isSpeakerOn: true,
    isMinimized: false,
  });

  const [showControls, setShowControls] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Simulate connection
  useEffect(() => {
    const connectTimeout = setTimeout(() => {
      setCallState(prev => ({ ...prev, isConnecting: false, isConnected: true }));
    }, 2000);

    return () => clearTimeout(connectTimeout);
  }, []);

  // Call duration timer
  useEffect(() => {
    if (callState.isConnected) {
      durationInterval.current = setInterval(() => {
        setCallState(prev => ({ ...prev, duration: prev.duration + 1 }));
      }, 1000);
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [callState.isConnected]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && callState.isConnected) {
      controlsTimeout.current = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowControls(false));
      }, 5000);
    }

    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [showControls, callState.isConnected, fadeAnim]);

  const handleScreenTap = () => {
    if (!showControls) {
      setShowControls(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    setCallState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const toggleVideo = () => {
    setCallState(prev => ({ ...prev, isVideoEnabled: !prev.isVideoEnabled }));
  };

  const toggleSpeaker = () => {
    setCallState(prev => ({ ...prev, isSpeakerOn: !prev.isSpeakerOn }));
  };

  const handleEndCall = () => {
    Alert.alert(
      'End Call',
      'Are you sure you want to end this consultation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Call',
          style: 'destructive',
          onPress: () => {
            if (durationInterval.current) {
              clearInterval(durationInterval.current);
            }
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleChat = () => {
    Alert.alert('Chat', 'In-call chat feature would open here.');
  };

  const handleShareScreen = () => {
    Alert.alert('Share Screen', 'Screen sharing feature would be activated here.');
  };

  // Connecting State
  if (callState.isConnecting) {
    return (
      <View style={styles.container}>
        <View style={[styles.connectingOverlay, { paddingTop: insets.top }]}>
          <View style={styles.connectingContent}>
            <View style={styles.callerAvatar}>
              <Icon name="person" size={48} color={colors.accent} />
            </View>
            <Text style={styles.callerName}>{doctorName}</Text>
            <Text style={styles.callerSpecialty}>{doctorSpecialty}</Text>
            <View style={styles.connectingIndicator}>
              <Text style={styles.connectingText}>Connecting...</Text>
              <View style={styles.dotsContainer}>
                <ConnectingDots />
              </View>
            </View>
          </View>

          {/* Cancel Button */}
          <TouchableOpacity
            style={[styles.cancelButton, { marginBottom: insets.bottom + 32 }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Icon name="close" size={28} color={colors.textInverse} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={1}
      onPress={handleScreenTap}
    >
      {/* Remote Video (Full Screen) */}
      <View style={styles.remoteVideo}>
        {/* Placeholder for actual video stream */}
        <View style={styles.videoPlaceholder}>
          <View style={styles.remotePlaceholderAvatar}>
            <Icon name="person" size={64} color={colors.textInverse} />
          </View>
          <Text style={styles.remotePlaceholderText}>{doctorName}</Text>
        </View>
      </View>

      {/* Local Video (Picture-in-Picture) */}
      <View style={[styles.localVideo, { top: insets.top + 16 }]}>
        {callState.isVideoEnabled ? (
          <View style={styles.localVideoPlaceholder}>
            <Icon name="person" size={24} color={colors.textInverse} />
          </View>
        ) : (
          <View style={styles.localVideoOff}>
            <Icon name="videocam-off" size={20} color={colors.textInverse} />
          </View>
        )}
      </View>

      {/* Controls Overlay */}
      <Animated.View
        style={[
          styles.controlsOverlay,
          { opacity: fadeAnim },
          { paddingTop: insets.top, paddingBottom: insets.bottom },
        ]}
        pointerEvents={showControls ? 'auto' : 'none'}
      >
        {/* Top Bar */}
        <View style={styles.topBar}>
          <View style={styles.callInfo}>
            <View style={styles.callStatusBadge}>
              <View style={styles.callStatusDot} />
              <Text style={styles.callStatusText}>
                {formatDuration(callState.duration)}
              </Text>
            </View>
            <Text style={styles.callDoctorName}>{doctorName}</Text>
          </View>

          <TouchableOpacity
            style={styles.minimizeButton}
            onPress={() => Alert.alert('Minimize', 'Picture-in-Picture mode would activate')}
          >
            <Icon name="contract-outline" size={24} color={colors.textInverse} />
          </TouchableOpacity>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          {/* Secondary Controls */}
          <View style={styles.secondaryControls}>
            <TouchableOpacity
              style={[styles.controlButton, styles.controlButtonSecondary]}
              onPress={toggleSpeaker}
            >
              <Icon
                name={callState.isSpeakerOn ? 'volume-high' : 'volume-off'}
                size={22}
                color={colors.textInverse}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.controlButtonSecondary]}
              onPress={handleChat}
            >
              <Icon name="chatbubble-outline" size={22} color={colors.textInverse} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.controlButtonSecondary]}
              onPress={handleShareScreen}
            >
              <Icon name="share-outline" size={22} color={colors.textInverse} />
            </TouchableOpacity>
          </View>

          {/* Primary Controls */}
          <View style={styles.primaryControls}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                styles.controlButtonPrimary,
                callState.isMuted && styles.controlButtonActive,
              ]}
              onPress={toggleMute}
            >
              <Icon
                name={callState.isMuted ? 'mic-off' : 'mic'}
                size={26}
                color={colors.textInverse}
              />
              <Text style={styles.controlButtonLabel}>
                {callState.isMuted ? 'Unmute' : 'Mute'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlButton, styles.endCallButton]}
              onPress={handleEndCall}
            >
              <Icon name="call" size={28} color={colors.textInverse} style={styles.endCallIcon} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                styles.controlButtonPrimary,
                !callState.isVideoEnabled && styles.controlButtonActive,
              ]}
              onPress={toggleVideo}
            >
              <Icon
                name={callState.isVideoEnabled ? 'videocam' : 'videocam-off'}
                size={26}
                color={colors.textInverse}
              />
              <Text style={styles.controlButtonLabel}>
                {callState.isVideoEnabled ? 'Camera' : 'Camera Off'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ============================================
// CONNECTING DOTS ANIMATION
// ============================================

function ConnectingDots() {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(dot1, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(dot1, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ]).start();

      setTimeout(() => {
        Animated.sequence([
          Animated.timing(dot2, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]).start();
      }, 200);

      setTimeout(() => {
        Animated.sequence([
          Animated.timing(dot3, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ]).start();
      }, 400);
    };

    animate();
    const interval = setInterval(animate, 1200);
    return () => clearInterval(interval);
  }, [dot1, dot2, dot3]);

  return (
    <View style={dotsStyles.container}>
      <Animated.View style={[dotsStyles.dot, { opacity: dot1 }]} />
      <Animated.View style={[dotsStyles.dot, { opacity: dot2 }]} />
      <Animated.View style={[dotsStyles.dot, { opacity: dot3 }]} />
    </View>
  );
}

const dotsStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.accent,
  },
});

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  // Connecting State
  connectingOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  connectingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callerAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  callerName: {
    ...typography.h2,
    color: colors.textInverse,
    marginBottom: spacing.xs,
  },
  callerSpecialty: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: spacing.xl,
  },
  connectingIndicator: {
    alignItems: 'center',
  },
  connectingText: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: spacing.sm,
  },
  dotsContainer: {
    height: 20,
    justifyContent: 'center',
  },
  cancelButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  // Video Areas
  remoteVideo: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#2a2a2a',
  },
  videoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  remotePlaceholderAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  remotePlaceholderText: {
    ...typography.h4,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  localVideo: {
    position: 'absolute',
    right: 16,
    width: 100,
    height: 140,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: '#3a3a3a',
    ...shadows.card,
  },
  localVideoPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4a4a4a',
  },
  localVideoOff: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
  },
  // Controls Overlay
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  callInfo: {
    gap: spacing.xs,
  },
  callStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.full,
  },
  callStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  callStatusText: {
    ...typography.label,
    color: colors.textInverse,
  },
  callDoctorName: {
    ...typography.h4,
    color: colors.textInverse,
  },
  minimizeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Bottom Controls
  bottomControls: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.lg,
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  primaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: spacing.xl,
  },
  controlButton: {
    alignItems: 'center',
  },
  controlButtonSecondary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlButtonPrimary: {
    width: 60,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
  },
  controlButtonActive: {
    backgroundColor: colors.error,
  },
  controlButtonLabel: {
    ...typography.caption,
    color: colors.textInverse,
    fontSize: 10,
  },
  endCallButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.button,
  },
  endCallIcon: {
    transform: [{ rotate: '135deg' }],
  },
});
