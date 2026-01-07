/**
 * SubscriptionGate Component
 * Shows when user has exceeded free questions and needs to subscribe
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';

interface SubscriptionGateProps {
  freeQuestionsUsed: number;
  maxFreeQuestions: number;
  onSubscribe: () => void;
  onViewPlans: () => void;
}

export function SubscriptionGate({
  freeQuestionsUsed,
  maxFreeQuestions,
  onSubscribe,
  onViewPlans,
}: SubscriptionGateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon name="sparkles" size={32} color={colors.accent} />
      </View>

      <Text style={styles.title}>Unlock Unlimited Health Guidance</Text>

      <Text style={styles.description}>
        You've used {freeQuestionsUsed} of {maxFreeQuestions} free questions. Subscribe to Ask
        CareBow for unlimited personalized health guidance.
      </Text>

      <View style={styles.features}>
        <FeatureItem icon="chatbubbles" text="Unlimited health consultations" />
        <FeatureItem icon="time" text="24/7 AI health assistant" />
        <FeatureItem icon="shield-checkmark" text="Personalized guidance" />
        <FeatureItem icon="medkit" text="Service recommendations" />
      </View>

      <View style={styles.pricing}>
        <Text style={styles.price}>$20</Text>
        <Text style={styles.pricePeriod}>/month</Text>
      </View>

      <TouchableOpacity style={styles.subscribeButton} onPress={onSubscribe} activeOpacity={0.8}>
        <Icon name="sparkles" size={20} color={colors.textInverse} />
        <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.viewPlansButton} onPress={onViewPlans} activeOpacity={0.7}>
        <Text style={styles.viewPlansButtonText}>View All Plans</Text>
      </TouchableOpacity>
    </View>
  );
}

interface FeatureItemProps {
  icon: string;
  text: string;
}

function FeatureItem({ icon, text }: FeatureItemProps) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Icon name={icon} size={16} color={colors.accent} />
      </View>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    margin: spacing.md,
    alignItems: 'center',
    ...shadows.cardElevated,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  features: {
    alignSelf: 'stretch',
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: radius.xs,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  featureText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  pricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  price: {
    ...typography.displayMedium,
    color: colors.accent,
  },
  pricePeriod: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.xxs,
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignSelf: 'stretch',
    gap: spacing.xs,
    ...shadows.button,
  },
  subscribeButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
  viewPlansButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  viewPlansButtonText: {
    ...typography.label,
    color: colors.accent,
  },
});
