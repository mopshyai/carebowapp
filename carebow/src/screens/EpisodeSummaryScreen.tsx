/**
 * Episode Summary Screen
 * Displays a shareable summary of a health episode
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Modal,
  Pressable,
  Platform,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
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
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const episodeId = params?.episodeId;
  const { getEpisode, getMessages } = useEpisodeStore();

  const episode = episodeId ? getEpisode(episodeId) : undefined;
  const messages = episodeId ? getMessages(episodeId) : [];

  // Build summary
  const summary = useMemo<EpisodeSummary | null>(() => {
    if (!episode || messages.length === 0) return null;
    return buildEpisodeSummary(episode, messages);
  }, [episode, messages]);

  // Handle share via system share sheet
  const handleShare = async () => {
    if (!summary) return;
    setShowShareOptions(false);

    try {
      await Share.share({
        message: summary.shareableText,
        title: `CareBow Summary: ${summary.title}`,
      });
    } catch {
      Alert.alert('Share Error', 'Unable to share the summary. Please try again.');
    }
  };

  // Handle copy to clipboard
  const handleCopy = () => {
    if (!summary) return;
    setShowShareOptions(false);

    try {
      Clipboard.setString(summary.shareableText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      Alert.alert('Copy Error', 'Unable to copy to clipboard. Please try again.');
    }
  };

  // Handle email share
  const handleEmailShare = async () => {
    if (!summary) return;
    setShowShareOptions(false);

    const subject = encodeURIComponent(`CareBow Health Summary: ${summary.title}`);
    const body = encodeURIComponent(summary.shareableText);
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;

    try {
      const { Linking } = require('react-native');
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert('Email Not Available', 'No email app is configured on this device.');
      }
    } catch {
      Alert.alert('Email Error', 'Unable to open email app. Please try again.');
    }
  };

  // Handle print/PDF (placeholder - would need a PDF library in production)
  const handlePrint = () => {
    setShowShareOptions(false);
    Alert.alert(
      'Print Summary',
      'PDF export feature coming soon. For now, you can share or copy the summary.',
      [{ text: 'OK' }]
    );
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
        <View style={styles.bottomButtonRow}>
          <TouchableOpacity
            style={styles.copyButton}
            onPress={handleCopy}
            accessibilityLabel="Copy summary to clipboard"
            accessibilityRole="button"
          >
            <Icon
              name={isCopied ? 'checkmark-circle' : 'copy-outline'}
              size={20}
              color={isCopied ? colors.success : colors.accent}
            />
            <Text style={[styles.copyButtonText, isCopied && { color: colors.success }]}>
              {isCopied ? 'Copied!' : 'Copy'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.shareMainButton}
            onPress={() => setShowShareOptions(true)}
            accessibilityLabel="Share summary"
            accessibilityRole="button"
          >
            <Icon name="share-social" size={20} color={colors.textInverse} />
            <Text style={styles.shareMainButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Share Options Modal */}
      <Modal
        visible={showShareOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowShareOptions(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowShareOptions(false)}>
          <Pressable
            style={[styles.modalSheet, { paddingBottom: insets.bottom + spacing.lg }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Share Summary</Text>
            <Text style={styles.modalSubtitle}>
              Choose how you'd like to share your health summary
            </Text>

            <View style={styles.shareOptionsGrid}>
              <TouchableOpacity style={styles.shareOption} onPress={handleShare}>
                <View style={[styles.shareOptionIcon, { backgroundColor: colors.accentMuted }]}>
                  <Icon name="share-outline" size={24} color={colors.accent} />
                </View>
                <Text style={styles.shareOptionLabel}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={handleCopy}>
                <View style={[styles.shareOptionIcon, { backgroundColor: '#E0F2FE' }]}>
                  <Icon name="copy-outline" size={24} color="#0284C7" />
                </View>
                <Text style={styles.shareOptionLabel}>Copy</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={handleEmailShare}>
                <View style={[styles.shareOptionIcon, { backgroundColor: '#FEF3C7' }]}>
                  <Icon name="mail-outline" size={24} color="#D97706" />
                </View>
                <Text style={styles.shareOptionLabel}>Email</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareOption} onPress={handlePrint}>
                <View style={[styles.shareOptionIcon, { backgroundColor: '#F3E8FF' }]}>
                  <Icon name="print-outline" size={24} color="#7C3AED" />
                </View>
                <Text style={styles.shareOptionLabel}>Print</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalNote}>
              <Icon name="shield-checkmark-outline" size={14} color={colors.textTertiary} />
              <Text style={styles.modalNoteText}>
                Your health information is only shared with people you choose
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowShareOptions(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
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
  bottomButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  copyButtonText: {
    ...typography.label,
    color: colors.accent,
  },
  shareMainButton: {
    flex: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.xxs,
    marginBottom: spacing.lg,
  },
  shareOptionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  shareOption: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  shareOptionIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareOptionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  modalNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  modalNoteText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  modalCancelButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  modalCancelText: {
    ...typography.label,
    color: colors.textTertiary,
  },
});
