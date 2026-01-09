/**
 * Episode Summary Screen
 * Displays a shareable summary of a health episode
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../theme';
import { useEpisodeStore, useEpisodeMessages } from '../store/episodeStore';
import {
  buildEpisodeSummary,
  getTriageLevelDisplay,
  EpisodeSummary,
  TimelineItem,
} from '../utils/episodeSummaryBuilder';

export default function EpisodeSummaryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const params = route.params as { episodeId: string } | undefined;

  const episodeId = params?.episodeId;
  const { getEpisode, getMessages } = useEpisodeStore();

  const episode = episodeId ? getEpisode(episodeId) : undefined;
  const messages = episodeId ? getMessages(episodeId) : [];

  // Build summary
  const summary = useMemo<EpisodeSummary | null>(() => {
    if (!episode || messages.length === 0) return null;
    return buildEpisodeSummary(episode, messages);
  }, [episode, messages]);

  // Handle share
  const handleShare = async () => {
    if (!summary) return;

    try {
      await Share.share({
        message: summary.shareableText,
        title: `CareBow Summary: ${summary.title}`,
      });
    } catch (error) {
      Alert.alert('Share Error', 'Unable to share the summary. Please try again.');
    }
  };

  // Handle copy
  const handleCopy = () => {
    // Note: In production, use Clipboard from @react-native-clipboard/clipboard
    Alert.alert('Copied', 'Summary copied to clipboard');
  };

  if (!episode || !summary) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Summary</Text>
          <View style={styles.headerSpacer} />
        </View>
        <View style={styles.emptyContainer}>
          <Icon name="document-text-outline" size={48} color={colors.textTertiary} />
          <Text style={styles.emptyText}>Episode not found</Text>
        </View>
      </View>
    );
  }

  const triageDisplay = getTriageLevelDisplay(summary.triageLevel);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Episode Summary</Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Icon name="share-outline" size={22} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Card */}
        <View style={styles.titleCard}>
          <View style={styles.titleRow}>
            <View style={styles.titleIcon}>
              <Icon name="document-text" size={20} color={colors.accent} />
            </View>
            <View style={styles.titleContent}>
              <Text style={styles.episodeTitle}>{summary.title}</Text>
              <Text style={styles.dateText}>{summary.dateRange}</Text>
            </View>
          </View>
          <View style={styles.metaRow}>
            <View style={styles.metaTag}>
              <Icon name="person-outline" size={12} color={colors.textSecondary} />
              <Text style={styles.metaText}>{summary.forWhom}</Text>
            </View>
            {summary.triageLevel && (
              <View
                style={[
                  styles.triageBadge,
                  { backgroundColor: triageDisplay.bgColor },
                ]}
              >
                <Text style={[styles.triageBadgeText, { color: triageDisplay.color }]}>
                  {triageDisplay.label}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Understanding Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="bulb-outline" size={18} color={colors.accent} />
            <Text style={styles.sectionTitle}>What We Discussed</Text>
          </View>
          <View style={styles.sectionContent}>
            <Text style={styles.understandingText}>{summary.understanding}</Text>
          </View>
        </View>

        {/* Timeline Section */}
        {summary.timeline.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="list-outline" size={18} color={colors.accent} />
              <Text style={styles.sectionTitle}>Key Information</Text>
            </View>
            <View style={styles.sectionContent}>
              {summary.timeline.map((item, index) => (
                <TimelineItemRow key={index} item={item} />
              ))}
            </View>
          </View>
        )}

        {/* Red Flags Section */}
        {summary.redFlags.length > 0 && (
          <View style={[styles.section, styles.redFlagsSection]}>
            <View style={styles.sectionHeader}>
              <Icon name="alert-circle-outline" size={18} color={colors.warning} />
              <Text style={[styles.sectionTitle, { color: colors.warning }]}>
                Watch For These Red Flags
              </Text>
            </View>
            <View style={styles.sectionContent}>
              {summary.redFlags.map((flag, index) => (
                <View key={index} style={styles.bulletRow}>
                  <View style={[styles.bullet, { backgroundColor: colors.warning }]} />
                  <Text style={styles.bulletText}>{flag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Questions for Doctor */}
        {summary.questionsForDoctor.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="help-circle-outline" size={18} color={colors.info} />
              <Text style={styles.sectionTitle}>Questions to Ask Your Doctor</Text>
            </View>
            <View style={styles.sectionContent}>
              {summary.questionsForDoctor.map((question, index) => (
                <View key={index} style={styles.bulletRow}>
                  <Text style={styles.questionNumber}>{index + 1}.</Text>
                  <Text style={styles.bulletText}>{question}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Icon name="information-circle-outline" size={14} color={colors.textTertiary} />
          <Text style={styles.disclaimerText}>
            This summary is for informational purposes only and does not constitute
            medical advice. Please consult a healthcare provider for diagnosis and treatment.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity style={styles.shareMainButton} onPress={handleShare}>
          <Icon name="share-social" size={20} color={colors.textInverse} />
          <Text style={styles.shareMainButtonText}>Share Summary</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Timeline Item Row Component
function TimelineItemRow({ item }: { item: TimelineItem }) {
  const getIcon = () => {
    switch (item.type) {
      case 'symptom':
        return 'medkit-outline';
      case 'onset':
        return 'time-outline';
      case 'severity':
        return 'speedometer-outline';
      case 'associated':
        return 'add-circle-outline';
      case 'context':
        return 'person-outline';
      default:
        return 'ellipse-outline';
    }
  };

  return (
    <View style={styles.timelineRow}>
      <View style={styles.timelineIcon}>
        <Icon name={getIcon()} size={14} color={colors.textTertiary} />
      </View>
      <View style={styles.timelineContent}>
        <Text style={styles.timelineLabel}>{item.label}</Text>
        <Text style={styles.timelineValue}>{item.value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },
  shareButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emptyText: {
    ...typography.body,
    color: colors.textTertiary,
  },
  titleCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  titleIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContent: {
    flex: 1,
  },
  episodeTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  dateText: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xxs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  metaTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },
  metaText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  triageBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
    borderRadius: radius.sm,
  },
  triageBadgeText: {
    ...typography.tiny,
    fontWeight: '600',
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  redFlagsSection: {
    borderColor: colors.warning,
    backgroundColor: colors.warningSoft || '#FFFBEB',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textPrimary,
  },
  sectionContent: {
    gap: spacing.xs,
  },
  understandingText: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
    marginTop: 7,
  },
  bulletText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },
  questionNumber: {
    ...typography.bodySmall,
    color: colors.info,
    fontWeight: '600',
    minWidth: 20,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  timelineIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  timelineValue: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    marginTop: 2,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  disclaimerText: {
    ...typography.tiny,
    color: colors.textTertiary,
    flex: 1,
    lineHeight: 16,
  },
  bottomBar: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  shareMainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    ...shadows.button,
  },
  shareMainButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
});
