/**
 * CareBow Data Catalog
 * Real, data-driven content with USD pricing
 */

import { colors } from '@/theme';

// =============================================================================
// CURRENCY CONSTANT
// =============================================================================

export const CURRENCY = {
  symbol: '$',
  code: 'USD',
} as const;

// =============================================================================
// QUICK PICK ITEMS (Today Screen)
// =============================================================================

export type QuickPickItem = {
  id: string;
  title: string;
  subtitle: string;
  tag: 'Available' | 'Popular' | 'Verified' | '24/7';
  tagColor: string;
  icon: string;
  iconColor: string;
  iconBgColor: string;
  screen: string;
  params?: Record<string, string>;
  serviceId?: string;
  categoryFilter?: string;
  availabilityHint: string;
  nextSlot?: string;
  priceHint?: string;
};

export const quickPickItems: QuickPickItem[] = [
  {
    id: 'doctor-visit',
    title: 'Doctor Visit',
    subtitle: 'At-home consultation',
    tag: 'Available',
    tagColor: colors.success,
    icon: 'medical',
    iconColor: colors.medical,
    iconBgColor: colors.medicalSoft,
    screen: 'ServiceDetails',
    params: { id: 'doctor-home-visit' },
    serviceId: 'doctor-home-visit',
    availabilityHint: 'Available today',
    nextSlot: '4:30 PM',
    priceHint: 'From $50',
  },
  {
    id: 'lab-testing',
    title: 'Lab Tests',
    subtitle: 'Home sample collection',
    tag: 'Popular',
    tagColor: colors.info,
    icon: 'flask',
    iconColor: colors.lab,
    iconBgColor: colors.labSoft,
    screen: 'Services',
    params: { category: 'diagnostics' },
    categoryFilter: 'diagnostics',
    availabilityHint: '200+ tests available',
    priceHint: 'From $15',
  },
  {
    id: 'nurse-home',
    title: 'Nursing Care',
    subtitle: 'Professional nurses',
    tag: '24/7',
    tagColor: colors.accent,
    icon: 'heart',
    iconColor: colors.nursing,
    iconBgColor: colors.nursingSoft,
    screen: 'Services',
    params: { category: 'nursing' },
    categoryFilter: 'nursing',
    availabilityHint: '24/7 availability',
    priceHint: 'From $20/4hr',
  },
];

// =============================================================================
// MEDICAL EQUIPMENT RENTAL (Today Screen) - USD PRICING
// =============================================================================

export type DeviceBadge = {
  label: string;
  type: 'default' | 'highlight' | 'info';
};

export type DeviceItem = {
  id: string;
  title: string;
  badges: DeviceBadge[];
  ctaLabel: string;
  pricingModel: 'daily' | 'weekly' | 'monthly';
  pricePerUnit: number; // USD
  priceUnit: string;
  icon: string;
  screen: string;
  params?: Record<string, string>;
  deliveryTime: string;
  minRentalDays: number;
};

export const deviceItems: DeviceItem[] = [
  {
    id: 'oxygen-concentrator',
    title: 'Oxygen Concentrator',
    badges: [
      { label: 'Free delivery', type: 'info' },
      { label: 'Setup included', type: 'highlight' },
    ],
    ctaLabel: 'Rent now',
    pricingModel: 'monthly',
    pricePerUnit: 89,
    priceUnit: '/month',
    icon: 'fitness-outline',
    screen: 'ServiceDetails',
    params: { id: 'oxygen-concentrator' },
    deliveryTime: 'Same day',
    minRentalDays: 7,
  },
  {
    id: 'bipap-machine',
    title: 'BiPAP Machine',
    badges: [
      { label: 'Free delivery', type: 'info' },
      { label: 'Training included', type: 'highlight' },
    ],
    ctaLabel: 'Rent now',
    pricingModel: 'monthly',
    pricePerUnit: 99,
    priceUnit: '/month',
    icon: 'pulse-outline',
    screen: 'ServiceDetails',
    params: { id: 'bipap-machine' },
    deliveryTime: 'Next day',
    minRentalDays: 30,
  },
  {
    id: 'cpap-machine',
    title: 'CPAP Machine',
    badges: [
      { label: 'Free delivery', type: 'info' },
      { label: 'Setup included', type: 'highlight' },
    ],
    ctaLabel: 'Rent now',
    pricingModel: 'monthly',
    pricePerUnit: 79,
    priceUnit: '/month',
    icon: 'cloud-outline',
    screen: 'ServiceDetails',
    params: { id: 'cpap-machine' },
    deliveryTime: 'Next day',
    minRentalDays: 30,
  },
  {
    id: 'cardiac-monitor',
    title: 'Cardiac Monitor',
    badges: [
      { label: 'Real-time alerts', type: 'highlight' },
      { label: 'Free delivery', type: 'info' },
    ],
    ctaLabel: 'Rent now',
    pricingModel: 'monthly',
    pricePerUnit: 69,
    priceUnit: '/month',
    icon: 'heart-outline',
    screen: 'ServiceDetails',
    params: { id: 'cardiac-monitor' },
    deliveryTime: 'Same day',
    minRentalDays: 7,
  },
  {
    id: 'hospital-bed',
    title: 'Hospital Bed',
    badges: [
      { label: 'Free delivery', type: 'info' },
      { label: 'Assembly included', type: 'highlight' },
    ],
    ctaLabel: 'Rent now',
    pricingModel: 'monthly',
    pricePerUnit: 79,
    priceUnit: '/month',
    icon: 'bed-outline',
    screen: 'ServiceDetails',
    params: { id: 'hospital-bed' },
    deliveryTime: 'Next day',
    minRentalDays: 30,
  },
];

// =============================================================================
// HEALTH PACKAGES (Today Screen) - USD PRICING
// =============================================================================

export type PackageIncludedItem = {
  name: string;
  count?: number;
};

export type CarePackageItem = {
  id: string;
  title: string;
  subtitle: string;
  included: PackageIncludedItem[];
  includedCount: number;
  startingPrice: number; // USD
  icon: string;
  iconColor: string;
  iconBgColor: string;
  screen: string;
  params?: Record<string, string>;
  popular?: boolean;
};

export const carePackageItems: CarePackageItem[] = [
  {
    id: 'cardiac-package',
    title: 'Cardiac Package',
    subtitle: 'Complete heart health',
    included: [
      { name: 'ECG', count: 1 },
      { name: 'Lipid Profile' },
      { name: 'Echo (if needed)' },
      { name: 'Cardiologist consult', count: 1 },
    ],
    includedCount: 12,
    startingPrice: 149,
    icon: 'heart',
    iconColor: '#EF4444',
    iconBgColor: '#FEE2E2',
    screen: 'ServiceDetails',
    params: { id: 'cardiac-package' },
    popular: true,
  },
  {
    id: 'full-body-checkup',
    title: 'Full Body Checkup',
    subtitle: 'Includes tests + consult',
    included: [
      { name: 'CBC, LFT, KFT' },
      { name: 'Thyroid Profile' },
      { name: 'Vitamin Panel' },
      { name: 'Physician consult', count: 1 },
    ],
    includedCount: 78,
    startingPrice: 99,
    icon: 'body',
    iconColor: colors.accent,
    iconBgColor: colors.accentSoft,
    screen: 'ServiceDetails',
    params: { id: 'full-body-checkup' },
  },
  {
    id: 'diabetes-care',
    title: 'Diabetes Care',
    subtitle: 'Monitor & manage',
    included: [
      { name: 'HbA1c' },
      { name: 'Fasting Glucose' },
      { name: 'Post Prandial' },
      { name: 'Diabetologist consult', count: 1 },
    ],
    includedCount: 15,
    startingPrice: 39,
    icon: 'water',
    iconColor: colors.lab,
    iconBgColor: colors.labSoft,
    screen: 'ServiceDetails',
    params: { id: 'diabetes-care' },
  },
  {
    id: 'oncology-screening',
    title: 'Cancer Screening',
    subtitle: 'Early detection tests',
    included: [
      { name: 'Tumor Markers' },
      { name: 'CA-125 / PSA' },
      { name: 'Imaging review' },
      { name: 'Oncologist consult', count: 1 },
    ],
    includedCount: 18,
    startingPrice: 199,
    icon: 'shield-checkmark',
    iconColor: colors.equipment,
    iconBgColor: colors.equipmentSoft,
    screen: 'ServiceDetails',
    params: { id: 'oncology-screening' },
  },
];

// =============================================================================
// TIME SLOTS (for booking)
// =============================================================================

export type TimeSlot = {
  time: string; // "09:00" (24h format)
  label: string; // "9:00 AM" (display)
  available: boolean;
};

export const defaultTimeSlots: TimeSlot[] = [
  { time: '09:00', label: '9:00 AM', available: true },
  { time: '10:00', label: '10:00 AM', available: true },
  { time: '11:00', label: '11:00 AM', available: false },
  { time: '12:00', label: '12:00 PM', available: true },
  { time: '14:00', label: '2:00 PM', available: true },
  { time: '15:00', label: '3:00 PM', available: true },
  { time: '16:00', label: '4:00 PM', available: false },
  { time: '17:00', label: '5:00 PM', available: true },
  { time: '18:00', label: '6:00 PM', available: true },
];

export const nursingTimeSlots: TimeSlot[] = [
  { time: '06:00', label: '6:00 AM', available: true },
  { time: '08:00', label: '8:00 AM', available: true },
  { time: '10:00', label: '10:00 AM', available: true },
  { time: '12:00', label: '12:00 PM', available: true },
  { time: '14:00', label: '2:00 PM', available: false },
  { time: '16:00', label: '4:00 PM', available: true },
  { time: '18:00', label: '6:00 PM', available: true },
  { time: '20:00', label: '8:00 PM', available: true },
  { time: '22:00', label: '10:00 PM', available: true },
];

// =============================================================================
// SUBSCRIPTION PLAN ITEMS (Today Screen Display)
// Re-exported from subscriptions.ts for backward compatibility
// =============================================================================

export { subscriptionPlans, getCarePlans, getAISubscriptionPlan } from './subscriptions';

// Legacy type alias
export type SubscriptionPlanItem = {
  id: string;
  title: string;
  periodLabel: string;
  price: number | null;
  originalPrice?: number;
  priceUnit: string;
  benefits: string[];
  highlight?: boolean;
  badge?: string;
};

// =============================================================================
// UPCOMING APPOINTMENTS (Mock data for Today Screen)
// =============================================================================

export type UpcomingAppointment = {
  id: string;
  doctorName: string;
  doctorInitials: string;
  specialty: string;
  date: string;
  time: string;
  type: 'video' | 'in-person' | 'home-visit';
  typeLabel: string;
  canJoin: boolean;
  serviceId?: string;
};

export const mockUpcomingAppointment: UpcomingAppointment = {
  id: 'apt-001',
  doctorName: 'Dr. Sarah Chen',
  doctorInitials: 'SC',
  specialty: 'General Physician',
  date: 'Jan 5, 2026',
  time: '2:00 PM',
  type: 'video',
  typeLabel: 'Video consult',
  canJoin: true,
  serviceId: 'doctor-video-consult',
};

// =============================================================================
// HELPER FUNCTIONS (USD ONLY)
// =============================================================================

/**
 * Format price in USD
 * @param amount - Price in dollars
 * @returns Formatted string like "$50"
 */
export function formatPrice(amount: number): string {
  return `${CURRENCY.symbol}${amount.toLocaleString('en-US')}`;
}

/**
 * Format price with unit
 * @param amount - Price in dollars
 * @param unit - Unit like "/month", "/hour", "/visit"
 * @returns Formatted string like "$50/visit"
 */
export function formatPriceWithUnit(amount: number, unit: string): string {
  return `${CURRENCY.symbol}${amount.toLocaleString('en-US')}${unit}`;
}

/**
 * Format price range
 * @param from - Starting price
 * @param to - Optional ending price
 * @returns Formatted string like "From $50" or "$50 - $100"
 */
export function formatPriceRange(from: number, to?: number): string {
  if (to) {
    return `${CURRENCY.symbol}${from} - ${CURRENCY.symbol}${to}`;
  }
  return `From ${CURRENCY.symbol}${from}`;
}

/**
 * Calculate discount percentage
 * @param current - Current price
 * @param original - Original price
 * @returns Discount percentage or null if no discount
 */
export function calculateDiscount(current: number, original: number): number | null {
  if (original <= current) return null;
  return Math.round(((original - current) / original) * 100);
}

export function getTagStyle(tag: QuickPickItem['tag']): { bg: string; text: string } {
  switch (tag) {
    case 'Available':
      return { bg: colors.successSoft, text: colors.success };
    case 'Popular':
      return { bg: colors.infoSoft, text: colors.info };
    case 'Verified':
      return { bg: colors.accentSoft, text: colors.accent };
    case '24/7':
      return { bg: colors.nursingSoft, text: colors.nursing };
    default:
      return { bg: colors.surface2, text: colors.textSecondary };
  }
}

export function getBadgeStyle(type: DeviceBadge['type']): { bg: string; text: string } {
  switch (type) {
    case 'highlight':
      return { bg: colors.successSoft, text: colors.success };
    case 'info':
      return { bg: colors.infoSoft, text: colors.info };
    default:
      return { bg: colors.surface2, text: colors.textSecondary };
  }
}
