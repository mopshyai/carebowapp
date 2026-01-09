/**
 * EpisodeCard Component
 * Displays a single health episode in a list
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import { Episode } from '../../types/episode';
import { TriageLevel } from '../../utils/triageCTAMapping';

interface EpisodeCardProps {
  episode: Episode;
  onPress: () => void;
}

const triageBadgeConfig: Record<
  TriageLevel,
  { label: string; bg: string; text: string; icon: string }
> = {
  emergency: {
    label: 'Emergency',
    bg: colors.errorSoft,
    text: colors.error,
    icon: 'alert-circle',
  },
  urgent: {
    label: 'Urgent',
    bg: colors.warningSoft,
    text: colors.warning,
    icon: 'warning',
  },
  soon: {
    label: 'Consult soon',
    bg: colors.infoSoft,
    text: colors.info,
    icon: 'time',
  },
  self_care: {
    label: 'Self-care',
    bg: colors.successSoft,
    text: colors.success,
    icon: 'checkmark-circle',
  },
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function EpisodeCard({ episode, onPress }: EpisodeCardProps) {
  const badge = episode.triageLevel ? triageBadgeConfig[episode.triageLevel] : null;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Icon */}
      <View style={styles.iconContainer}>
        <Icon name="heart" size={20} color={colors.accent} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Header row */}
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>
            {episode.title}
          </Text>
          <Icon name="chevron-forward" size={16} color={colors.textTertiary} />
        </View>

        {/* Triage badge */}
        {badge && (
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Icon name={badge.icon} size={12} color={badge.text} />
            <Text style={[styles.badgeText, { color: badge.text }]}>{badge.label}</Text>
          </View>
        )}

        {/* Snippet */}
        <Text style={styles.snippet} numberOfLines={2}>
          {episode.lastMessageSnippet}
        </Text>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Icon name="time-outline" size={12} color={colors.textTertiary} />
            <Text style={styles.timestamp}>{formatTimeAgo(episode.updatedAt)}</Text>
          </View>
          {episode.forWhom === 'family' && episode.relationship && (
            <View style={styles.forWhomBadge}>
              <Icon name="people" size={10} color={colors.textTertiary} />
              <Text style={styles.forWhomText}>
                {episode.relationship.charAt(0).toUpperCase() + episode.relationship.slice(1)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    flexDirection: 'row',
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xxs,
  },
  title: {
    ...typography.label,
    color: colors.textPrimary,
    flex: 1,
    marginRight: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
    alignSelf: 'flex-start',
    marginBottom: spacing.xs,
  },
  badgeText: {
    ...typography.tiny,
  },
  snippet: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  forWhomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  forWhomText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});
