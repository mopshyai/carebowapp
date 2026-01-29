/**
 * FeedbackButtons Component
 * Shows "Was this helpful?" with thumbs up/down and optional reasons
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography } from '../../theme';
import {
  FeedbackRating,
  NegativeFeedbackReason,
  NEGATIVE_FEEDBACK_REASONS,
} from '../../types/feedback';
import { useFeedbackStore, useHasRatedMessage } from '../../store/feedbackStore';

interface FeedbackButtonsProps {
  episodeId: string;
  messageId: string;
  messageSnippet?: string;
}

export function FeedbackButtons({
  episodeId,
  messageId,
  messageSnippet,
}: FeedbackButtonsProps) {
  const [showReasons, setShowReasons] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedRating, setSelectedRating] = useState<FeedbackRating | null>(null);

  const { submitFeedback } = useFeedbackStore();
  const hasRated = useHasRatedMessage(messageId);

  const handleRating = useCallback(
    (rating: FeedbackRating) => {
      setSelectedRating(rating);

      if (rating === 'helpful') {
        // Submit immediately for positive feedback
        submitFeedback({
          episodeId,
          messageId,
          rating,
          messageSnippet,
        });
        setSubmitted(true);
      } else {
        // Show reasons for negative feedback
        setShowReasons(true);
      }
    },
    [episodeId, messageId, messageSnippet, submitFeedback]
  );

  const handleReasonSelect = useCallback(
    (reason: NegativeFeedbackReason) => {
      submitFeedback({
        episodeId,
        messageId,
        rating: 'not_helpful',
        reason,
        messageSnippet,
      });
      setSubmitted(true);
      setShowReasons(false);
    },
    [episodeId, messageId, messageSnippet, submitFeedback]
  );

  const handleSkipReason = useCallback(() => {
    submitFeedback({
      episodeId,
      messageId,
      rating: 'not_helpful',
      messageSnippet,
    });
    setSubmitted(true);
    setShowReasons(false);
  }, [episodeId, messageId, messageSnippet, submitFeedback]);

  // Don't show if already rated (from storage)
  if (hasRated && !submitted) {
    return null;
  }

  // Show thank you after submission
  if (submitted) {
    return (
      <View style={styles.thankYouContainer}>
        <Icon name="checkmark-circle" size={14} color={colors.success} />
        <Text style={styles.thankYouText}>Thanks for your feedback!</Text>
      </View>
    );
  }

  // Show reasons selection
  if (showReasons) {
    return (
      <View style={styles.reasonsContainer}>
        <Text style={styles.reasonsTitle}>What could be better?</Text>
        <View style={styles.reasonsGrid}>
          {(Object.keys(NEGATIVE_FEEDBACK_REASONS) as NegativeFeedbackReason[]).map(
            (reason) => (
              <TouchableOpacity
                key={reason}
                style={styles.reasonChip}
                onPress={() => handleReasonSelect(reason)}
              >
                <Text style={styles.reasonChipText}>
                  {NEGATIVE_FEEDBACK_REASONS[reason]}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkipReason}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show initial feedback buttons
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Was this helpful?</Text>
      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={[
            styles.feedbackButton,
            selectedRating === 'helpful' && styles.feedbackButtonSelected,
          ]}
          onPress={() => handleRating('helpful')}
        >
          <Icon
            name="thumbs-up-outline"
            size={16}
            color={selectedRating === 'helpful' ? colors.success : colors.textTertiary}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.feedbackButton,
            selectedRating === 'not_helpful' && styles.feedbackButtonSelected,
          ]}
          onPress={() => handleRating('not_helpful')}
        >
          <Icon
            name="thumbs-down-outline"
            size={16}
            color={selectedRating === 'not_helpful' ? colors.error : colors.textTertiary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  label: {
    ...typography.tiny,
    color: colors.textTertiary,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing.xxs,
  },
  feedbackButton: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  feedbackButtonSelected: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  reasonsContainer: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonsTitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  reasonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxs,
  },
  reasonChip: {
    backgroundColor: colors.surface2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reasonChipText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  skipButton: {
    marginTop: spacing.xs,
    alignSelf: 'flex-end',
  },
  skipButtonText: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  thankYouContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  thankYouText: {
    ...typography.tiny,
    color: colors.success,
  },
});
