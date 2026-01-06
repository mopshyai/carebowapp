/**
 * Booking Draft Builder
 * Creates BookingCore objects with proper pricing breakdown for all pricing models
 */

import {
  BookingCore,
  BookingDraftInput,
  PricingBreakdown,
  Schedule,
  Money,
  Currency,
  ValidationResult,
  money,
  generateBookingId,
} from '@/types/booking';

// ============================================
// PRICING CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate pricing for fixed price model
 */
function calculateFixedPricing(
  price: number,
  originalPrice: number | undefined,
  currency: Currency
): PricingBreakdown {
  const subtotal = money(originalPrice || price, currency);
  const discount = originalPrice ? money(originalPrice - price, currency) : money(0, currency);
  const discountPercent = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : undefined;

  return {
    pricingModel: 'fixed',
    subtotal,
    discount,
    fees: money(0, currency),
    taxes: money(0, currency),
    total: money(price, currency),
    originalTotal: originalPrice ? money(originalPrice, currency) : undefined,
    discountPercent,
  };
}

/**
 * Calculate pricing for package model
 */
function calculatePackagePricing(
  packageId: string,
  packageLabel: string,
  packagePrice: number,
  packageOriginalPrice: number | undefined,
  currency: Currency
): PricingBreakdown {
  const subtotal = money(packageOriginalPrice || packagePrice, currency);
  const discount = packageOriginalPrice
    ? money(packageOriginalPrice - packagePrice, currency)
    : money(0, currency);
  const discountPercent = packageOriginalPrice
    ? Math.round(((packageOriginalPrice - packagePrice) / packageOriginalPrice) * 100)
    : undefined;

  return {
    pricingModel: 'packages',
    packageId,
    packageLabel,
    unitPrice: money(packagePrice, currency),
    subtotal,
    discount,
    fees: money(0, currency),
    taxes: money(0, currency),
    total: money(packagePrice, currency),
    originalTotal: packageOriginalPrice ? money(packageOriginalPrice, currency) : undefined,
    discountPercent,
  };
}

/**
 * Calculate pricing for hourly model
 */
function calculateHourlyPricing(
  hours: number,
  hourlyRate: number,
  currency: Currency
): PricingBreakdown {
  const totalAmount = hours * hourlyRate;

  return {
    pricingModel: 'hourly',
    quantity: hours,
    unitPrice: money(hourlyRate, currency),
    subtotal: money(totalAmount, currency),
    discount: money(0, currency),
    fees: money(0, currency),
    taxes: money(0, currency),
    total: money(totalAmount, currency),
  };
}

/**
 * Calculate pricing for daily model
 */
function calculateDailyPricing(
  days: number,
  dailyRate: number,
  currency: Currency
): PricingBreakdown {
  const totalAmount = days * dailyRate;

  return {
    pricingModel: 'daily',
    quantity: days,
    unitPrice: money(dailyRate, currency),
    subtotal: money(totalAmount, currency),
    discount: money(0, currency),
    fees: money(0, currency),
    taxes: money(0, currency),
    total: money(totalAmount, currency),
  };
}

/**
 * Calculate pricing for quote/on-request model
 * Total is 0 until quoted, but we still capture metadata
 */
function calculateQuotePricing(currency: Currency): PricingBreakdown {
  return {
    pricingModel: 'quote',
    subtotal: money(0, currency),
    discount: money(0, currency),
    fees: money(0, currency),
    taxes: money(0, currency),
    total: money(0, currency),
  };
}

// ============================================
// MAIN BUILDER FUNCTION
// ============================================

/**
 * Build a complete BookingCore from input data
 * Validates input and computes pricing breakdown based on pricing model
 */
export function buildBookingCore(input: BookingDraftInput): BookingCore {
  const currency = input.currency || 'USD';
  const { pricingSelections } = input;

  let pricing: PricingBreakdown;

  switch (pricingSelections.pricingModel) {
    case 'fixed':
      if (pricingSelections.fixedPrice === undefined) {
        throw new Error('Fixed price is required for fixed pricing model');
      }
      pricing = calculateFixedPricing(
        pricingSelections.fixedPrice,
        pricingSelections.fixedOriginalPrice,
        currency
      );
      break;

    case 'packages':
      if (!pricingSelections.packageId || !pricingSelections.packageLabel || pricingSelections.packagePrice === undefined) {
        throw new Error('Package details are required for packages pricing model');
      }
      pricing = calculatePackagePricing(
        pricingSelections.packageId,
        pricingSelections.packageLabel,
        pricingSelections.packagePrice,
        pricingSelections.packageOriginalPrice,
        currency
      );
      break;

    case 'hourly':
      if (!pricingSelections.hours || !pricingSelections.hourlyRate) {
        throw new Error('Hours and hourly rate are required for hourly pricing model');
      }
      pricing = calculateHourlyPricing(
        pricingSelections.hours,
        pricingSelections.hourlyRate,
        currency
      );
      break;

    case 'daily':
      if (!pricingSelections.days || !pricingSelections.dailyRate) {
        throw new Error('Days and daily rate are required for daily pricing model');
      }
      pricing = calculateDailyPricing(
        pricingSelections.days,
        pricingSelections.dailyRate,
        currency
      );
      break;

    case 'quote':
      pricing = calculateQuotePricing(currency);
      break;

    default:
      throw new Error(`Unknown pricing model: ${pricingSelections.pricingModel}`);
  }

  // Apply coupon if provided
  if (input.couponCode) {
    pricing.couponCode = input.couponCode;
  }

  const schedule: Schedule = {
    dateISO: input.schedule.date,
    timeStart: input.schedule.startTime,
    timeEnd: input.schedule.endTime,
    durationMinutes: input.schedule.durationMinutes,
  };

  const bookingCore: BookingCore = {
    id: generateBookingId(pricingSelections.pricingModel === 'quote' ? 'req' : 'ord'),
    serviceId: input.serviceId,
    serviceTitle: input.serviceTitle,
    memberId: input.memberId,
    memberName: input.memberName,
    schedule,
    notes: input.notes,
    pricing,
    createdAtISO: new Date().toISOString(),
  };

  return bookingCore;
}

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate booking draft input before creating
 */
export function validateBookingInput(
  input: Partial<BookingDraftInput>,
  options: {
    requireMember?: boolean;
    requireDate?: boolean;
    requireTime?: boolean;
    requireNotes?: boolean;
  } = {}
): ValidationResult {
  const errors: string[] = [];
  const { requireMember = true, requireDate = true, requireTime = true, requireNotes = false } = options;

  if (!input.serviceId) {
    errors.push('Service ID is required');
  }

  if (!input.serviceTitle) {
    errors.push('Service title is required');
  }

  if (requireMember && !input.memberId) {
    errors.push('Member selection is required');
  }

  if (requireDate && !input.schedule?.date) {
    errors.push('Date is required');
  }

  if (requireTime && !input.schedule?.startTime) {
    errors.push('Start time is required');
  }

  if (requireNotes && (!input.notes || input.notes.trim() === '')) {
    errors.push('Notes are required for this service');
  }

  // Validate pricing selections
  if (input.pricingSelections) {
    const { pricingSelections } = input;

    switch (pricingSelections.pricingModel) {
      case 'packages':
        if (!pricingSelections.packageId) {
          errors.push('Package selection is required');
        }
        break;
      case 'hourly':
        if (!pricingSelections.hours || pricingSelections.hours < 1) {
          errors.push('Hours selection is required');
        }
        break;
      case 'daily':
        if (!pricingSelections.days || pricingSelections.days < 1) {
          errors.push('Days selection is required');
        }
        break;
    }
  } else {
    errors.push('Pricing selections are required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate that a paid service has non-zero total
 */
export function validatePaidServicePricing(pricing: PricingBreakdown): ValidationResult {
  const errors: string[] = [];

  if (pricing.pricingModel !== 'quote' && pricing.total.amount <= 0) {
    errors.push('Total amount must be greater than 0 for paid services');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format pricing breakdown for display
 */
export function formatPricingLabel(pricing: PricingBreakdown): string {
  switch (pricing.pricingModel) {
    case 'fixed':
      return 'Fixed Price';
    case 'packages':
      return pricing.packageLabel || 'Package';
    case 'hourly':
      return `${pricing.quantity} hour${pricing.quantity !== 1 ? 's' : ''} @ ${pricing.unitPrice ? `$${pricing.unitPrice.amount}/hr` : ''}`;
    case 'daily':
      return `${pricing.quantity} day${pricing.quantity !== 1 ? 's' : ''} @ ${pricing.unitPrice ? `$${pricing.unitPrice.amount}/day` : ''}`;
    case 'quote':
      return 'On Request';
    default:
      return '';
  }
}

/**
 * Calculate end time from start time and duration
 */
export function calculateEndTime(startTime: string, durationMinutes: number): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}
