/**
 * FollowUpCard Component
 * Displays a scheduled follow-up check-in
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography } from '../../theme';
import { FollowUpIntent, formatFollowUpDate, isFollowUpOverdue } from '../../types/followUp';

interface FollowUpCardProps {
  followUp: FollowUpIntent;
  onPress: () => void;
  onMarkDone?: () => void;
}

export function FollowUpCard({ followUp, onPress, onMarkDone }: FollowUpCardProps) {
  const isOverdue = isFollowUpOverdue(followUp);
  const dateLabel = formatFollowUpDate(followUp.followUpAt);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Icon */}
      <View style={[styles.iconContainer, isOverdue && styles.iconContainerOverdue]}>
        <Icon
          name="notifications"
          size={18}
          color={isOverdue ? colors.warning : colors.accent}
        />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {followUp.episodeTitle}
          </Text>
          {onMarkDone && (
            <TouchableOpacity
              style={styles.doneButton}
              onPress={onMarkDone}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Icon name="checkmark" size={16} color={colors.accent} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.dateRow}>
          <Icon
            name={isOverdue ? 'alert-circle' : 'time-outline'}
            size={12}
            color={isOverdue ? colors.warning : colors.textTertiary}
          />
          <Text style={[styles.dateText, isOverdue && styles.dateTextOverdue]}>
            {isOverdue ? `Overdue: ${dateLabel}` : dateLabel}
          </Text>
        </View>
      </View>

      <Icon name="chevron-forward" size={16} color={colors.textTertiary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerOverdue: {
    backgroundColor: colors.warningSoft,
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.label,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.xs,
  },
  doneButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginTop: spacing.xxs,
  },
  dateText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  dateTextOverdue: {
    color: colors.warning,
  },
});
