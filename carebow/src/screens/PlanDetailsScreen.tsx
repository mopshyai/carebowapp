/**
 * Subscription Plan Details Screen
 * Premium healthcare plan details with duotone icons
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StarRating } from '../components/ui/StarRating';
import { AppIcon, IconContainer, IconName } from '../components/icons';
import { getPlanById, SubscriptionPlan } from '../data/subscriptions';
import { colors, spacing, radius, typography, shadows } from '../theme';

// Hero background colors based on plan style
const getHeroColors = (style: string) => {
  switch (style) {
    case 'blue':
      return {
        bg: '#EFF6FF',
        accent: '#3B82F6',
        circle: '#DBEAFE',
      };
    case 'green':
      return {
        bg: '#ECFDF5',
        accent: '#10B981',
        circle: '#D1FAE5',
      };
    case 'gold':
      return {
        bg: '#1F2937',
        accent: '#F59E0B',
        circle: '#374151',
      };
    default:
      return {
        bg: '#F5F3FF',
        accent: '#8B5CF6',
        circle: '#EDE9FE',
      };
  }
};

// Get plan icon
const getPlanIcon = (planId: string): { icon: IconName; color: string; bgColor: string } => {
  switch (planId) {
    case 'ask_carebow':
      return { icon: 'sparkles', color: '#8B5CF6', bgColor: '#EDE9FE' };
    case 'monthly':
      return { icon: 'calendar', color: '#3B82F6', bgColor: '#DBEAFE' };
    case 'half_yearly':
      return { icon: 'leaf', color: '#22C55E', bgColor: '#DCFCE7' };
    case 'yearly':
      return { icon: 'trophy', color: '#F59E0B', bgColor: '#FEF3C7' };
    default:
      return { icon: 'calendar', color: colors.accent, bgColor: colors.accentSoft };
  }
};

// Floating service icons for decoration
const FLOATING_ICONS: { icon: IconName; position: any }[] = [
  { icon: 'nurse', position: { top: 40, left: 40 } },
  { icon: 'stethoscope', position: { top: 50, right: 50 } },
  { icon: 'transport', position: { top: '45%', left: 30 } },
  { icon: 'lab', position: { top: '45%', right: 30 } },
  { icon: 'yoga', position: { bottom: 80, left: 50 } },
  { icon: 'food', position: { bottom: 80, right: 50 } },
];

// Hero component with styled graphics
const PlanHero = ({ plan }: { plan: SubscriptionPlan }) => {
  const heroColors = getHeroColors(plan.heroStyle);
  const planIcon = getPlanIcon(plan.id);
  const isGold = plan.heroStyle === 'gold';

  return (
    <View style={[styles.heroContainer, { backgroundColor: heroColors.bg }]}>
      {/* Central circle with icon */}
      <View style={[styles.heroCircle, { backgroundColor: heroColors.circle }]}>
        <IconContainer
          size="xl"
          variant="soft"
          backgroundColor={planIcon.bgColor}
          withShadow={Platform.OS === 'ios'}
        >
          <AppIcon name={planIcon.icon} size={40} color={planIcon.color} fillOpacity={0.25} />
        </IconContainer>
      </View>

      {/* Floating icons around */}
      {FLOATING_ICONS.map((item, index) => (
        <View
          key={index}
          style={[styles.floatingIcon, item.position, { opacity: 0.6 }]}
        >
          <AppIcon name={item.icon} size={18} color={heroColors.accent} fillOpacity={0.15} />
        </View>
      ))}

      {/* Period label */}
      <View style={styles.periodLabelContainer}>
        <Text style={[styles.periodLabel, { color: isGold ? '#F59E0B' : '#374151' }]}>
          {plan.periodLabel}
        </Text>
        <Text style={[styles.subscriptionText, { color: isGold ? '#F59E0B' : '#6B7280' }]}>
          SUBSCRIPTION PLAN
        </Text>
      </View>
    </View>
  );
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
        <View style={styles.errorContainer}>
          <AppIcon name="info" size={64} color={colors.textTertiary} />
          <Text style={styles.errorText}>Plan not found</Text>
          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()}>
            <Text style={styles.backLinkText}>Go back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleSubscribe = () => {
    navigation.navigate('Checkout' as never);
  };

  const planIcon = getPlanIcon(plan.id);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={plan.heroStyle === 'gold' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AppIcon name="chevron-left" size={24} color={colors.textPrimary} />
          <Text style={styles.backText}>Plans</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Plan Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 140 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Image */}
        <PlanHero plan={plan} />

        {/* Plan Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.planTitle}>{plan.title}</Text>

          {/* Star Rating */}
          <View style={styles.ratingRow}>
            <StarRating rating={plan.rating} size={18} />
            <Text style={styles.reviewCount}>({plan.reviewCount} reviews)</Text>
          </View>

          {/* Benefits */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>What's included</Text>
            {plan.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitRow}>
                <AppIcon name="check-circle" size={18} color={colors.success} fillOpacity={0.2} />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Excludes */}
          {plan.excludes && plan.excludes.length > 0 && (
            <View style={styles.excludesSection}>
              <Text style={styles.excludesTitle}>Not included</Text>
              {plan.excludes.map((item, index) => (
                <View key={index} style={styles.excludeRow}>
                  <AppIcon name="close" size={16} color={colors.textTertiary} />
                  <Text style={styles.excludeText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Description */}
          <Text style={styles.description}>{plan.description}</Text>
        </View>
      </ScrollView>

      {/* Bottom Subscribe Bar */}
      <View style={[
        styles.bottomBar,
        { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        Platform.OS === 'ios' && styles.bottomBarIOS,
        Platform.OS === 'android' && styles.bottomBarAndroid,
      ]}>
        <View style={styles.priceSection}>
          {/* Discount Badge */}
          <View style={[styles.discountBadge, { backgroundColor: planIcon.color }]}>
            <Text style={styles.discountText}>{plan.discountPercent}%</Text>
          </View>

          {/* Price with proper baseline alignment */}
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.priceSymbol}>$</Text>
              <Text style={styles.currentPrice}>{plan.price}</Text>
              <Text style={styles.pricePeriod}>
                /{plan.billingPeriod === 'monthly' ? 'mo' : plan.billingPeriod === 'yearly' ? 'yr' : '6mo'}
              </Text>
            </View>
            <Text style={styles.originalPrice}>${plan.originalPrice}</Text>
          </View>
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[styles.subscribeButton, { borderColor: planIcon.color }]}
          onPress={handleSubscribe}
          activeOpacity={0.8}
        >
          <Text style={[styles.subscribeButtonText, { color: planIcon.color }]}>Subscribe</Text>
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
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    ...typography.body,
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  placeholder: {
    width: 80,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  errorText: {
    ...typography.h3,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  backLink: {
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
  },
  backLinkText: {
    ...typography.label,
    color: colors.white,
  },

  // Hero Styles
  heroContainer: {
    height: 280,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  heroCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  floatingIcon: {
    position: 'absolute',
  },
  periodLabelContainer: {
    position: 'absolute',
    bottom: 24,
    alignItems: 'center',
  },
  periodLabel: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subscriptionText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 4,
  },

  // Info Section
  infoContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  planTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    letterSpacing: -0.3,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  reviewCount: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: 4,
  },

  // Benefits
  benefitsSection: {
    marginBottom: spacing.lg,
  },
  benefitsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
    paddingVertical: 4,
  },
  benefitText: {
    ...typography.body,
    color: colors.textSecondary,
    flex: 1,
  },

  // Excludes
  excludesSection: {
    marginBottom: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  excludesTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },
  excludeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
    paddingVertical: 2,
  },
  excludeText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    flex: 1,
  },

  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: '#1F2937',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bottomBarIOS: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  bottomBarAndroid: {
    elevation: 16,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  discountBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  discountText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
  priceContainer: {
    flexDirection: 'column',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceSymbol: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  currentPrice: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.white,
  },
  pricePeriod: {
    fontSize: 14,
    color: '#9CA3AF',
    marginLeft: 2,
  },
  originalPrice: {
    fontSize: 13,
    color: '#6B7280',
    textDecorationLine: 'line-through',
  },
  subscribeButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  subscribeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
