/**
 * Payment Service Types
 * Type definitions for the payment system
 */

// ============================================
// PAYMENT METHODS
// ============================================

export type PaymentMethodType =
  | 'card'
  | 'upi'
  | 'netbanking'
  | 'wallet'
  | 'cod'; // Cash on delivery for some services

export interface SavedCard {
  id: string;
  last4: string;
  brand: 'visa' | 'mastercard' | 'amex' | 'rupay' | 'other';
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  cardholderName?: string;
}

export interface UPIDetails {
  id: string;
  vpa: string; // user@bank format
  isDefault: boolean;
  bankName?: string;
}

export interface WalletDetails {
  type: 'paytm' | 'phonepe' | 'gpay' | 'amazon_pay' | 'other';
  linkedPhone?: string;
}

export type PaymentMethod =
  | { type: 'card'; cardId: string }
  | { type: 'new_card'; card: NewCardDetails }
  | { type: 'upi'; upiId: string }
  | { type: 'new_upi'; vpa: string }
  | { type: 'netbanking'; bankCode: string }
  | { type: 'wallet'; wallet: WalletDetails }
  | { type: 'cod' };

export interface NewCardDetails {
  number: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  cardholderName: string;
  saveCard?: boolean;
}

// ============================================
// PAYMENT REQUEST
// ============================================

export interface PaymentRequest {
  /** Unique order ID */
  orderId: string;
  /** Amount in smallest currency unit (cents/paise) */
  amount: number;
  /** Currency code */
  currency: 'USD' | 'INR';
  /** Customer details */
  customer: {
    id: string;
    email: string;
    phone?: string;
    name?: string;
  };
  /** Payment method */
  method: PaymentMethod;
  /** Description for statement */
  description?: string;
  /** Metadata */
  metadata?: Record<string, string>;
  /** Receipt email */
  sendReceipt?: boolean;
}

// ============================================
// PAYMENT RESPONSE
// ============================================

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'requires_action' // 3DS, OTP, etc.
  | 'succeeded'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export interface PaymentResponse {
  /** Payment provider's payment ID */
  paymentId: string;
  /** Our order ID */
  orderId: string;
  /** Payment status */
  status: PaymentStatus;
  /** Amount charged (in smallest unit) */
  amount: number;
  /** Currency */
  currency: string;
  /** Payment method used */
  method: PaymentMethodType;
  /** Timestamp */
  createdAt: string;
  /** Updated timestamp */
  updatedAt: string;
  /** Card details if paid by card */
  cardDetails?: {
    last4: string;
    brand: string;
  };
  /** Failure reason if failed */
  failureReason?: string;
  /** Failure code for error handling */
  failureCode?: string;
  /** Action required for 3DS, OTP etc */
  requiredAction?: {
    type: 'redirect' | 'otp' | '3ds_authenticate';
    redirectUrl?: string;
    instructions?: string;
  };
  /** Receipt URL */
  receiptUrl?: string;
  /** Refund details if refunded */
  refund?: {
    refundId: string;
    amount: number;
    reason?: string;
    refundedAt: string;
  };
}

// ============================================
// REFUND REQUEST
// ============================================

export interface RefundRequest {
  paymentId: string;
  /** Amount to refund (in smallest unit). If not provided, full refund. */
  amount?: number;
  reason?: string;
}

export interface RefundResponse {
  refundId: string;
  paymentId: string;
  status: 'pending' | 'succeeded' | 'failed';
  amount: number;
  reason?: string;
  createdAt: string;
}

// ============================================
// SUBSCRIPTION TYPES
// ============================================

export type SubscriptionInterval = 'monthly' | 'quarterly' | 'half_yearly' | 'yearly';

export interface SubscriptionRequest {
  planId: string;
  customerId: string;
  paymentMethod: PaymentMethod;
  startImmediately?: boolean;
  trialDays?: number;
  metadata?: Record<string, string>;
}

export interface Subscription {
  id: string;
  planId: string;
  customerId: string;
  status: 'active' | 'cancelled' | 'past_due' | 'paused' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string;
  trialEnd?: string;
  createdAt: string;
}

// ============================================
// SERVICE INTERFACE
// ============================================

export interface IPaymentService {
  /** Initialize the payment service */
  initialize(): Promise<void>;

  /** Process a payment */
  processPayment(request: PaymentRequest): Promise<PaymentResponse>;

  /** Handle payment action (3DS, OTP, etc.) */
  handlePaymentAction(paymentId: string, actionData?: unknown): Promise<PaymentResponse>;

  /** Get payment status */
  getPaymentStatus(paymentId: string): Promise<PaymentResponse>;

  /** Request refund */
  requestRefund(request: RefundRequest): Promise<RefundResponse>;

  /** Get saved payment methods for customer */
  getSavedPaymentMethods(customerId: string): Promise<{
    cards: SavedCard[];
    upi: UPIDetails[];
  }>;

  /** Save a new card */
  saveCard(customerId: string, card: NewCardDetails): Promise<SavedCard>;

  /** Delete saved card */
  deleteCard(customerId: string, cardId: string): Promise<void>;

  /** Create subscription */
  createSubscription(request: SubscriptionRequest): Promise<Subscription>;

  /** Cancel subscription */
  cancelSubscription(subscriptionId: string, cancelImmediately?: boolean): Promise<Subscription>;

  /** Get subscription */
  getSubscription(subscriptionId: string): Promise<Subscription>;
}

// ============================================
// ERROR TYPES
// ============================================

export type PaymentErrorCode =
  | 'card_declined'
  | 'insufficient_funds'
  | 'expired_card'
  | 'invalid_card'
  | 'invalid_cvv'
  | 'processing_error'
  | 'authentication_required'
  | 'authentication_failed'
  | 'network_error'
  | 'cancelled_by_user'
  | 'rate_limit'
  | 'unknown';

export class PaymentError extends Error {
  code: PaymentErrorCode;
  paymentId?: string;

  constructor(message: string, code: PaymentErrorCode, paymentId?: string) {
    super(message);
    this.name = 'PaymentError';
    this.code = code;
    this.paymentId = paymentId;
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Format amount from smallest unit to display format
 */
export function formatAmount(amount: number, currency: 'USD' | 'INR'): string {
  const divisor = currency === 'INR' ? 100 : 100;
  const symbol = currency === 'INR' ? '₹' : '$';
  const value = amount / divisor;

  return `${symbol}${value.toLocaleString('en-US', {
    minimumFractionDigits: value % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Convert display amount to smallest unit
 */
export function toSmallestUnit(amount: number, currency: 'USD' | 'INR'): number {
  return Math.round(amount * 100);
}

/**
 * Get card brand icon name
 */
export function getCardBrandIcon(brand: SavedCard['brand']): string {
  const icons: Record<SavedCard['brand'], string> = {
    visa: 'cc-visa',
    mastercard: 'cc-mastercard',
    amex: 'cc-amex',
    rupay: 'credit-card',
    other: 'credit-card',
  };
  return icons[brand] || icons.other;
}

/**
 * Mask card number for display
 */
export function maskCardNumber(last4: string): string {
  return `•••• •••• •••• ${last4}`;
}

/**
 * Check if card is expired
 */
export function isCardExpired(expiryMonth: number, expiryYear: number): boolean {
  const now = new Date();
  const expiry = new Date(expiryYear, expiryMonth, 0); // Last day of expiry month
  return expiry < now;
}
