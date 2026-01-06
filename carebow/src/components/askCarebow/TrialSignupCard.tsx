/**
 * Trial Signup Card Component
 * Prompts user to start their 3-day free trial
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import { useAskCarebowStore, useTrialState, useIsTrialActive, useTrialDaysRemaining } from '../../store/askCarebowStore';

type TrialSignupCardProps = {
  onTrialStart?: () => void;
  compact?: boolean;
};

/**
 * Card shown before trial starts - prompts user to activate
 */
export function TrialSignupCard({ onTrialStart, compact = false }: TrialSignupCardProps) {
  const startTrial = useAskCarebowStore((state) => state.startTrial);
  const trialState = useTrialState();

  // Don't show if trial was already used
  if (trialState.hasUsedTrial) {
    return null;
  }

  const handleStartTrial = () => {
    startTrial();
    onTrialStart?.();
  };

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactCard} onPress={handleStartTrial}>
        <View style={styles.compactIconWrap}>
          <Icon name="sparkles" size={16} color={colors.accent} />
        </View>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle}>Try Premium Free</Text>
          <Text style={styles.compactSubtitle}>3 days unlimited access</Text>
        </View>
        <Icon name="arrow-forward" size={16} color={colors.accent} />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Icon name="sparkles" size={24} color={colors.accent} />
        </View>
        <Text style={styles.title}>Try Ask CareBow Premium FREE</Text>
      </View>

      <Text style={styles.description}>
        Get 3 days of unlimited access to:
      </Text>

      <View style={styles.features}>
        <View style={styles.featureRow}>
          <Icon name="checkmark-circle" size={18} color={colors.success} />
          <Text style={styles.featureText}>Full symptom triage reports</Text>
        </View>
        <View style={styles.featureRow}>
          <Icon name="checkmark-circle" size={18} color={colors.success} />
          <Text style={styles.featureText}>Personalized care plans</Text>
        </View>
        <View style={styles.featureRow}>
          <Icon name="checkmark-circle" size={18} color={colors.success} />
          <Text style={styles.featureText}>Unlimited questions</Text>
        </View>
        <View style={styles.featureRow}>
          <Icon name="checkmark-circle" size={18} color={colors.success} />
          <Text style={styles.featureText}>Priority service recommendations</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleStartTrial}>
        <Text style={styles.buttonText}>Start Free Trial - 3 Days</Text>
      </TouchableOpacity>

      <Text style={styles.disclaimer}>No credit card required</Text>
    </View>
  );
}

/**
 * Banner shown during active trial
 */
export function TrialBanner() {
  const isTrialActive = useIsTrialActive();
  const daysRemaining = useTrialDaysRemaining();

  if (!isTrialActive) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Icon name="time-outline" size={16} color={colors.accent} />
      <Text style={styles.bannerText}>
        {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} left in your free trial
      </Text>
      <TouchableOpacity style={styles.upgradeButton}>
        <Text style={styles.upgradeButtonText}>Upgrade</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Paywall shown after trial expires
 */
export function TrialExpiredCard() {
  const trialState = useTrialState();
  const isTrialActive = useIsTrialActive();
  const hasSubscription = useAskCarebowStore((state) => state.hasSubscription);

  // Don't show if has subscription or trial is still active
  if (hasSubscription || isTrialActive || !trialState.hasUsedTrial) {
    return null;
  }

  return (
    <View style={styles.paywallCard}>
      <View style={styles.paywallHeader}>
        <Icon name="lock-closed" size={32} color={colors.textTertiary} />
        <Text style={styles.paywallTitle}>Premium Feature</Text>
      </View>

      <Text style={styles.paywallDescription}>
        Your trial has ended. Unlock full triage reports, care plans, and unlimited questions.
      </Text>

      <TouchableOpacity style={styles.subscribeButton}>
        <Text style={styles.subscribeButtonText}>Subscribe - $20/month</Text>
      </TouchableOpacity>

      <Text style={styles.paywallNote}>
        You can still ask 1 basic question per day for free
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Full card styles
  card: {
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    color: colors.accent,
    flex: 1,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
  },
  features: {
    gap: spacing.xs,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  featureText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  button: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    ...shadows.button,
  },
  buttonText: {
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.sm,
  },
  compactIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactContent: {
    flex: 1,
  },
  compactTitle: {
    ...typography.label,
    color: colors.accent,
  },
  compactSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },

  // Banner styles
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accentSoft,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    gap: spacing.xs,
  },
  bannerText: {
    ...typography.caption,
    color: colors.accent,
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  upgradeButtonText: {
    ...typography.tiny,
    color: colors.textInverse,
  },

  // Paywall styles
  paywallCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.md,
    ...shadows.card,
  },
  paywallHeader: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  paywallTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  paywallDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  subscribeButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    ...shadows.button,
  },
  subscribeButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
  paywallNote: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },
});

export default TrialSignupCard;
