/**
 * Member / Provider API (mobile, JWT-authenticated v1 endpoints only)
 *
 * GET /v1/member/overview serves provider dashboard aggregates directly.
 * Other JWT-accessible provider data:
 *   - GET /v1/bookings          → bookings where I'm the provider or the user
 *   - GET /v1/provider/profile  → provider profile (rating, verification)
 *   - GET /v1/services          → service catalog
 */

import { ApiClient } from '../ApiClient';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface V1Booking {
  id: string;
  scheduledAt: string;
  status: BookingStatus;
  /** Minor units of `currency` — paise for INR, cents for USD. */
  amount: number;
  /**
   * What `amount` is denominated in. Absent on rows created before
   * dual-currency pricing, which were all INR.
   */
  currency?: 'INR' | 'USD';
  /**
   * PENDING | PAID | REFUNDED | REFUND_PENDING. A booking can be unpaid for
   * ordinary reasons — a quote billed after assessment, one an organisation
   * raised — so this is what decides whether to offer a Pay button.
   */
  paymentStatus?: string;
  /** Provider/customer booking handoff. Includes sanitized Ask CareBow referral when present. */
  notes?: string | null;
  address?: string | null;
  service?: { name: string; category: string } | null;
  profile?: { name: string } | null;
  provider?: { name: string; image?: string | null } | null;
  user?: { name?: string; email?: string; phoneNumber?: string | null } | null;
}

/**
 * What cancelling did to the money. A cancelled booking that was paid for is
 * refunded in full by the server, and the customer should be told so rather
 * than left wondering.
 *
 *   ISSUED  — refund sent
 *   NONE    — nothing was ever captured
 *   PENDING — refund owed, the processor call failed; ops completes it
 */
export interface V1CancelResponse {
  success: boolean;
  error?: string;
  booking?: V1Booking;
  refund?: { status: 'ISSUED' | 'NONE' | 'PENDING'; amount?: number };
}

export interface V1BookingsResponse {
  success: boolean;
  error?: string;
  bookings?: V1Booking[];
}

export interface V1ProviderProfile {
  avgRating?: number;
  totalReviews?: number;
  isVerified?: boolean;
  providerType?: string;
  [key: string]: unknown;
}

export interface V1ProviderProfileResponse {
  success: boolean;
  error?: string;
  profile?: V1ProviderProfile | null;
}

/** Home dashboard aggregates served by GET /v1/member/overview. */
export interface MemberOverview {
  todayCount: number;
  pendingCount: number;
  completedTotal: number;
  totalPatients: number;
  earningsThisMonthPaise: number;
  nextAppointment: {
    id: string;
    scheduledAt: string;
    patientName: string;
    service: string;
    status: string;
  } | null;
  recentActivity: Array<{
    id: string;
    patientName: string;
    service: string;
    scheduledAt: string;
    status: string;
    amount: number;
  }>;
}

export interface MemberOverviewResponse {
  success: boolean;
  error?: string;
  overview?: MemberOverview;
}

export const memberApi = {
  /** All bookings involving me (as provider or user). JWT-accessible. */
  getBookings: async (status?: BookingStatus): Promise<V1BookingsResponse> => {
    const response = await ApiClient.get<V1BookingsResponse>('/v1/bookings', {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  /** Submit a real pending booking. The care team confirms availability later. */
  createBooking: async (data: {
    serviceId: string;
    profileId: string;
    scheduledAt: string;
    notes?: string;
    address?: string;
  }): Promise<{ success: boolean; error?: string; booking?: V1Booking }> => {
    const response = await ApiClient.post<{
      success: boolean;
      error?: string;
      booking?: V1Booking;
    }>('/v1/bookings', data);
    return response.data;
  },

  getBooking: async (
    bookingId: string
  ): Promise<{ success: boolean; error?: string; booking?: V1Booking }> => {
    const response = await ApiClient.get<{ success: boolean; error?: string; booking?: V1Booking }>(
      `/v1/bookings/${bookingId}`
    );
    return response.data;
  },

  cancelBooking: async (bookingId: string): Promise<V1CancelResponse> => {
    const response = await ApiClient.post<V1CancelResponse>(`/v1/bookings/${bookingId}/cancel`, {});
    return response.data;
  },

  /** Provider profile: rating, reviews, verification. JWT-accessible. */
  getProviderProfile: async (): Promise<V1ProviderProfileResponse> => {
    const response = await ApiClient.get<V1ProviderProfileResponse>('/v1/provider/profile');
    return response.data;
  },

  /** Home dashboard aggregates. JWT-accessible. */
  getOverview: async (): Promise<MemberOverviewResponse> => {
    const response = await ApiClient.get<MemberOverviewResponse>('/v1/member/overview');
    return response.data;
  },
};
