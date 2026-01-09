/**
 * FollowUpCheckIn Component
 * Compact row to schedule a follow-up check-in after assistant response
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography } from '../../theme';
import { FOLLOW_UP_OPTIONS } from '../../types/followUp';

interface FollowUpCheckInProps {
  onSchedule: (days: number) => void;
  onDismiss: () => void;
  isScheduled?: boolean;
  scheduledLabel?: string;
}

export function FollowUpCheckIn({
  onSchedule,
  onDismiss,
  isScheduled = false,
  scheduledLabel,
}: FollowUpCheckInProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  if (isScheduled) {
    return (
      <View style={styles.scheduledContainer}>
        <Icon name="checkmark-circle" size={16} color={colors.success} />
        <Text style={styles.scheduledText}>
          Check-in scheduled: {scheduledLabel}
        </Text>
      </View>
    );
  }

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Icon name="notifications-outline" size={14} color={colors.textTertiary} />
        <Text style={styles.headerText}>Check in later?</Text>
      </View>

      <View style={styles.optionsRow}>
        {FOLLOW_UP_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={styles.optionButton}
            onPress={() => onSchedule(option.days)}
            activeOpacity={0.7}
          >
            <Text style={styles.optionText}>{option.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={styles.dismissButton}
          onPress={handleDismiss}
          activeOpacity={0.7}
        >
          <Text style={styles.dismissText}>No</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginBottom: spacing.xs,
  },
  headerText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  optionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
  },
  optionText: {
    ...typography.labelSmall,
    color: colors.accent,
  },
  dismissButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  dismissText: {
    ...typography.labelSmall,
    color: colors.textTertiary,
  },
  scheduledContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.successSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
  },
  scheduledText: {
    ...typography.caption,
    color: colors.success,
  },
});
