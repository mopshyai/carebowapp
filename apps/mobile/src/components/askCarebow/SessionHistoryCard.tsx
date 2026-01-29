/**
 * Session History Card Component
 * Displays session history for a member with export options
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Share,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import { useAskCarebowStore } from '../../store/askCarebowStore';
import {
  AskCarebowSession,
  urgencyConfig,
  formatSessionForDoctorNotes,
} from '../../types/askCarebow';

type SessionHistoryCardProps = {
  memberId: string;
  onSessionPress?: (session: AskCarebowSession) => void;
  maxItems?: number;
  showExportButton?: boolean;
};

export function SessionHistoryCard({
  memberId,
  onSessionPress,
  maxItems = 5,
  showExportButton = true,
}: SessionHistoryCardProps) {
  const getSessionsForMember = useAskCarebowStore((state) => state.getSessionsForMember);
  const exportSession = useAskCarebowStore((state) => state.exportSession);

  const sessions = getSessionsForMember(memberId).slice(0, maxItems);

  const handleExportSession = async (session: AskCarebowSession) => {
    try {
      const exportText = formatSessionForDoctorNotes(session);

      const result = await Share.share({
        message: exportText,
        title: 'CareBow Session Summary',
      });

      if (result.action === Share.sharedAction) {
        // Track the export
        exportSession('text', 'share');
      }
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export session. Please try again.');
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const getUrgencyBadge = (urgencyLevel?: string) => {
    if (!urgencyLevel) return null;
    const config = urgencyConfig[urgencyLevel as keyof typeof urgencyConfig];
    if (!config) return null;

    return (
      <View style={[styles.badge, { backgroundColor: config.bgColor }]}>
        <Text style={[styles.badgeText, { color: config.color }]}>
          {config.label}
        </Text>
      </View>
    );
  };

  const getRiskIcon = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'critical':
        return <Icon name="alert-circle" size={14} color={colors.error} />;
      case 'high':
        return <Icon name="warning" size={14} color={colors.warning} />;
      case 'moderate':
        return <Icon name="information-circle" size={14} color={colors.accent} />;
      default:
        return <Icon name="checkmark-circle" size={14} color={colors.success} />;
    }
  };

  if (sessions.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Icon name="chatbubbles-outline" size={32} color={colors.textTertiary} />
        <Text style={styles.emptyTitle}>No Health Consultations</Text>
        <Text style={styles.emptySubtitle}>
          Past Ask CareBow sessions will appear here
        </Text>
      </View>
    );
  }

  const renderSessionItem = ({ item: session }: { item: AskCarebowSession }) => {
    const chiefComplaint = session.sessionSummary?.chiefComplaint ||
      session.healthContext.primarySymptom ||
      'Health consultation';

    return (
      <TouchableOpacity
        style={styles.sessionItem}
        onPress={() => onSessionPress?.(session)}
        activeOpacity={0.7}
      >
        <View style={styles.sessionHeader}>
          <View style={styles.sessionInfo}>
            {getRiskIcon(session.riskLevel)}
            <Text style={styles.sessionDate}>{formatDate(session.createdAt)}</Text>
          </View>
          {getUrgencyBadge(session.urgencyLevel)}
        </View>

        <Text style={styles.chiefComplaint} numberOfLines={2}>
          {chiefComplaint}
        </Text>

        {session.detectedSymptoms && session.detectedSymptoms.length > 0 && (
          <View style={styles.symptomsRow}>
            {session.detectedSymptoms.slice(0, 3).map((symptom, index) => (
              <View key={index} style={styles.symptomChip}>
                <Text style={styles.symptomChipText}>{symptom}</Text>
              </View>
            ))}
            {session.detectedSymptoms.length > 3 && (
              <Text style={styles.moreSymptoms}>
                +{session.detectedSymptoms.length - 3} more
              </Text>
            )}
          </View>
        )}

        <View style={styles.sessionFooter}>
          <View style={styles.sessionMeta}>
            {session.linkedOrderId && (
              <View style={styles.linkedBadge}>
                <Icon name="cart" size={12} color={colors.accent} />
                <Text style={styles.linkedText}>Service booked</Text>
              </View>
            )}
            {session.followUpScheduled && (
              <View style={styles.linkedBadge}>
                <Icon name="calendar" size={12} color={colors.accent} />
                <Text style={styles.linkedText}>Follow-up set</Text>
              </View>
            )}
          </View>

          {showExportButton && (
            <TouchableOpacity
              style={styles.exportButton}
              onPress={() => handleExportSession(session)}
            >
              <Icon name="share-outline" size={16} color={colors.accent} />
            </TouchableOpacity>
          )}
        </View>

        {session.triggeredEmergencyFlow && (
          <View style={styles.emergencyBanner}>
            <Icon name="alert" size={14} color={colors.error} />
            <Text style={styles.emergencyText}>Emergency guidance provided</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="chatbubbles" size={20} color={colors.accent} />
          <Text style={styles.title}>Health Consultations</Text>
        </View>
        <Text style={styles.count}>{sessions.length} sessions</Text>
      </View>

      <FlatList
        data={sessions}
        renderItem={renderSessionItem}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      {getSessionsForMember(memberId).length > maxItems && (
        <TouchableOpacity style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>View All Sessions</Text>
          <Icon name="chevron-forward" size={16} color={colors.accent} />
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * Compact session history list for profile pages
 */
export function SessionHistoryList({
  memberId,
  onSessionPress,
}: {
  memberId: string;
  onSessionPress?: (session: AskCarebowSession) => void;
}) {
  const getSessionsForMember = useAskCarebowStore((state) => state.getSessionsForMember);
  const sessions = getSessionsForMember(memberId);

  if (sessions.length === 0) {
    return (
      <View style={styles.emptyList}>
        <Text style={styles.emptyListText}>No consultations yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {sessions.map((session) => {
        const chiefComplaint = session.sessionSummary?.chiefComplaint ||
          session.healthContext.primarySymptom ||
          'Health consultation';

        const date = new Date(session.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });

        return (
          <TouchableOpacity
            key={session.id}
            style={styles.listItem}
            onPress={() => onSessionPress?.(session)}
          >
            <View style={styles.listItemLeft}>
              <View
                style={[
                  styles.listItemDot,
                  session.riskLevel === 'high' || session.riskLevel === 'critical'
                    ? styles.listItemDotHigh
                    : styles.listItemDotNormal,
                ]}
              />
              <View>
                <Text style={styles.listItemTitle} numberOfLines={1}>
                  {chiefComplaint}
                </Text>
                <Text style={styles.listItemDate}>{date}</Text>
              </View>
            </View>
            <Icon name="chevron-forward" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Card styles
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  count: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  // Session item styles
  sessionItem: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sessionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sessionDate: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  badge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  badgeText: {
    ...typography.tiny,
    fontWeight: '600',
  },
  chiefComplaint: {
    ...typography.body,
    color: colors.textPrimary,
  },
  symptomsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
    marginTop: spacing.xxs,
  },
  symptomChip: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  symptomChipText: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  moreSymptoms: {
    ...typography.tiny,
    color: colors.textTertiary,
  },
  sessionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  sessionMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  linkedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  linkedText: {
    ...typography.tiny,
    color: colors.accent,
  },
  exportButton: {
    padding: spacing.xs,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.errorSoft,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: radius.xs,
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
  emergencyText: {
    ...typography.tiny,
    color: colors.error,
  },
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  viewAllText: {
    ...typography.label,
    color: colors.accent,
  },

  // Empty state
  emptyCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.card,
  },
  emptyTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  emptySubtitle: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },

  // List styles
  list: {
    gap: spacing.xs,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  listItemDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listItemDotNormal: {
    backgroundColor: colors.success,
  },
  listItemDotHigh: {
    backgroundColor: colors.error,
  },
  listItemTitle: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  listItemDate: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  emptyList: {
    padding: spacing.md,
    alignItems: 'center',
  },
  emptyListText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
});

export default SessionHistoryCard;
