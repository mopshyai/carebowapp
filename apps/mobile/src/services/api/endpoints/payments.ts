/**
 * Paid bookings and plans.
 *
 * The server owns pricing and payment truth. Mobile opens Razorpay hosted
 * checkout and later asks the server whether the webhook confirmed payment.
 */

import ApiClient from '../ApiClient';

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
  amount?: number;
  currency?: string;
  serviceName?: string;
  selectionDescription?: string;
  paymentUrl?: string;
};

export type PaymentStatusResponse = {
  success: boolean;
  error?: string;
  status?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  kind?: 'booking' | 'plan';
  planSlug?: string | null;
  amount?: number;
  currency?: string;
  booking?: { id: string; status: string; scheduledAt: string } | null;
};

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

/**
 * React button state is not a synchronization primitive. Two taps can enter an
 * async handler before the disabled state rerenders. Keep payment-order creation
 * single-flight here so every screen gets the protection automatically.
 *
 * This dedupes only requests that are concurrently in flight. Once the first
 * call settles the key is removed, so an intentional later retry still creates
 * a fresh order.
 */
const inFlightOrderRequests = new Map<string, Promise<unknown>>();

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;

  const object = value as Record<string, unknown>;
  return `{${Object.keys(object)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(object[key])}`)
    .join(',')}}`;
}

function singleFlight<T>(key: string, operation: () => Promise<T>): Promise<T> {
  const existing = inFlightOrderRequests.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const promise = operation().finally(() => {
    if (inFlightOrderRequests.get(key) === promise) {
      inFlightOrderRequests.delete(key);
    }
  });

  inFlightOrderRequests.set(key, promise);
  return promise;
}

export const paymentsApi = {
  createBookingOrder: (body: CreateBookingOrderRequest): Promise<CreateBookingOrderResponse> =>
    singleFlight(`booking:${stableSerialize(body)}`, async () => {
      const response = await ApiClient.post<CreateBookingOrderResponse>(
        '/v1/payments/booking-order',
        body
      );
      return response.data;
    }),

  createSettleOrder: (body: SettleBookingRequest): Promise<CreateBookingOrderResponse> =>
    singleFlight(`settle:${stableSerialize(body)}`, async () => {
      const response = await ApiClient.post<CreateBookingOrderResponse>(
        '/v1/payments/booking-order',
        body
      );
      return response.data;
    }),

  createPlanOrder: (body: PlanOrderRequest): Promise<PlanOrderResponse> =>
    singleFlight(`plan:${stableSerialize(body)}`, async () => {
      const response = await ApiClient.post<PlanOrderResponse>('/v1/payments/plan-order', body);
      return response.data;
    }),

  getPlans: async (type?: string): Promise<PlansResponse> => {
    const response = await ApiClient.get<PlansResponse>(
      type ? `/v1/plans?type=${encodeURIComponent(type)}` : '/v1/plans'
    );
    return response.data;
  },

  listPayments: async (): Promise<PaymentsListResponse> => {
    const response = await ApiClient.get<PaymentsListResponse>('/v1/payments');
    return response.data;
  },

  getPaymentStatus: async (orderId: string): Promise<PaymentStatusResponse> => {
    const response = await ApiClient.get<PaymentStatusResponse>(
      `/v1/payments/${encodeURIComponent(orderId)}/status`
    );
    return response.data;
  },
};

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
