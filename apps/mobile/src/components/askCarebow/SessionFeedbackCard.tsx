/**
 * Session Feedback Card Component
 * Collects user feedback after a triage session
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import { useAskCarebowStore, useHasProvidedFeedback } from '../../store/askCarebowStore';

type SessionFeedbackCardProps = {
  onFeedbackSubmitted?: () => void;
  compact?: boolean;
};

export function SessionFeedbackCard({
  onFeedbackSubmitted,
  compact = false,
}: SessionFeedbackCardProps) {
  const [selectedRating, setSelectedRating] = useState<1 | 2 | 3 | 4 | 5 | null>(null);
  const [wasHelpful, setWasHelpful] = useState<boolean | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const provideDetailedFeedback = useAskCarebowStore((state) => state.provideDetailedFeedback);
  const hasProvidedFeedback = useHasProvidedFeedback();

  // Don't show if already provided feedback
  if (hasProvidedFeedback || submitted) {
    return (
      <View style={styles.thankYouCard}>
        <Icon name="checkmark-circle" size={24} color={colors.success} />
        <Text style={styles.thankYouText}>Thank you for your feedback!</Text>
      </View>
    );
  }

  const handleSubmit = () => {
    if (wasHelpful === null || selectedRating === null) return;

    provideDetailedFeedback({
      wasHelpful,
      rating: selectedRating,
      feedbackNote: feedbackNote.trim() || undefined,
    });

    setSubmitted(true);
    onFeedbackSubmitted?.();
  };

  const ratingLabels = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  if (compact) {
    return (
      <View style={styles.compactCard}>
        <Text style={styles.compactTitle}>Was this helpful?</Text>
        <View style={styles.compactButtons}>
          <TouchableOpacity
            style={[
              styles.compactButton,
              wasHelpful === true && styles.compactButtonSelected,
            ]}
            onPress={() => {
              setWasHelpful(true);
              setSelectedRating(4);
              provideDetailedFeedback({
                wasHelpful: true,
                rating: 4,
              });
              setSubmitted(true);
              onFeedbackSubmitted?.();
            }}
          >
            <Icon
              name="thumbs-up"
              size={18}
              color={wasHelpful === true ? colors.success : colors.textSecondary}
            />
            <Text
              style={[
                styles.compactButtonText,
                wasHelpful === true && styles.compactButtonTextSelected,
              ]}
            >
              Yes
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.compactButton,
              wasHelpful === false && styles.compactButtonSelected,
            ]}
            onPress={() => {
              setWasHelpful(false);
              setShowNoteInput(true);
            }}
          >
            <Icon
              name="thumbs-down"
              size={18}
              color={wasHelpful === false ? colors.error : colors.textSecondary}
            />
            <Text
              style={[
                styles.compactButtonText,
                wasHelpful === false && styles.compactButtonTextNegative,
              ]}
            >
              No
            </Text>
          </TouchableOpacity>
        </View>

        {showNoteInput && wasHelpful === false && (
          <View style={styles.compactNoteSection}>
            <TextInput
              style={styles.compactNoteInput}
              placeholder="Tell us how we can improve..."
              placeholderTextColor={colors.textTertiary}
              value={feedbackNote}
              onChangeText={setFeedbackNote}
              multiline
            />
            <TouchableOpacity
              style={styles.compactSubmitButton}
              onPress={() => {
                provideDetailedFeedback({
                  wasHelpful: false,
                  rating: 2,
                  feedbackNote: feedbackNote.trim() || undefined,
                });
                setSubmitted(true);
                onFeedbackSubmitted?.();
              }}
            >
              <Text style={styles.compactSubmitText}>Submit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>How was your experience?</Text>
      <Text style={styles.subtitle}>Your feedback helps us improve</Text>

      {/* Helpful question */}
      <View style={styles.section}>
        <Text style={styles.question}>Was this guidance helpful?</Text>
        <View style={styles.helpfulButtons}>
          <TouchableOpacity
            style={[
              styles.helpfulButton,
              wasHelpful === true && styles.helpfulButtonYes,
            ]}
            onPress={() => setWasHelpful(true)}
          >
            <Icon
              name="thumbs-up"
              size={20}
              color={wasHelpful === true ? colors.textInverse : colors.success}
            />
            <Text
              style={[
                styles.helpfulButtonText,
                wasHelpful === true && styles.helpfulButtonTextSelected,
              ]}
            >
              Yes, helpful
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.helpfulButton,
              wasHelpful === false && styles.helpfulButtonNo,
            ]}
            onPress={() => setWasHelpful(false)}
          >
            <Icon
              name="thumbs-down"
              size={20}
              color={wasHelpful === false ? colors.textInverse : colors.error}
            />
            <Text
              style={[
                styles.helpfulButtonText,
                wasHelpful === false && styles.helpfulButtonTextSelected,
              ]}
            >
              Not really
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Star rating */}
      <View style={styles.section}>
        <Text style={styles.question}>Rate your overall experience</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((rating) => (
            <TouchableOpacity
              key={rating}
              onPress={() => setSelectedRating(rating as 1 | 2 | 3 | 4 | 5)}
              style={styles.starButton}
            >
              <Icon
                name={selectedRating && selectedRating >= rating ? 'star' : 'star-outline'}
                size={32}
                color={selectedRating && selectedRating >= rating ? colors.warning : colors.border}
              />
            </TouchableOpacity>
          ))}
        </View>
        {selectedRating && (
          <Text style={styles.ratingLabel}>
            {ratingLabels[selectedRating - 1]}
          </Text>
        )}
      </View>

      {/* Optional note */}
      <View style={styles.section}>
        <Text style={styles.question}>Any additional comments? (Optional)</Text>
        <TextInput
          style={styles.noteInput}
          placeholder="Tell us more about your experience..."
          placeholderTextColor={colors.textTertiary}
          value={feedbackNote}
          onChangeText={setFeedbackNote}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Submit button */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!wasHelpful === null || !selectedRating) && styles.submitButtonDisabled,
        ]}
        onPress={handleSubmit}
        disabled={wasHelpful === null || !selectedRating}
      >
        <Text style={styles.submitButtonText}>Submit Feedback</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>
        Your feedback is anonymous and helps improve our service
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Full card styles
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadows.card,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    gap: spacing.sm,
  },
  question: {
    ...typography.label,
    color: colors.textPrimary,
  },
  helpfulButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  helpfulButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  helpfulButtonYes: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  helpfulButtonNo: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  helpfulButtonText: {
    ...typography.label,
    color: colors.textSecondary,
  },
  helpfulButtonTextSelected: {
    color: colors.textInverse,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  starButton: {
    padding: spacing.xs,
  },
  ratingLabel: {
    ...typography.caption,
    color: colors.accent,
    textAlign: 'center',
  },
  noteInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.button,
  },
  submitButtonDisabled: {
    backgroundColor: colors.border,
  },
  submitButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },

  // Compact card styles
  compactCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  compactTitle: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  compactButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  compactButtonSelected: {
    borderColor: colors.accentSoft,
    backgroundColor: colors.accentMuted,
  },
  compactButtonText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  compactButtonTextSelected: {
    color: colors.success,
  },
  compactButtonTextNegative: {
    color: colors.error,
  },
  compactNoteSection: {
    gap: spacing.xs,
  },
  compactNoteInput: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.xs,
    ...typography.caption,
    color: colors.textPrimary,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  compactSubmitButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: spacing.xs,
    alignItems: 'center',
  },
  compactSubmitText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },

  // Thank you card
  thankYouCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  thankYouText: {
    ...typography.body,
    color: colors.success,
  },
});

export default SessionFeedbackCard;
