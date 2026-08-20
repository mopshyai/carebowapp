/**
 * Paid bookings.
 *
 * The app has no payment SDK, so checkout opens Razorpay's hosted page in the
 * system browser and the SERVER confirms via webhook. That means the app is not
 * present when payment completes — it finds out by polling getPaymentStatus
 * after the customer returns.
 *
 *   createBookingOrder({ hosted: true })  -> { orderId, paymentUrl }
 *   Linking.openURL(paymentUrl)           -> customer pays on Razorpay
 *   webhook (server)                      -> creates the Booking
 *   getPaymentStatus(orderId)             -> SUCCESS + booking, or still PENDING
 *
 * The app never tells the server a payment succeeded. It only ever asks.
 */

import ApiClient from '../ApiClient';

/**
 * What the customer chose. The server prices this against its own catalog — the
 * app never sends an amount, because a client that names its own price is a
 * client that can pay one rupee for a nurse visit.
 */
export type PaymentSelection =
  | { kind: 'fixed' }
  | { kind: 'package'; packageId: string }
  | { kind: 'hourly'; hours: number }
  | { kind: 'daily'; days: number }
  | { kind: 'quote' };

export type CreateBookingOrderRequest = {
  serviceId: string;
  profileId: string;
  scheduledAt: string;
  notes?: string;
  address?: string;
  selection: PaymentSelection;
  hosted?: boolean;
  callbackUrl?: string;
};

export type CreateBookingOrderResponse = {
  success: boolean;
  error?: string;
  orderId?: string;
  /** Minor units of `currency` (paise for INR). Display only — the server charges this. */
  amount?: number;
  currency?: string;
  serviceName?: string;
  selectionDescription?: string;
  /** Razorpay-hosted checkout URL. Present when hosted: true. */
  paymentUrl?: string;
};

export type PaymentStatusResponse = {
  success: boolean;
  error?: string;
  /** PENDING means the webhook has not arrived yet. */
  status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  /**
   * What was being paid for. A plan upgrade has no booking, so without this a
   * successful plan payment is indistinguishable from a booking that failed to
   * appear.
   */
  kind?: 'booking' | 'plan';
  planSlug?: string | null;
  amount?: number;
  currency?: string;
  booking?: { id: string; status: string; scheduledAt: string } | null;
};

/** A booking that already exists and has not been paid for. */
export type SettleBookingRequest = {
  bookingId: string;
  hosted?: boolean;
  callbackUrl?: string;
};

export type PlanOrderRequest = {
  planSlug: string;
  hosted?: boolean;
  callbackUrl?: string;
};

export type PlanOrderResponse = {
  success: boolean;
  error?: string;
  orderId?: string;
  paymentUrl?: string;
  amount?: number;
  currency?: string;
  planTitle?: string;
};

export type Plan = {
  id: string;
  title: string;
  /**
   * Minor units of `currency`, priced by the server for THIS account. Not the
   * config's list price: an account charged in USD is quoted in USD, and
   * converting on the device would disagree with the Razorpay page.
   */
  amount: number;
  currency: string;
  period?: string | null;
  features: string[];
  description?: string | null;
  isCurrent: boolean;
};

export type PlansResponse = {
  success: boolean;
  error?: string;
  userType?: { id: string; title: string };
  currentPlanSlug?: string | null;
  plans?: Plan[];
};

export type PaymentRecord = {
  id: string;
  kind: 'booking' | 'plan';
  /** Minor units. */
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  description: string;
  reference?: string | null;
  createdAt: string;
  booking?: { id: string; status: string; scheduledAt: string } | null;
};

export type PaymentsListResponse = {
  success: boolean;
  error?: string;
  payments?: PaymentRecord[];
};

export const paymentsApi = {
  /**
   * Create a Razorpay order. With `hosted: true` the response carries a URL to
   * open; the caller is responsible for opening it and polling afterwards.
   */
  createBookingOrder: async (
    body: CreateBookingOrderRequest
  ): Promise<CreateBookingOrderResponse> => {
    const response = await ApiClient.post<CreateBookingOrderResponse>(
      '/v1/payments/booking-order',
      body
    );
    return response.data;
  },

  /**
   * Pay for a booking that already exists.
   *
   * The amount is not sent and cannot be: the server charges what the booking
   * was quoted at. Used for quote services billed after assessment, bookings an
   * organisation raised, and anything the customer left unpaid.
   */
  createSettleOrder: async (body: SettleBookingRequest): Promise<CreateBookingOrderResponse> => {
    const response = await ApiClient.post<CreateBookingOrderResponse>(
      '/v1/payments/booking-order',
      body
    );
    return response.data;
  },

  /**
   * Buy a plan. Same hosted-checkout shape as bookings, for the same reason:
   * the app has no payment SDK, so Razorpay's page does the collecting and the
   * webhook applies the upgrade.
   */
  createPlanOrder: async (body: PlanOrderRequest): Promise<PlanOrderResponse> => {
    const response = await ApiClient.post<PlanOrderResponse>('/v1/payments/plan-order', body);
    return response.data;
  },

  /** Plans available to this account, with the current one marked. */
  getPlans: async (type?: string): Promise<PlansResponse> => {
    const response = await ApiClient.get<PlansResponse>(
      type ? `/v1/plans?type=${encodeURIComponent(type)}` : '/v1/plans'
    );
    return response.data;
  },

  /** Receipts. Reads Payment rows, so refunds and failures show up as themselves. */
  listPayments: async (): Promise<PaymentsListResponse> => {
    const response = await ApiClient.get<PaymentsListResponse>('/v1/payments');
    return response.data;
  },

  /**
   * Ask the server what happened. Called after the customer returns from the
   * browser; PENDING is normal for a few seconds while the webhook lands.
   */
  getPaymentStatus: async (orderId: string): Promise<PaymentStatusResponse> => {
    const response = await ApiClient.get<PaymentStatusResponse>(
      `/v1/payments/${encodeURIComponent(orderId)}/status`
    );
    return response.data;
  },
};

/**
 * Map the checkout draft's pricing choice onto what the server expects.
 *
 * Returns null when the draft cannot be priced — a packages service with no
 * package chosen. Returning null rather than guessing matters: the server
 * refuses an unknown package outright, and silently defaulting to one would be
 * how a customer gets charged for something they did not pick.
 */
export function selectionFromDraft(draft: {
  pricingModel?: string | null;
  selectedPackageId?: string | null;
  hours?: number | null;
  days?: number | null;
}): PaymentSelection | null {
  switch (draft.pricingModel) {
    case 'packages':
      return draft.selectedPackageId
        ? { kind: 'package', packageId: draft.selectedPackageId }
        : null;
    case 'hourly':
      return draft.hours && draft.hours > 0 ? { kind: 'hourly', hours: draft.hours } : null;
    case 'daily':
      return draft.days && draft.days > 0 ? { kind: 'daily', days: draft.days } : null;
    case 'quote':
      return { kind: 'quote' };
    case 'fixed':
      return { kind: 'fixed' };
    default:
      return null;
  }
}
