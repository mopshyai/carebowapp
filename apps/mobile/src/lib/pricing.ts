/**
 * CareBow Pricing Configuration
 * Single source of truth for all pricing display rules
 *
 * RULES:
 * 1. Prices must be credible and medical-appropriate
 * 2. Use "Starting from" or "From" when applicable
 * 3. Show units clearly: /test, /hr, /visit
 * 4. No "per day" gimmicks (e.g., "$0.83/day")
 * 5. Copy must sound medical and calm, not startup hype
 */

// =============================================================================
// CURRENCY CONFIGURATION
// =============================================================================

export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  symbolPosition: 'before' | 'after';
  decimals: number;
  thousandsSeparator: string;
  decimalSeparator: string;
}

export const currencies: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    symbolPosition: 'before',
    decimals: 0, // No cents for cleaner display
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  INR: {
    code: 'INR',
    symbol: '₹',
    symbolPosition: 'before',
    decimals: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    symbolPosition: 'before',
    decimals: 0,
    thousandsSeparator: '.',
    decimalSeparator: ',',
  },
  GBP: {
    code: 'GBP',
    symbol: '£',
    symbolPosition: 'before',
    decimals: 0,
    thousandsSeparator: ',',
    decimalSeparator: '.',
  },
};

// Default currency
export const DEFAULT_CURRENCY: CurrencyCode = 'USD';

// =============================================================================
// PRICE FORMATTING
// =============================================================================

export interface FormatPriceOptions {
  currency?: CurrencyCode;
  showCents?: boolean;
  prefix?: string; // "Starting from", "From", etc.
  suffix?: string; // "/visit", "/hour", "/test", etc.
}

/**
 * Format a price for display
 * @param amount - Price in currency units (e.g., 35 for $35)
 * @param options - Formatting options
 */
export function formatPrice(
  amount: number,
  options: FormatPriceOptions = {}
): string {
  const {
    currency = DEFAULT_CURRENCY,
    showCents = false,
    prefix,
    suffix,
  } = options;

  const config = currencies[currency];
  const decimals = showCents ? 2 : config.decimals;

  // Format the number
  let formatted = amount.toFixed(decimals);

  // Add thousands separator
  const parts = formatted.split('.');
  parts[0] = parts[0].replace(
    /\B(?=(\d{3})+(?!\d))/g,
    config.thousandsSeparator
  );
  formatted = parts.join(config.decimalSeparator);

  // Add currency symbol
  const priceWithSymbol =
    config.symbolPosition === 'before'
      ? `${config.symbol}${formatted}`
      : `${formatted}${config.symbol}`;

  // Build final string
  const prefixStr = prefix ? `${prefix} ` : '';
  const suffixStr = suffix ? suffix : '';

  return `${prefixStr}${priceWithSymbol}${suffixStr}`;
}

/**
 * Format price range (e.g., "$25 - $50")
 */
export function formatPriceRange(
  min: number,
  max: number,
  currency: CurrencyCode = DEFAULT_CURRENCY
): string {
  const config = currencies[currency];
  const minFormatted = formatPrice(min, { currency });
  const maxFormatted = formatPrice(max, { currency });

  // If same currency symbol, don't repeat it
  if (config.symbolPosition === 'before') {
    return `${config.symbol}${min} - ${max}`;
  }
  return `${minFormatted} - ${maxFormatted}`;
}

// =============================================================================
// SERVICE PRICING CONFIGURATION
// =============================================================================

export type PricingUnit =
  | 'visit'
  | 'hour'
  | 'test'
  | 'day'
  | 'week'
  | 'month'
  | 'package'
  | 'session'
  | 'consultation';

export interface ServicePricing {
  id: string;
  name: string;
  basePrice: number;
  unit: PricingUnit;
  showAsStartingFrom: boolean;
  description?: string;
}

/**
 * Credible service pricing (USD base)
 * These prices should feel realistic for healthcare services
 */
export const servicePricing: Record<string, ServicePricing> = {
  // Consultations
  doctor_visit: {
    id: 'doctor_visit',
    name: 'Doctor Visit',
    basePrice: 35,
    unit: 'visit',
    showAsStartingFrom: true,
    description: 'At-home consultation',
  },
  telemedicine: {
    id: 'telemedicine',
    name: 'Video Consultation',
    basePrice: 25,
    unit: 'consultation',
    showAsStartingFrom: true,
    description: 'Online consultation',
  },

  // Lab Tests
  lab_testing: {
    id: 'lab_testing',
    name: 'Lab Tests',
    basePrice: 25,
    unit: 'test',
    showAsStartingFrom: true,
    description: 'Home sample collection',
  },

  // Nursing Care
  home_nurse: {
    id: 'home_nurse',
    name: 'Nursing Care',
    basePrice: 22,
    unit: 'hour',
    showAsStartingFrom: true,
    description: 'Certified professionals',
  },
  nursing_24hr: {
    id: 'nursing_24hr',
    name: '24-Hour Nursing',
    basePrice: 180,
    unit: 'day',
    showAsStartingFrom: true,
    description: 'Round-the-clock care',
  },

  // Medical Equipment (monthly rental)
  oxygen_concentrator: {
    id: 'oxygen_concentrator',
    name: 'Oxygen Concentrator',
    basePrice: 55,
    unit: 'month',
    showAsStartingFrom: false,
    description: 'Monthly rental',
  },
  bpap: {
    id: 'bpap',
    name: 'BiPAP Machine',
    basePrice: 65,
    unit: 'month',
    showAsStartingFrom: false,
    description: 'Monthly rental with training',
  },
  hospital_bed: {
    id: 'hospital_bed',
    name: 'Hospital Bed',
    basePrice: 45,
    unit: 'month',
    showAsStartingFrom: false,
    description: 'Monthly rental with setup',
  },
  wheelchair: {
    id: 'wheelchair',
    name: 'Wheelchair',
    basePrice: 25,
    unit: 'month',
    showAsStartingFrom: false,
  },

  // Health Packages
  cardiac_package: {
    id: 'cardiac_package',
    name: 'Cardiac Health',
    basePrice: 89,
    unit: 'package',
    showAsStartingFrom: false,
    description: '12 tests included',
  },
  senior_wellness: {
    id: 'senior_wellness',
    name: 'Senior Wellness',
    basePrice: 149,
    unit: 'package',
    showAsStartingFrom: false,
    description: '78 tests included',
  },
  diabetes_care: {
    id: 'diabetes_care',
    name: 'Diabetes Care',
    basePrice: 69,
    unit: 'package',
    showAsStartingFrom: false,
    description: '15 tests included',
  },
  womens_health: {
    id: 'womens_health',
    name: "Women's Health",
    basePrice: 99,
    unit: 'package',
    showAsStartingFrom: false,
    description: '25 tests included',
  },
};

// =============================================================================
// SUBSCRIPTION PRICING
// =============================================================================

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: string;
  billingPeriod: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  benefits: string[];
  tag?: string; // "FLEXIBLE", "RECOMMENDED", "BEST VALUE"
}

/**
 * Care Plan subscription pricing
 * NO per-day pricing gimmicks
 */
export const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    duration: '1 Month',
    billingPeriod: 'Billed monthly',
    price: 29,
    benefits: [
      'Unlimited AI consultations',
      'Priority booking',
      '10% off services',
    ],
    tag: 'FLEXIBLE',
  },
  {
    id: 'half_yearly',
    name: '6-Month Plan',
    duration: '6 Months',
    billingPeriod: 'Billed semi-annually',
    price: 149,
    originalPrice: 174,
    discount: 14,
    benefits: [
      'All Monthly benefits',
      'Priority support',
      '15% off services',
      '1 free health checkup',
    ],
    tag: 'RECOMMENDED',
  },
  {
    id: 'yearly',
    name: 'Annual Plan',
    duration: '12 Months',
    billingPeriod: 'Billed annually',
    price: 279,
    originalPrice: 348,
    discount: 20,
    benefits: [
      'All 6-Month benefits',
      'Family add-ons available',
      '20% off services',
      '2 free health checkups',
      'Dedicated care coordinator',
    ],
    tag: 'BEST VALUE',
  },
];

// =============================================================================
// PRICING DISPLAY HELPERS
// =============================================================================

/**
 * Get formatted service price with appropriate prefix and unit
 */
export function getServicePriceDisplay(
  serviceId: string,
  currency: CurrencyCode = DEFAULT_CURRENCY
): { price: string; description?: string } {
  const service = servicePricing[serviceId];
  if (!service) {
    return { price: 'Price varies' };
  }

  const prefix = service.showAsStartingFrom ? 'From' : undefined;
  const suffix = `/${service.unit}`;

  return {
    price: formatPrice(service.basePrice, { currency, prefix, suffix }),
    description: service.description,
  };
}

/**
 * Format subscription price display
 */
export function getSubscriptionPriceDisplay(
  plan: SubscriptionPlan,
  currency: CurrencyCode = DEFAULT_CURRENCY
): {
  price: string;
  originalPrice?: string;
  discount?: string;
  billingPeriod: string;
} {
  const result: {
    price: string;
    originalPrice?: string;
    discount?: string;
    billingPeriod: string;
  } = {
    price: formatPrice(plan.price, { currency }),
    billingPeriod: plan.billingPeriod,
  };

  if (plan.originalPrice) {
    result.originalPrice = formatPrice(plan.originalPrice, { currency });
  }

  if (plan.discount) {
    result.discount = `Save ${plan.discount}%`;
  }

  return result;
}

// =============================================================================
// UNIT DISPLAY LABELS
// =============================================================================

export const unitLabels: Record<PricingUnit, string> = {
  visit: '/visit',
  hour: '/hour',
  test: '/test',
  day: '/day',
  week: '/week',
  month: '/month',
  package: '',
  session: '/session',
  consultation: '/consultation',
};

/**
 * Get human-readable unit label
 */
export function getUnitLabel(unit: PricingUnit): string {
  return unitLabels[unit] || '';
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default {
  currencies,
  DEFAULT_CURRENCY,
  formatPrice,
  formatPriceRange,
  servicePricing,
  subscriptionPlans,
  getServicePriceDisplay,
  getSubscriptionPriceDisplay,
  getUnitLabel,
};
