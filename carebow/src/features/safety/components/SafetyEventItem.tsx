/**
 * Safety Event Item Component
 * Displays a single safety event in the activity feed
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography } from '@/theme';
import { SafetyEvent, SafetyEventType } from '../types';

// ============================================
// TYPES
// ============================================

interface SafetyEventItemProps {
  event: SafetyEvent;
}

// ============================================
// EVENT CONFIG
// ============================================

type EventConfig = {
  icon: string;
  iconColor: string;
  bgColor: string;
  title: string;
  description: (event: SafetyEvent) => string;
};

function getEventConfig(type: SafetyEventType): EventConfig {
  switch (type) {
    case 'SOS_TRIGGERED':
      return {
        icon: 'alert-circle',
        iconColor: colors.error,
        bgColor: colors.errorSoft,
        title: 'SOS Triggered',
        description: (event) =>
          event.metadata.location
            ? 'Emergency alert sent with location'
            : 'Emergency alert sent',
      };
    case 'CHECKIN_CONFIRMED':
      return {
        icon: 'checkmark-circle',
        iconColor: colors.success,
        bgColor: colors.successSoft,
        title: 'Checked In',
        description: (event) =>
          event.metadata.wasLate
            ? 'Daily check-in completed (late)'
            : 'Daily check-in completed',
      };
    case 'CHECKIN_MISSED':
      return {
        icon: 'time',
        iconColor: colors.warning,
        bgColor: colors.warningSoft,
        title: 'Check-in Missed',
        description: () => 'Daily check-in deadline passed',
      };
    case 'TEST_ALERT_SENT':
      return {
        icon: 'notifications',
        iconColor: colors.info,
        bgColor: colors.infoSoft,
        title: 'Test Alert',
        description: () => 'Test notification sent to contacts',
      };
    default:
      return {
        icon: 'information-circle',
        iconColor: colors.textSecondary,
        bgColor: colors.surface2,
        title: 'Event',
        description: () => 'Safety event recorded',
      };
  }
}

function formatEventTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

// ============================================
// COMPONENT
// ============================================

export function SafetyEventItem({ event }: SafetyEventItemProps) {
  const config = getEventConfig(event.type);

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: config.bgColor }]}>
        <Icon
          name={config.icon as any}
          size={18}
          color={config.iconColor}
        />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{config.title}</Text>
          <Text style={styles.time}>{formatEventTime(event.timestamp)}</Text>
        </View>
        <Text style={styles.description}>{config.description(event)}</Text>
      </View>
    </View>
  );
}

// ============================================
// EMPTY STATE
// ============================================

export function EmptyEventsState() {
  return (
    <View style={styles.emptyContainer}>
      <Icon name="shield-checkmark-outline" size={32} color={colors.textTertiary} />
      <Text style={styles.emptyText}>No safety events yet</Text>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.label,
  },
  time: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  description: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  // Empty state
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  emptyText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
  },
});
