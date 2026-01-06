/**
 * CareBow Subscription Plans
 * USD-only pricing with explicit plan benefits
 */

import { colors } from '@/theme';

// =============================================================================
// SUBSCRIPTION PLAN TYPES
// =============================================================================

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';

export type SubscriptionPlan = {
  id: string;
  title: string;
  description: string;
  price: number; // USD
  billingPeriod: 'monthly' | 'half_yearly' | 'yearly';
  periodLabel: string;
  pricePerMonth: number; // calculated for comparison
  benefits: string[];
  excludes?: string[];
  badge?: string;
  highlight?: boolean;
  ctaLabel: string;
  iconName: string;
  iconColor: string;
  iconBgColor: string;
};

export type UserSubscription = {
  id: string;
  planId: string;
  userId: string;
  status: SubscriptionStatus;
  startDate: string; // ISO date
  endDate: string; // ISO date
  autoRenew: boolean;
  paymentMethod?: string;
  lastPaymentDate?: string;
  nextBillingDate?: string;
  createdAt: string;
  updatedAt: string;
};

// =============================================================================
// SUBSCRIPTION PLANS (USD PRICING)
// =============================================================================

export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'ask_carebow',
    title: 'Ask CareBow',
    description: 'AI-powered health guidance at your fingertips',
    price: 20,
    billingPeriod: 'monthly',
    periodLabel: 'Per Month',
    pricePerMonth: 20,
    benefits: [
      'Unlimited AI symptom checks',
      'Personalized care recommendations',
      'Priority AI responses',
      '24/7 health guidance',
      'Health insights & tips',
    ],
    excludes: [
      'Human service consultations',
      'In-home visits',
      'Medical equipment rental',
    ],
    ctaLabel: 'Subscribe',
    iconName: 'chatbubbles',
    iconColor: colors.accent,
    iconBgColor: colors.accentSoft,
  },
  {
    id: 'monthly_care',
    title: 'Monthly Care',
    description: 'Essential healthcare access for individuals',
    price: 30,
    billingPeriod: 'monthly',
    periodLabel: 'Per Month',
    pricePerMonth: 30,
    benefits: [
      'Access to all services',
      'Standard booking support',
      'Email & chat support',
      '5% discount on services',
    ],
    ctaLabel: 'Choose Plan',
    iconName: 'calendar',
    iconColor: colors.info,
    iconBgColor: colors.infoSoft,
  },
  {
    id: 'half_yearly_care',
    title: 'Half-Yearly Care',
    description: 'Better value with priority support',
    price: 150,
    billingPeriod: 'half_yearly',
    periodLabel: '6 Months',
    pricePerMonth: 25,
    benefits: [
      'Access to all services',
      'Priority booking support',
      'Phone, email & chat support',
      '10% discount on services',
      'Flexible rescheduling',
    ],
    badge: 'Popular',
    highlight: true,
    ctaLabel: 'Choose Plan',
    iconName: 'shield-checkmark',
    iconColor: colors.secondary,
    iconBgColor: colors.secondarySoft,
  },
  {
    id: 'yearly_care',
    title: 'Yearly Care',
    description: 'Maximum savings with premium support',
    price: 300,
    billingPeriod: 'yearly',
    periodLabel: '12 Months',
    pricePerMonth: 25,
    benefits: [
      'Access to all services',
      'Priority booking support',
      'Dedicated care manager',
      '15% discount on services',
      'Preferred scheduling',
      'Free rescheduling anytime',
      'Family member add-ons',
    ],
    badge: 'Best Value',
    ctaLabel: 'Choose Plan',
    iconName: 'star',
    iconColor: colors.warning,
    iconBgColor: colors.warningSoft,
  },
];

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export function getPlanById(id: string): SubscriptionPlan | undefined {
  return subscriptionPlans.find((plan) => plan.id === id);
}

export function formatPlanPrice(plan: SubscriptionPlan): string {
  return `$${plan.price}`;
}

export function formatPlanPriceWithPeriod(plan: SubscriptionPlan): string {
  switch (plan.billingPeriod) {
    case 'monthly':
      return `$${plan.price}/month`;
    case 'half_yearly':
      return `$${plan.price}/6 months`;
    case 'yearly':
      return `$${plan.price}/year`;
    default:
      return `$${plan.price}`;
  }
}

export function calculateMonthlySavings(plan: SubscriptionPlan): number | null {
  const baseMonthlyRate = 30; // Monthly Care plan rate
  if (plan.billingPeriod === 'monthly') return null;
  const totalMonths = plan.billingPeriod === 'half_yearly' ? 6 : 12;
  const withoutDiscount = baseMonthlyRate * totalMonths;
  return withoutDiscount - plan.price;
}

export function getAISubscriptionPlan(): SubscriptionPlan {
  return subscriptionPlans.find((p) => p.id === 'ask_carebow')!;
}

export function getCarePlans(): SubscriptionPlan[] {
  return subscriptionPlans.filter((p) => p.id !== 'ask_carebow');
}

// =============================================================================
// SUBSCRIPTION VALIDATION
// =============================================================================

export function isSubscriptionActive(subscription: UserSubscription): boolean {
  if (subscription.status !== 'active') return false;
  const now = new Date();
  const endDate = new Date(subscription.endDate);
  return now < endDate;
}

export function daysUntilExpiry(subscription: UserSubscription): number {
  const now = new Date();
  const endDate = new Date(subscription.endDate);
  const diffTime = endDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
