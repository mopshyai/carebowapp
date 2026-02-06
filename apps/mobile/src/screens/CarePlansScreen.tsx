/**
 * CarePlansScreen
 * Displays CareBow subscription plans with pricing, features, and comparison
 * Following CareBow design system with USD-based pricing via formatPrice()
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'react-native-haptic-feedback';
import { useCurrencyStore } from '@/store';
import { AppIcon } from '@/components/icons/AppIcon';
import type { IconName } from '@/components/icons/iconMap';
import { colors, spacing, radius, shadows, typography } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// =============================================================================
// PLAN DATA (USD Pricing from Spec)
// =============================================================================

const CARE_PLANS = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    tagline: 'Best for short-term',
    priceUSD: 30,
    originalPriceUSD: null,
    billingPeriod: 'month',
    discount: 0,
    description: 'Perfect for those looking for immediate and short-term care solutions.',
    features: [
      'Weekly check-in calls and wellbeing monitoring',
      'Weekly wellbeing updates shared with family',
      'Medication reminders and routine follow-ups',
      'Access to local caregivers and companions',
      'Doctor appointment scheduling',
      'Emergency support coordination',
      'Dedicated CareBow coordinator',
    ],
    checkInFrequency: 'Once a Week',
    familyUpdateFrequency: 'Once a Week',
    has24x7Support: false,
    hasAssistedVisits: false,
    hasCoordinator: true,
    color: '#0D4F52',
    colorSoft: '#CCFBF1',
    iconName: 'calendar' as IconName,
  },
  {
    id: 'half_yearly',
    name: '6-Month Plan',
    tagline: 'Most popular',
    priceUSD: 150,
    originalPriceUSD: 180,
    billingPeriod: '6 months',
    discount: 17,
    isPopular: true,
    description: 'Perfect for families seeking consistent care and exclusive health access.',
    features: [
      'Everything in Monthly Plan +',
      'Priority doctor visit coordination',
      'Dedicated care coordinator for daily needs',
      'Fortnightly detailed care reports',
      'Assisted medical visits when required',
      'Ongoing health monitoring and follow-ups',
      'Twice a week check-in calls',
      '24/7 access to care support',
    ],
    checkInFrequency: 'Twice a Week',
    familyUpdateFrequency: 'Twice a Week',
    has24x7Support: true,
    hasAssistedVisits: true,
    hasCoordinator: true,
    color: '#8B5CF6',
    colorSoft: '#EDE9FE',
    iconName: 'star-filled' as IconName,
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    tagline: 'Best value',
    priceUSD: 300,
    originalPriceUSD: 360,
    billingPeriod: 'year',
    discount: 17,
    isBestValue: true,
    description: 'Ideal for families seeking comprehensive, long-term support.',
    features: [
      'All 6-month benefits +',
      'Daily check-in calls and wellbeing monitoring',
      'Daily wellbeing updates shared with family',
      'Monthly care summary with notes and updates',
      'Priority emergency support coordination',
    ],
    checkInFrequency: 'Daily',
    familyUpdateFrequency: 'Daily',
    has24x7Support: true,
    hasAssistedVisits: true,
    hasCoordinator: true,
    color: '#EA580C',
    colorSoft: '#FFEDD5',
    iconName: 'trophy' as IconName,
  },
];

// =============================================================================
// ANIMATED PRESSABLE
// =============================================================================

const AnimatedPressable = ({ children, onPress, style, delay = 0 }: any) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 150 });
        Haptics.trigger('impactLight');
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }}
      onPress={onPress}
    >
      <Animated.View
        entering={FadeInDown.delay(delay).springify()}
        style={[animatedStyle, style]}
      >
        {children}
      </Animated.View>
    </Pressable>
  );
};

// =============================================================================
// HEADER
// =============================================================================

const Header = ({ onBack }: { onBack: () => void }) => (
  <Animated.View entering={FadeInDown.delay(50).springify()} style={styles.header}>
    <Pressable
      style={styles.backButton}
      onPress={() => {
        Haptics.trigger('impactLight');
        onBack();
      }}
    >
      <Text style={styles.backIcon}>←</Text>
    </Pressable>
    <Text style={styles.headerTitle}>Care Plans</Text>
    <View style={styles.headerSpacer} />
  </Animated.View>
);

// =============================================================================
// HERO SECTION
// =============================================================================

const HeroSection = ({ formatPrice }: { formatPrice: (amount: number) => string }) => (
  <Animated.View entering={FadeInDown.delay(100).springify()}>
    <LinearGradient
      colors={['#0D4F52', '#14B8A6']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.hero}
    >
      {/* Decorative circles */}
      <View style={[styles.heroCircle, { width: 200, height: 200, top: -60, right: -60 }]} />
      <View style={[styles.heroCircle, { width: 100, height: 100, bottom: -30, left: -30 }]} />

      <Text style={styles.heroTitle}>
        Experience Transparent,{'\n'}Stress-Free Care
      </Text>
      <Text style={styles.heroSubtitle}>
        CareBow makes senior care simple, reliable, and completely transparent.
        No hidden fees, no confusing packages — just flexible support designed
        around your parents' needs.
      </Text>

      <View style={styles.heroHighlights}>
        <View style={styles.highlightRow}>
          <Text style={styles.highlightCheck}>✓</Text>
          <Text style={styles.highlightText}>You only pay for the services you use</Text>
        </View>
        <View style={styles.highlightRow}>
          <Text style={styles.highlightCheck}>✓</Text>
          <Text style={styles.highlightText}>Clear pricing. Zero surprises.</Text>
        </View>
        <View style={styles.highlightRow}>
          <Text style={styles.highlightCheck}>✓</Text>
          <Text style={styles.highlightText}>Total peace of mind.</Text>
        </View>
      </View>
    </LinearGradient>
  </Animated.View>
);

// =============================================================================
// VALUE PROPOSITION
// =============================================================================

const ValueProposition = ({ formatPrice }: { formatPrice: (amount: number) => string }) => (
  <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.valueProp}>
    <Text style={styles.valuePropText}>
      Plans starting at{' '}
      <Text style={styles.valuePropHighlight}>{formatPrice(30)}/month</Text>
    </Text>
  </Animated.View>
);

// =============================================================================
// PLAN CARD
// =============================================================================

const PlanCard = ({
  plan,
  formatPrice,
  onPress,
  delay,
}: {
  plan: typeof CARE_PLANS[0];
  formatPrice: (amount: number) => string;
  onPress: () => void;
  delay: number;
}) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()}>
    <AnimatedPressable style={styles.planCard} onPress={onPress}>
      {/* Accent bar */}
      <View style={[styles.planAccentBar, { backgroundColor: plan.color }]} />

      {/* Badges */}
      <View style={styles.badgeContainer}>
        {plan.isPopular && (
          <View style={[styles.badge, { backgroundColor: plan.color }]}>
            <Text style={styles.badgeText}>⭐ MOST POPULAR</Text>
          </View>
        )}
        {plan.isBestValue && (
          <View style={[styles.badge, { backgroundColor: '#10B981' }]}>
            <Text style={styles.badgeText}>💎 BEST VALUE</Text>
          </View>
        )}
        {plan.discount > 0 && (
          <View style={[styles.badge, { backgroundColor: '#10B981' }]}>
            <Text style={styles.badgeText}>{plan.discount}% OFF</Text>
          </View>
        )}
      </View>

      {/* Plan header */}
      <View style={styles.planHeader}>
        <View style={[styles.planIconContainer, { backgroundColor: plan.colorSoft }]}>
          <AppIcon name={plan.iconName} size={28} color={plan.color} />
        </View>
        <View style={styles.planTitleContainer}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planTagline}>{plan.tagline}</Text>
        </View>
      </View>

      {/* Price section */}
      <View style={styles.priceSection}>
        {plan.originalPriceUSD && (
          <Text style={styles.originalPrice}>{formatPrice(plan.originalPriceUSD)}</Text>
        )}
        <View style={styles.priceRow}>
          <Text style={[styles.price, { color: plan.color }]}>
            {formatPrice(plan.priceUSD)}
          </Text>
          <Text style={styles.pricePeriod}>/{plan.billingPeriod}</Text>
        </View>
      </View>

      {/* Description */}
      <Text style={styles.planDescription}>{plan.description}</Text>

      {/* Features */}
      <View style={styles.featuresContainer}>
        {plan.features.slice(0, 5).map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Text style={[styles.featureCheck, { color: plan.color }]}>✓</Text>
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
        {plan.features.length > 5 && (
          <Text style={[styles.moreFeatures, { color: plan.color }]}>
            +{plan.features.length - 5} more benefits
          </Text>
        )}
      </View>

      {/* CTA Button */}
      <View style={[styles.ctaButton, { backgroundColor: plan.color }]}>
        <Text style={styles.ctaText}>Choose Plan</Text>
      </View>
    </AnimatedPressable>
  </Animated.View>
);

// =============================================================================
// CUSTOM PLAN CARD
// =============================================================================

const CustomPlanCard = ({ onPress, delay }: { onPress: () => void; delay: number }) => (
  <Animated.View entering={FadeInDown.delay(delay).springify()}>
    <AnimatedPressable style={styles.customPlanCard} onPress={onPress}>
      <View style={styles.customPlanContainer}>
        {/* Icon */}
        <View style={styles.customPlanIconRow}>
          <View style={styles.customPlanIcon}>
            <AppIcon name="settings" size={26} color={colors.accent} />
          </View>
        </View>

        <Text style={styles.customPlanTitle}>Customize Your Plan</Text>
        <Text style={styles.customPlanDescription}>
          Create a plan that matches your family's exact needs — tailored services,
          personalized schedule, and flexible billing.
        </Text>

        <View style={styles.customFeatures}>
          <View style={styles.customFeatureRow}>
            <Text style={styles.customFeatureCheck}>✓</Text>
            <Text style={styles.customFeatureText}>Tailored services based on health condition</Text>
          </View>
          <View style={styles.customFeatureRow}>
            <Text style={styles.customFeatureCheck}>✓</Text>
            <Text style={styles.customFeatureText}>Personalized care schedule</Text>
          </View>
          <View style={styles.customFeatureRow}>
            <Text style={styles.customFeatureCheck}>✓</Text>
            <Text style={styles.customFeatureText}>Condition-specific caregiver matching</Text>
          </View>
          <View style={styles.customFeatureRow}>
            <Text style={styles.customFeatureCheck}>✓</Text>
            <Text style={styles.customFeatureText}>Flexible billing options</Text>
          </View>
          <View style={styles.customFeatureRow}>
            <Text style={styles.customFeatureCheck}>✓</Text>
            <Text style={styles.customFeatureText}>Choose your own check-in frequency</Text>
          </View>
        </View>

        <Pressable style={styles.customCtaButton} onPress={onPress}>
          <Text style={styles.customCtaText}>Talk to Care Expert</Text>
          <Text style={styles.customCtaArrow}>→</Text>
        </Pressable>
      </View>
    </AnimatedPressable>
  </Animated.View>
);

// =============================================================================
// COMPARISON TABLE
// =============================================================================

const ComparisonTable = ({ formatPrice }: { formatPrice: (amount: number) => string }) => {
  const features = [
    { name: 'Check-in Calls', monthly: 'Once a Week', sixMonth: 'Twice a Week', yearly: 'Daily' },
    { name: 'Family Updates', monthly: 'Once a Week', sixMonth: 'Twice a Week', yearly: 'Daily' },
    { name: '24/7 Support', monthly: false, sixMonth: true, yearly: true },
    { name: 'Assisted Visits', monthly: false, sixMonth: true, yearly: true },
    { name: 'Dedicated Coordinator', monthly: true, sixMonth: true, yearly: true },
  ];

  return (
    <Animated.View entering={FadeInDown.delay(700).springify()} style={styles.comparisonSection}>
      <Text style={styles.comparisonTitle}>Plan Comparison</Text>

      {/* Header row */}
      <View style={styles.comparisonHeader}>
        <View style={styles.comparisonFeatureCol}>
          <Text style={styles.comparisonHeaderText}>Feature</Text>
        </View>
        <View style={styles.comparisonPlanCol}>
          <Text style={styles.comparisonHeaderText}>Monthly</Text>
        </View>
        <View style={styles.comparisonPlanCol}>
          <Text style={styles.comparisonHeaderText}>6-Month</Text>
        </View>
        <View style={styles.comparisonPlanCol}>
          <Text style={styles.comparisonHeaderText}>Yearly</Text>
        </View>
      </View>

      {/* Feature rows */}
      {features.map((feature, index) => (
        <View
          key={feature.name}
          style={[
            styles.comparisonRow,
            index % 2 === 0 && styles.comparisonRowAlt,
          ]}
        >
          <View style={styles.comparisonFeatureCol}>
            <Text style={styles.comparisonFeatureName}>{feature.name}</Text>
          </View>
          <View style={styles.comparisonPlanCol}>
            {typeof feature.monthly === 'boolean' ? (
              <Text style={feature.monthly ? styles.checkIcon : styles.crossIcon}>
                {feature.monthly ? '✓' : '✗'}
              </Text>
            ) : (
              <Text style={styles.comparisonValue}>{feature.monthly}</Text>
            )}
          </View>
          <View style={styles.comparisonPlanCol}>
            {typeof feature.sixMonth === 'boolean' ? (
              <Text style={feature.sixMonth ? styles.checkIcon : styles.crossIcon}>
                {feature.sixMonth ? '✓' : '✗'}
              </Text>
            ) : (
              <Text style={styles.comparisonValue}>{feature.sixMonth}</Text>
            )}
          </View>
          <View style={styles.comparisonPlanCol}>
            {typeof feature.yearly === 'boolean' ? (
              <Text style={feature.yearly ? styles.checkIcon : styles.crossIcon}>
                {feature.yearly ? '✓' : '✗'}
              </Text>
            ) : (
              <Text style={styles.comparisonValue}>{feature.yearly}</Text>
            )}
          </View>
        </View>
      ))}
    </Animated.View>
  );
};

// =============================================================================
// MAIN SCREEN
// =============================================================================

export default function CarePlansScreen() {
  const navigation = useNavigation();
  const { formatPrice } = useCurrencyStore();

  const handleSelectPlan = (planId: string) => {
    Haptics.trigger('impactMedium');
    navigation.navigate('PlanDetails' as never, { id: planId } as never);
  };

  const handleCustomPlan = () => {
    Haptics.trigger('impactLight');
    // Navigate to custom plan builder or contact
    navigation.navigate('PlanDetails' as never, { id: 'custom' } as never);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header onBack={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <HeroSection formatPrice={formatPrice} />

        {/* Value Proposition */}
        <ValueProposition formatPrice={formatPrice} />

        {/* Section Title */}
        <Animated.View entering={FadeInDown.delay(250).springify()} style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          <Text style={styles.sectionSubtitle}>
            Select the plan that best fits your family's needs
          </Text>
        </Animated.View>

        {/* Plan Cards */}
        {CARE_PLANS.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            formatPrice={formatPrice}
            onPress={() => handleSelectPlan(plan.id)}
            delay={300 + index * 100}
          />
        ))}

        {/* Custom Plan Card */}
        <CustomPlanCard onPress={handleCustomPlan} delay={600} />

        {/* Comparison Table */}
        <ComparisonTable formatPrice={formatPrice} />

        {/* Bottom padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.card,
  },
  backIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 44,
  },

  // Hero
  hero: {
    borderRadius: radius.xxl,
    padding: spacing.xl,
    marginTop: spacing.md,
    overflow: 'hidden',
  },
  heroCircle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textInverse,
    marginBottom: spacing.sm,
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  heroHighlights: {
    gap: spacing.xs,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  highlightCheck: {
    fontSize: 14,
    color: '#10B981',
  },
  highlightText: {
    fontSize: 14,
    color: colors.textInverse,
    fontWeight: '500',
  },

  // Value Proposition
  valueProp: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  valuePropText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'center',
    lineHeight: 28,
  },
  valuePropHighlight: {
    color: '#0D4F52',
    fontWeight: '800',
    fontSize: 22,
  },

  // Section Header
  sectionHeader: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    marginBottom: spacing.xxs,
  },
  sectionSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  // Plan Card
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.card,
  },
  planAccentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.xs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textInverse,
    letterSpacing: 0.5,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  planIconContainer: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  planTitleContainer: {
    flex: 1,
  },
  planName: {
    ...typography.h3,
    marginBottom: 2,
  },
  planTagline: {
    ...typography.caption,
    color: colors.textTertiary,
  },

  // Price Section
  priceSection: {
    marginBottom: spacing.md,
  },
  originalPrice: {
    fontSize: 14,
    color: colors.textTertiary,
    textDecorationLine: 'line-through',
    marginBottom: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 32,
    fontWeight: '800',
  },
  pricePeriod: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  // Description
  planDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },

  // Features
  featuresContainer: {
    marginBottom: spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  featureCheck: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  featureText: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.textPrimary,
  },
  moreFeatures: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: spacing.xs,
  },

  // CTA Button
  ctaButton: {
    height: 52,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.button,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textInverse,
  },

  // Custom Plan Card
  customPlanCard: {
    marginBottom: spacing.xl,
  },
  customPlanContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.card,
  },
  customPlanIconRow: {
    marginBottom: spacing.md,
  },
  customPlanIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customPlanTitle: {
    ...typography.h3,
    marginBottom: spacing.xs,
  },
  customPlanDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  customFeatures: {
    marginBottom: spacing.md,
  },
  customFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  customFeatureCheck: {
    fontSize: 14,
    color: colors.accent,
    fontWeight: '700',
  },
  customFeatureText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
  },
  customCtaButton: {
    height: 52,
    borderRadius: radius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.accent,
    gap: spacing.xs,
    ...shadows.button,
  },
  customCtaText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textInverse,
  },
  customCtaArrow: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textInverse,
  },

  // Comparison Table
  comparisonSection: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    ...shadows.card,
  },
  comparisonTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  comparisonHeader: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  comparisonHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  comparisonRowAlt: {
    backgroundColor: colors.surface2,
  },
  comparisonFeatureCol: {
    flex: 1.5,
    justifyContent: 'center',
  },
  comparisonPlanCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  comparisonFeatureName: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  comparisonValue: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textSecondary,
    textAlign: 'center',
  },
  checkIcon: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '700',
  },
  crossIcon: {
    fontSize: 16,
    color: colors.textTertiary,
  },
});
