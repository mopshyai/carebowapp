/**
 * CareBow Data Types
 * Single source of truth for all type definitions
 */

// ============================================
// PRICING TYPES
// ============================================

export type PackageOption = {
  id: string;
  label: string;
  price: number;
  originalPrice?: number;
  durationMinutes?: number;
  notes?: string;
};

// Alias for backward compatibility
export type ServicePackage = PackageOption;

export type PricingModel =
  | { type: 'fixed'; price: number; originalPrice?: number; notes?: string }
  | { type: 'packages'; packages: PackageOption[] }
  | { type: 'hourly'; hourlyRate: number; minHours: number; maxHours?: number }
  | { type: 'daily'; dailyRate: number; minDays: number; maxDays?: number }
  | { type: 'quote'; bookingFee?: number };

// ============================================
// BOOKING CONFIGURATION
// ============================================

export type TimeMode = 'start_only' | 'start_end' | 'duration';

export type BookingConfig = {
  requiresMember: boolean;
  requiresDate: boolean;
  requiresTime: boolean;
  timeMode?: TimeMode; // Optional - defaults to 'start_only'
  defaultDurationMinutes?: number;
  availableTimeSlots?: string[]; // ["09:00","10:00"...] optional; else free picker
  leadTimeHours?: number; // e.g. 2 hours minimum
  maxDaysAhead?: number; // e.g. 30
};

export type FulfillmentConfig = {
  mode: 'checkout' | 'on_request';
  requiresPayment: boolean;
  allowBookingFee?: boolean; // if on_request but wants fee
};

export type RequestConfig = {
  enabled: boolean;
  required: boolean;
  placeholder: string;
};

// ============================================
// SERVICE TYPES
// ============================================

export type ServiceBenefit = {
  title: string;
  description: string;
};

export type Service = {
  id: string;
  title: string;
  categoryId: string;
  image: string; // image key for icon mapping
  heroImage?: any; // local image require() or placeholder
  rating: number;
  reviewCount: number;
  shortTagline: string;
  description: string;
  benefits: ServiceBenefit[];

  fulfillment: FulfillmentConfig;
  pricing: PricingModel;
  booking: BookingConfig;
  request?: RequestConfig; // Optional - not all services require request notes
};

export type ServiceCategory = {
  id: string;
  title: string;
  items: Service[];
};

// Alias for backward compatibility with ServiceRowCard
export type ServiceItem = Service;

// ============================================
// BOOKING DRAFT / SELECTIONS
// ============================================

export type BookingDraft = {
  serviceId: string;
  serviceTitle: string;
  memberId: string | null;
  memberName: string | null;
  date: string | null; // ISO date string YYYY-MM-DD
  startTime: string | null; // HH:MM format
  endTime: string | null; // HH:MM format (for start_end mode)
  durationMinutes: number | null;
  selectedPackageId: string | null;
  selectedPackageLabel: string | null;
  hours: number | null; // for hourly pricing
  days: number | null; // for daily pricing
  requestNotes: string;

  // Computed pricing
  subtotal: number;
  discount: number;
  total: number;
  pricingLabel: string; // e.g., "4 Hours", "$20/hour x 3"
};

// ============================================
// CART TYPES
// ============================================

export type CartItem = {
  id: string;
  serviceId: string;
  serviceTitle: string;
  memberId: string;
  memberName: string;
  date: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  packageId?: string;
  packageLabel?: string;
  hours?: number;
  days?: number;
  requestNotes: string;
  subtotal: number;
  discount: number;
  total: number;
  pricingLabel: string;
};

// ============================================
// ORDER TYPES
// ============================================

export type OrderStatus = 'pending' | 'paid' | 'booking_fee_paid' | 'cancelled' | 'completed';

export type PaymentInfo = {
  paymentId: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paidAt: string | null; // ISO date string
  method: string; // e.g., "mock", "stripe", etc.
  amount: number;
};

export type Order = {
  id: string;
  serviceId: string;
  serviceTitle: string;
  memberId: string;
  memberName: string;
  schedule: {
    date: string;
    startTime: string;
    endTime?: string;
    durationMinutes?: number;
  };
  pricing: {
    model: string; // 'fixed', 'packages', 'hourly', 'daily', 'quote'
    packageId?: string;
    packageLabel?: string;
    hours?: number;
    days?: number;
    subtotal: number;
    discount: number;
    taxes: number;
    total: number;
    pricingLabel: string;
  };
  payment: PaymentInfo;
  requestNotes: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

// ============================================
// SERVICE REQUEST TYPES (On-Request Flow)
// ============================================

export type ServiceRequestStatus = 'submitted' | 'in_review' | 'quoted' | 'scheduled' | 'completed' | 'closed';

export type ServiceRequest = {
  id: string;
  serviceId: string;
  serviceTitle: string;
  memberId: string;
  memberName: string;
  date: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  requestNotes: string;
  status: ServiceRequestStatus;
  bookingFeePaid: boolean;
  bookingFeeAmount?: number;
  bookingFeePaymentId?: string;
  quotedPrice?: number;
  createdAt: string;
  updatedAt: string;
};

// ============================================
// MEMBER TYPES
// ============================================

export type Member = {
  id: string;
  name: string;
  relationship: string;
};

// ============================================
// SUBSCRIPTION PLAN TYPES
// ============================================

export type SubscriptionPlan = {
  id: string;
  title: string;
  price: number | null;
  periodLabel: string;
  rating: number;
  image: string;
  benefits?: string[];
};

// ============================================
// COUPON/DISCOUNT TYPES
// ============================================

export type Coupon = {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxDiscount?: number;
  validUntil?: string;
  applicableServiceIds?: string[]; // empty = all services
};
