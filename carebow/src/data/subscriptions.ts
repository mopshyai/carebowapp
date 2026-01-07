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
    description: 'AI-powered health guidance at your fingertips. Get instant symptom assessments, personalized care recommendations, and 24/7 health guidance from our intelligent assistant.',
    price: 20,
    originalPrice: 30,
    discountPercent: 33,
    billingPeriod: 'monthly',
    periodLabel: 'AI ASSISTANT',
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
    badge: 'AI Powered',
    highlight: true,
    ctaLabel: 'Subscribe',
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
    description: 'The elderly care subscription program offers users the flexibility to access a wide range of services, including medical care, housekeeping, transportation, lab tests, yoga, and food services. However, the subscription itself does not include any bundled services or benefits. Instead, it provides members with the ability to purchase individual services as needed.',
    price: 30,
    originalPrice: 50,
    discountPercent: 40,
    billingPeriod: 'monthly',
    periodLabel: 'ONE MONTH',
    pricePerMonth: 30,
    benefits: [
      'Access to all services',
      'Standard booking support',
      'Email & chat support',
      '5% discount on services',
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
    title: 'Half Yearly Plan',
    description: 'By subscribing, users gain access to the service platform, allowing them to choose and pay for only the services they require, when they require them. This model offers a personalized approach, ensuring users have the freedom to select and pay for each service based on their unique needs, without being locked into a predetermined plan or package. The subscription acts as a key to unlock access, giving users full control over their care options.',
    price: 150,
    originalPrice: 180,
    discountPercent: 17,
    billingPeriod: 'half_yearly',
    periodLabel: 'SIX MONTH',
    pricePerMonth: 25,
    benefits: [
      'Access to all services',
      'Priority booking support',
      'Phone, email & chat support',
      '10% discount on services',
      'Flexible rescheduling',
    ],
    badge: 'Popular',
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
    description: 'In your elderly care program, the subscription model serves as a membership that grants users the ability to access and purchase individual services, such as medical care, house care, transportation, lab testing, yoga, and food services. Rather than including any services or benefits within the subscription itself, users pay a recurring fee simply to be part of the program.',
    price: 300,
    originalPrice: 360,
    discountPercent: 17,
    billingPeriod: 'yearly',
    periodLabel: 'TWELVE MONTH',
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
