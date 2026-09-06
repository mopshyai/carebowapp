/**
 * Member / Provider API (mobile, JWT-authenticated v1 endpoints only)
 */

import type { CareReferralContext } from '@/data/types';
import { ApiClient } from '../ApiClient';
import { ApiError } from '../types';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ProviderBookingTransition = 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface V1ConsultationNote {
  id: string;
  chiefComplaint: string;
  findings?: string | null;
  diagnosis: string;
  treatmentPlan?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface V1Prescription {
  id: string;
  medicines?: Array<{
    name?: string;
    dose?: string;
    frequency?: string;
    duration?: string;
    [key: string]: unknown;
  }> | null;
  labTests?: string[];
  advice?: string | null;
  nextReview?: string | null;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

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
  consultationNote?: V1ConsultationNote | null;
  prescription?: V1Prescription | null;
}

export interface V1CancelResponse {
  success: boolean;
  error?: string;
  booking?: V1Booking;
  refund?: { status: 'ISSUED' | 'NONE' | 'PENDING'; amount?: number };
}

export interface V1RescheduleResponse {
  success: boolean;
  error?: string;
  booking?: V1Booking;
  unchanged?: boolean;
  providerReleased?: boolean;
  requiresOperations?: boolean;
  currentStatus?: BookingStatus;
}

export interface V1BookingsResponse {
  success: boolean;
  error?: string;
  bookings?: V1Booking[];
}

export interface V1ProviderTransitionResponse {
  success: boolean;
  error?: string;
  booking?: V1Booking;
  unchanged?: boolean;
  refund?: { status: 'ISSUED' | 'NONE' | 'PENDING'; amount?: number };
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

  /** Assigned work only. Keeps a provider's own customer bookings out of their work queue. */
  getProviderBookings: async (status?: BookingStatus): Promise<V1BookingsResponse> => {
    const response = await ApiClient.get<V1BookingsResponse>('/v1/provider/bookings', {
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

  /** Fetch one booking plus any provider-authored consultation/prescription outcome. */
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

  /**
   * Move the requested time on the same canonical Booking. The server may reject
   * this when the booking is confirmed, custom-care-backed, no longer PENDING,
   * or the user's patient access changed while this screen was open.
   */
  rescheduleBooking: async (
    bookingId: string,
    scheduledAt: string
  ): Promise<V1RescheduleResponse> => {
    try {
      const response = await ApiClient.post<V1RescheduleResponse>(
        `/v1/bookings/${bookingId}/reschedule`,
        { scheduledAt }
      );
      return response.data;
    } catch (error) {
      // The server refuses a reschedule with a real HTTP status: 409 for a
      // confirmed booking or a materialized custom job, 404 for someone else's
      // booking or revoked patient access, 400 for an impossible time. Those
      // are answers, not transport failures, and the body carries the reason
      // and whether operations has to confirm the new time -- so surface them
      // instead of collapsing them into "something went wrong".
      if (error instanceof ApiError && error.status && error.status < 500) {
        const body = (error.body ?? {}) as Partial<V1RescheduleResponse>;
        return {
          success: false,
          error: body.error ?? error.message,
          requiresOperations: body.requiresOperations,
          currentStatus: body.currentStatus,
        };
      }
      // A genuine network/server failure is not a booking fact. Let it throw so
      // the caller reloads from the server rather than reporting a state.
      throw error;
    }
  },

  /**
   * Advance an assigned provider Booking through the canonical server lifecycle.
   * The JWT route performs provider authorization and owns every status write.
   */
  updateProviderBookingStatus: async (
    bookingId: string,
    status: ProviderBookingTransition
  ): Promise<V1ProviderTransitionResponse> => {
    try {
      const response = await ApiClient.patch<V1ProviderTransitionResponse>('/v1/provider/bookings', {
        bookingId,
        status,
      });
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && error.status && error.status < 500) {
        const body = (error.body ?? {}) as Partial<V1ProviderTransitionResponse>;
        return { success: false, error: body.error ?? error.message };
      }
      throw error;
    }
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