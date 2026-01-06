/**
 * Booking Types
 * Comprehensive types for Orders and Service Requests with full pricing breakdown
 */

// ============================================
// MONEY & PRICING TYPES
// ============================================

export type Currency = 'USD' | 'INR';

export type Money = {
  currency: Currency;
  amount: number;
};

export type PricingModelType = 'fixed' | 'packages' | 'hourly' | 'daily' | 'quote';

export type PricingBreakdown = {
  pricingModel: PricingModelType;
  packageId?: string;
  packageLabel?: string;
  quantity?: number; // hours or days or units
  unitPrice?: Money; // hourlyRate, dailyRate, or package price
  subtotal: Money;
  discount: Money;
  fees: Money;
  taxes: Money;
  total: Money;
  originalTotal?: Money; // if showing strike-through
  discountPercent?: number; // e.g., 20
  couponCode?: string | null;
};

// ============================================
// SCHEDULE TYPES
// ============================================

export type Schedule = {
  dateISO: string; // YYYY-MM-DD
  timeStart: string; // HH:mm
  timeEnd?: string; // HH:mm optional
  durationMinutes?: number; // optional
  timezone?: string; // optional, e.g., "America/New_York"
};

// ============================================
// BOOKING CORE (shared by Order & ServiceRequest)
// ============================================

export type BookingCore = {
  id: string;
  serviceId: string;
  serviceTitle: string;
  memberId: string;
  memberName?: string;
  schedule: Schedule;
  notes: string;
  pricing: PricingBreakdown;
  createdAtISO: string;
};

// ============================================
// PAYMENT TYPES
// ============================================

export type PaymentProvider = 'mock' | 'stripe' | 'razorpay';

export type PaymentStatus = 'unpaid' | 'pending' | 'paid' | 'failed' | 'refunded';

export type PaymentInfo = {
  provider: PaymentProvider;
  status: PaymentStatus;
  paymentId?: string;
  paidAtISO?: string;
  failureReason?: string;
  amount: Money;
};

// ============================================
// ORDER TYPES (for paid services)
// ============================================

export type OrderStatus = 'created' | 'paid' | 'fulfilled' | 'cancelled' | 'refunded';

export type Order = BookingCore & {
  kind: 'order';
  orderStatus: OrderStatus;
  payment: PaymentInfo;
  updatedAtISO: string;
};

// ============================================
// SERVICE REQUEST TYPES (for on-request services)
// ============================================

export type RequestStatus = 'submitted' | 'in_review' | 'quoted' | 'scheduled' | 'closed' | 'cancelled';

export type Quote = {
  quotedTotal?: Money;
  quoteNotes?: string;
  quotedAtISO?: string;
};

export type ServiceRequest = BookingCore & {
  kind: 'request';
  requestStatus: RequestStatus;
  assignedTo?: string | null;
  quote?: Quote;
  bookingFee?: {
    paid: boolean;
    amount?: Money;
    paymentId?: string;
    paidAtISO?: string;
  };
  updatedAtISO: string;
};

// ============================================
// BOOKING DRAFT INPUT (for building BookingCore)
// ============================================

export type BookingDraftInput = {
  serviceId: string;
  serviceTitle: string;
  memberId: string;
  memberName?: string;
  schedule: {
    date: string; // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime?: string; // HH:mm
    durationMinutes?: number;
  };
  notes: string;
  pricingSelections: {
    pricingModel: PricingModelType;
    packageId?: string;
    packageLabel?: string;
    packagePrice?: number;
    packageOriginalPrice?: number;
    hours?: number;
    days?: number;
    hourlyRate?: number;
    dailyRate?: number;
    fixedPrice?: number;
    fixedOriginalPrice?: number;
  };
  currency?: Currency;
  couponCode?: string | null;
};

// ============================================
// VALIDATION RESULT
// ============================================

export type ValidationResult = {
  isValid: boolean;
  errors: string[];
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create a Money object with USD as default currency
 */
export const money = (amount: number, currency: Currency = 'USD'): Money => ({
  currency,
  amount,
});

/**
 * Format money for display
 */
export const formatMoney = (m: Money): string => {
  const symbol = m.currency === 'USD' ? '$' : '₹';
  return `${symbol}${m.amount.toFixed(m.amount % 1 === 0 ? 0 : 2)}`;
};

/**
 * Add two Money values (must be same currency)
 */
export const addMoney = (a: Money, b: Money): Money => {
  if (a.currency !== b.currency) {
    throw new Error('Cannot add money with different currencies');
  }
  return { currency: a.currency, amount: a.amount + b.amount };
};

/**
 * Subtract Money b from a (must be same currency)
 */
export const subtractMoney = (a: Money, b: Money): Money => {
  if (a.currency !== b.currency) {
    throw new Error('Cannot subtract money with different currencies');
  }
  return { currency: a.currency, amount: Math.max(0, a.amount - b.amount) };
};

/**
 * Generate unique ID for orders/requests
 */
export const generateBookingId = (prefix: 'ord' | 'req'): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${random}`;
};
