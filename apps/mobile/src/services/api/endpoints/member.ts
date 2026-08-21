/**
 * Member / Provider API (mobile, JWT-authenticated v1 endpoints only)
 */

import type { CareReferralContext } from '@/data/types';
import { ApiClient } from '../ApiClient';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface V1Booking {
  id: string;
  scheduledAt: string;
  status: BookingStatus;
  /** Minor units of `currency` — paise for INR, cents for USD. */
  amount: number;
  currency?: 'INR' | 'USD';
  paymentStatus?: string;
  /** Provider/customer booking handoff. Includes sanitized Ask CareBow referral when present. */
  notes?: string | null;
  address?: string | null;
  service?: { name: string; category: string } | null;
  profile?: { name: string } | null;
  provider?: { name: string; image?: string | null } | null;
  user?: { name?: string; email?: string; phoneNumber?: string | null } | null;
}

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

  /** Submit a real pending booking for a service that is free to request now. */
  createBooking: async (data: {
    serviceId: string;
    profileId: string;
    scheduledAt: string;
    notes?: string;
    address?: string;
    careContext?: CareReferralContext;
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

  getProviderProfile: async (): Promise<V1ProviderProfileResponse> => {
    const response = await ApiClient.get<V1ProviderProfileResponse>('/v1/provider/profile');
    return response.data;
  },

  getOverview: async (): Promise<MemberOverviewResponse> => {
    const response = await ApiClient.get<MemberOverviewResponse>('/v1/member/overview');
    return response.data;
  },
};
