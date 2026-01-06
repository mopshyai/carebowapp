/**
 * SubscriptionPlanDetails Screen
 * Displays detailed information about a subscription plan
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { StarRating } from '../components/ui/StarRating';
import { getPlanById } from '../data/services';
import { colors, spacing, radius, typography, shadows } from '../theme';

// TODO: Replace with actual plan images when available
const getPlanIcon = (imageKey: string): keyof typeof Ionicons.glyphMap => {
  const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
    one_month: 'calendar',
    six_month: 'calendar',
    twelve_month: 'calendar',
    ask_carebow: 'heart',
  };
  return iconMap[imageKey] || 'card';
};

const getPlanColor = (planId: string): string => {
  const colorMap: Record<string, string> = {
    monthly: '#3B82F6',
    half_yearly: '#8B5CF6',
    yearly: '#EC4899',
    ask_carebow: '#9333EA',
  };
  return colorMap[planId] || '#6B7280';
};

export default function PlanDetailsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();
  const { id } = (route.params as { id: string }) || {};

  const plan = getPlanById(id || '');

  if (!plan) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Plan not found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backLink}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const icon = getPlanIcon(plan.image);
  const color = getPlanColor(plan.id);
  const isAskCareBow = plan.id === 'ask_carebow';

  const handleSubscribe = () => {
    if (isAskCareBow) {
      // Navigate to Ask CareBow paywall or feature
      navigation.navigate('Ask');
    } else {
      // TODO: Navigate to payment/subscription flow
      console.log('Subscribe to:', plan.id);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plan Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={[styles.heroContainer, { backgroundColor: color }]}>
          <Icon name={icon} size={64} color={colors.white} />
          <Text style={styles.periodLabel}>{plan.periodLabel}</Text>
        </View>

        {/* Plan Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.planTitle}>{plan.title}</Text>
          <View style={styles.ratingRow}>
            <StarRating rating={plan.rating} size={16} />
            <Text style={styles.ratingText}>{plan.rating.toFixed(1)}</Text>
          </View>

          {plan.price !== null ? (
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.priceValue}>
                <Text style={styles.currency}>$</Text>
                {plan.price}
              </Text>
              <Text style={styles.priceNote}>
                {plan.id === 'monthly'
                  ? 'per month'
                  : plan.id === 'half_yearly'
                  ? 'for 6 months'
                  : plan.id === 'yearly'
                  ? 'for 12 months'
                  : 'per month'}
              </Text>
            </View>
          ) : (
            <View style={styles.priceContainer}>
              <Text style={styles.aiAccessLabel}>AI-Powered Health Assistant</Text>
            </View>
          )}
        </View>

        {/* Benefits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plan Benefits</Text>
          <View style={styles.benefitsList}>
            {plan.benefits?.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={[styles.benefitIcon, { backgroundColor: color }]}>
                  <Icon name="checkmark" size={14} color={colors.white} />
                </View>
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Additional Info */}
        {!isAskCareBow && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscription Terms</Text>
            <View style={styles.termsCard}>
              <View style={styles.termRow}>
                <Text style={styles.termLabel}>Billing</Text>
                <Text style={styles.termValue}>
                  {plan.id === 'monthly'
                    ? 'Monthly'
                    : plan.id === 'half_yearly'
                    ? 'Every 6 months'
                    : 'Annually'}
                </Text>
              </View>
              <View style={styles.termRow}>
                <Text style={styles.termLabel}>Auto-renewal</Text>
                <Text style={styles.termValue}>Yes</Text>
              </View>
              <View style={styles.termRow}>
                <Text style={styles.termLabel}>Cancel anytime</Text>
                <Text style={styles.termValue}>Yes</Text>
              </View>
            </View>
          </View>
        )}

        {isAskCareBow && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <View style={styles.howItWorksCard}>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Describe your symptoms</Text>
                  <Text style={styles.stepDescription}>
                    Tell CareBow what you're experiencing in your own words.
                  </Text>
                </View>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Get AI guidance</Text>
                  <Text style={styles.stepDescription}>
                    Receive personalized health insights and recommendations.
                  </Text>
                </View>
              </View>
              <View style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Take action</Text>
                  <Text style={styles.stepDescription}>
                    Book services or consult professionals based on your needs.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Subscribe Button */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={[styles.subscribeButton, { backgroundColor: color }]}
          onPress={handleSubscribe}
        >
          <Text style={styles.subscribeButtonText}>
            {isAskCareBow ? 'Unlock Ask CareBow' : 'Subscribe Now'}
          </Text>
          <Icon name="arrow-forward" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 40,
  },
  backLink: {
    ...typography.body,
    color: colors.accent,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  heroContainer: {
    height: 180,
    borderRadius: radius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  periodLabel: {
    ...typography.label,
    color: colors.white,
    marginTop: spacing.xs,
    opacity: 0.9,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  planTitle: {
    ...typography.h1,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  ratingText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.warning,
  },
  priceContainer: {
    alignItems: 'center',
  },
  priceLabel: {
    ...typography.tiny,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  priceValue: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  currency: {
    fontSize: 24,
    fontWeight: '500',
  },
  priceNote: {
    ...typography.caption,
    color: colors.textTertiary,
    marginTop: spacing.xxs,
  },
  aiAccessLabel: {
    ...typography.label,
    color: colors.accent,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  benefitsList: {
    gap: spacing.sm,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  benefitIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  termsCard: {
    backgroundColor: colors.surface2,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.card,
  },
  termRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    rowGap: spacing.xxs,
    columnGap: spacing.sm,
  },
  termLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  termValue: {
    ...typography.caption,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  howItWorksCard: {
    backgroundColor: colors.surface2,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.lg,
    ...shadows.card,
  },
  stepItem: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.xxs,
  },
  stepDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.card,
  },
  subscribeButton: {
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  subscribeButtonText: {
    ...typography.label,
    fontWeight: '600',
    color: colors.white,
  },
});
