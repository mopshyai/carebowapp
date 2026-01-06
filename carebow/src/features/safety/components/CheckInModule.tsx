/**
 * Check-In Module Component
 * Daily "I'm OK" check-in status and button
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { colors, spacing, radius, typography, shadows } from '@/theme';
import { CheckInState, CheckInStatus } from '../types';
import {
  getCheckInStatusMessage,
  formatDisplayTime,
  formatScheduledTime,
} from '../services/checkInService';
import { triggerSuccessHaptic } from '../services/sosService';

// ============================================
// TYPES
// ============================================

interface CheckInModuleProps {
  state: CheckInState;
  enabled: boolean;
  onCheckIn: () => Promise<void>;
  onEnableCheckIn?: () => void;
}

// ============================================
// STATUS ICON CONFIG
// ============================================

function getStatusIcon(status: CheckInStatus): {
  name: string;
  color: string;
  bgColor: string;
} {
  switch (status) {
    case 'CHECKED_IN':
      return {
        name: 'checkmark-circle',
        color: colors.success,
        bgColor: colors.successSoft,
      };
    case 'CHECKED_IN_LATE':
      return {
        name: 'checkmark-circle',
        color: colors.warning,
        bgColor: colors.warningSoft,
      };
    case 'MISSED':
      return {
        name: 'alert-circle',
        color: colors.error,
        bgColor: colors.errorSoft,
      };
    case 'DUE':
      return {
        name: 'time',
        color: colors.warning,
        bgColor: colors.warningSoft,
      };
    case 'NOT_DUE':
    default:
      return {
        name: 'time-outline',
        color: colors.textSecondary,
        bgColor: colors.surface2,
      };
  }
}

// ============================================
// COMPONENT
// ============================================

export function CheckInModule({
  state,
  enabled,
  onCheckIn,
  onEnableCheckIn,
}: CheckInModuleProps) {
  const [isLoading, setIsLoading] = useState(false);
  const scale = useSharedValue(1);
  const checkmarkScale = useSharedValue(0);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animatedCheckmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkmarkScale.value }],
    opacity: checkmarkScale.value,
  }));

  const handleCheckIn = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);

    // Animate button press
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1)
    );

    try {
      await onCheckIn();
      await triggerSuccessHaptic();

      // Show success animation
      checkmarkScale.value = withSequence(
        withSpring(1.2),
        withSpring(1)
      );

      // Reset after animation
      setTimeout(() => {
        checkmarkScale.value = withTiming(0, { duration: 200 });
      }, 2000);
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onCheckIn, isLoading, scale, checkmarkScale]);

  const statusIcon = getStatusIcon(state.status);
  const canCheckIn =
    enabled &&
    (state.status === 'DUE' || state.status === 'MISSED' || state.status === 'NOT_DUE');
  const showCheckInButton =
    enabled && state.status !== 'CHECKED_IN' && state.status !== 'CHECKED_IN_LATE';

  // Not enabled state
  if (!enabled) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.surface2 }]}>
            <Icon name="time-outline" size={24} color={colors.textTertiary} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.title}>Daily Check-in</Text>
            <Text style={styles.subtitle}>Not enabled</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.enableButton} onPress={onEnableCheckIn}>
          <Icon name="add-circle-outline" size={20} color={colors.accent} />
          <Text style={styles.enableButtonText}>Enable daily check-in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Status Header */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: statusIcon.bgColor }]}>
          <Icon
            name={statusIcon.name as any}
            size={24}
            color={statusIcon.color}
          />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>Daily Check-in</Text>
          <Text style={[styles.subtitle, { color: statusIcon.color }]}>
            {getCheckInStatusMessage(state)}
          </Text>
        </View>
      </View>

      {/* Check-in Button */}
      {showCheckInButton && (
        <Animated.View style={animatedButtonStyle}>
          <TouchableOpacity
            style={[
              styles.checkInButton,
              state.status === 'MISSED' && styles.checkInButtonUrgent,
              isLoading && styles.checkInButtonLoading,
            ]}
            onPress={handleCheckIn}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} size="small" />
            ) : (
              <>
                <Icon
                  name="hand-right"
                  size={22}
                  color={colors.white}
                />
                <Text style={styles.checkInButtonText}>I'm OK</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Success Animation Overlay */}
      <Animated.View style={[styles.successOverlay, animatedCheckmarkStyle]}>
        <View style={styles.successIcon}>
          <Icon name="checkmark-circle" size={64} color={colors.success} />
        </View>
      </Animated.View>

      {/* Scheduled Time Info */}
      {state.status === 'NOT_DUE' && (
        <Text style={styles.scheduleInfo}>
          Next check-in at {formatDisplayTime(new Date(state.scheduledTime))}
        </Text>
      )}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...typography.h4,
    marginBottom: 2,
  },
  subtitle: {
    ...typography.bodySmall,
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    ...shadows.button,
  },
  checkInButtonUrgent: {
    backgroundColor: colors.warning,
  },
  checkInButtonLoading: {
    opacity: 0.8,
  },
  checkInButtonText: {
    ...typography.label,
    color: colors.white,
    fontWeight: '600',
  },
  enableButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
  },
  enableButtonText: {
    ...typography.label,
    color: colors.accent,
  },
  scheduleInfo: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: radius.xl,
    zIndex: 10,
  },
  successIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
