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
  price: number; // USD - discounted price
  originalPrice: number; // USD - original price before discount
  discountPercent: number; // e.g., 60 for 60% off
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
  rating: number; // star rating
  reviewCount: number; // number of reviews
  heroStyle: 'blue' | 'green' | 'gold'; // hero image style
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
    description: 'AI-powered health guidance at your fingertips. Get instant symptom assessments, personalized care recommendations, and 24/7 health guidance from our intelligent assistant. Includes a 7-day free trial.',
    price: 20,
    originalPrice: 30,
    discountPercent: 33,
    billingPeriod: 'monthly',
    periodLabel: 'AI ASSISTANT',
    pricePerMonth: 20,
    benefits: [
      'Unlimited AI symptom checks',
      'Personalized care recommendations',
      '24/7 AI health guidance',
      'Health insights & wellness tips',
      'Voice-enabled consultations',
      'Medication & lifestyle suggestions',
    ],
    excludes: [
      'Human service consultations',
      'In-home visits',
      'Medical equipment rental',
    ],
    badge: '7-Day Free Trial',
    highlight: true,
    ctaLabel: 'Start Free Trial',
    iconName: 'sparkles',
    iconColor: '#8B5CF6',
    iconBgColor: '#EDE9FE',
    rating: 4.5,
    reviewCount: 12,
    heroStyle: 'blue',
  },
  {
    id: 'monthly',
    title: 'Monthly Plan',
    description: 'Perfect for those looking for immediate and short-term care solutions. Get weekly check-ins, wellbeing monitoring, and access to local caregivers.',
    price: 30,
    originalPrice: 30,
    discountPercent: 0,
    billingPeriod: 'monthly',
    periodLabel: 'ONE MONTH',
    pricePerMonth: 30,
    benefits: [
      'Weekly check-in calls and wellbeing monitoring',
      'Weekly wellbeing updates shared with family',
      'Medication reminders and routine follow-ups',
      'Access to local caregivers and companions',
      'Doctor appointment scheduling',
      'Emergency support coordination',
      'Dedicated CareBow coordinator',
    ],
    ctaLabel: 'Subscribe',
    iconName: 'calendar',
    iconColor: '#3B82F6',
    iconBgColor: '#EFF6FF',
    rating: 4,
    reviewCount: 4,
    heroStyle: 'blue',
  },
  {
    id: 'half_yearly',
    title: '6-Month Plan',
    description: 'Perfect for families seeking consistent care and exclusive health access. Includes twice-weekly check-ins, priority doctor visits, and 24/7 care support.',
    price: 150,
    originalPrice: 180,
    discountPercent: 17,
    billingPeriod: 'half_yearly',
    periodLabel: 'SIX MONTH',
    pricePerMonth: 25,
    benefits: [
      'Everything in Monthly Plan',
      'Priority doctor visit coordination',
      'Dedicated care coordinator for daily needs',
      'Fortnightly detailed care reports',
      'Assisted medical visits when required',
      'Ongoing health monitoring and follow-ups',
      'Twice a week check-in calls',
      '24/7 access to care support',
    ],
    badge: 'Most Popular',
    ctaLabel: 'Subscribe',
    iconName: 'leaf',
    iconColor: '#22C55E',
    iconBgColor: '#F0FDF4',
    rating: 5,
    reviewCount: 5,
    heroStyle: 'green',
  },
  {
    id: 'yearly',
    title: 'Yearly Plan',
    description: 'Ideal for families seeking comprehensive, long-term support. Includes daily check-ins, daily family updates, and all benefits from the 6-Month Plan.',
    price: 300,
    originalPrice: 360,
    discountPercent: 17,
    billingPeriod: 'yearly',
    periodLabel: 'TWELVE MONTH',
    pricePerMonth: 25,
    benefits: [
      'All 6-Month Plan benefits',
      'Daily check-in calls and wellbeing monitoring',
      'Daily wellbeing updates shared with family',
      'Monthly care summary with notes and updates',
      'Priority emergency support coordination',
    ],
    badge: 'Best Value',
    ctaLabel: 'Subscribe',
    iconName: 'trophy',
    iconColor: '#F59E0B',
    iconBgColor: '#FFFBEB',
    rating: 5,
    reviewCount: 7,
    heroStyle: 'gold',
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

export function getSubscriptionPlansForHome(): SubscriptionPlan[] {
  // Return only the 3 main subscription plans (exclude Ask CareBow)
  return subscriptionPlans.filter((p) =>
    p.id === 'monthly' || p.id === 'half_yearly' || p.id === 'yearly'
  );
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
