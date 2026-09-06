/**
 * Member / Provider API (mobile, JWT-authenticated v1 endpoints only)
 */

import type { CareReferralContext } from '@/data/types';
import { ApiClient } from '../ApiClient';
import { ApiError } from '../types';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ProviderBookingTransition = 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ProviderFulfillmentKind =
  | 'standard'
  | 'lab'
  | 'pharmacy'
  | 'equipment'
  | 'ambulance'
  | 'unknown';

export interface V1ProviderFulfillment {
  kind: ProviderFulfillmentKind;
  targetType: string | null;
  targetId: string | null;
  status: string | null;
  genericLifecycleAllowed: boolean;
  workflowRequired: boolean;
}

export interface V1ConsultationNote {
  id: string;
  bookingId?: string;
  chiefComplaint: string;
  findings?: string | null;
  diagnosis: string;
  treatmentPlan?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface V1Prescription {
  id: string;
  bookingId?: string;
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

export interface V1ProviderCareHandoff {
  source: 'ask_carebow';
  disclaimer: string;
  triageLevel?: string | null;
  requestedCare?: string | null;
  symptoms: string[];
  episodeId?: string | null;
  chatSessionId?: string | null;
  lines: string[];
}

export interface V1ProviderPatientProfile {
  id?: string;
  name: string;
  dateOfBirth?: string | null;
  gender?: string | null;
  bloodGroup?: string | null;
  conditions?: string | null;
  allergies?: string | null;
  medications?: string | null;
}

export interface V1ProviderDocumentationCapabilities {
  consultationNote: boolean;
  prescription: boolean;
}

export interface V1Booking {
  id: string;
  scheduledAt: string;
  status: BookingStatus;
  /** Minor units of `currency` — paise for INR, cents for USD. */
  amount: number;
  currency?: 'INR' | 'USD';
  paymentStatus?: string;
  /** Generic customer-facing routes may still return immutable raw Booking notes. */
  notes?: string | null;
  /** Provider routes split the family note from the bounded Ask CareBow handoff. */
  familyNotes?: string | null;
  careHandoff?: V1ProviderCareHandoff | null;
  documentationCapabilities?: V1ProviderDocumentationCapabilities;
  /** Server-owned workflow descriptor. Specialized jobs never use generic lifecycle buttons. */
  fulfillment?: V1ProviderFulfillment;
  address?: string | null;
  service?: { name: string; category: string } | null;
  profile?: V1ProviderPatientProfile | null;
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
  code?: string;
  error?: string;
  booking?: V1Booking;
  fulfillment?: V1ProviderFulfillment;
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

export type ProviderConsultationNoteInput = {
  chiefComplaint: string;
  diagnosis: string;
  findings?: string;
  treatmentPlan?: string;
};

export type ProviderPrescriptionInput = {
  medicines?: Array<{
    name: string;
    dose?: string;
    frequency?: string;
    duration?: string;
  }>;
  labTests?: string[];
  advice?: string;
  nextReview?: string;
};

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

  /**
   * Provider-only detail projection. Returns bounded patient context and splits
   * family notes from Ask CareBow referral metadata instead of exposing the raw
   * Booking.notes delimiter block.
   */
  getProviderBooking: async (
    bookingId: string
  ): Promise<{ success: boolean; error?: string; booking?: V1Booking }> => {
    const response = await ApiClient.get<{ success: boolean; error?: string; booking?: V1Booking }>(
      `/v1/provider/bookings/${bookingId}`
    );
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

  /** Fetch one customer/provider-visible booking plus durable provider outcome. */
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
      if (error instanceof ApiError && error.status && error.status < 500) {
        const body = (error.body ?? {}) as Partial<V1RescheduleResponse>;
        return {
          success: false,
          error: body.error ?? error.message,
          requiresOperations: body.requiresOperations,
          currentStatus: body.currentStatus,
        };
      }
      throw error;
    }
  },

  /**
   * Advance a standard assigned provider Booking through the canonical server lifecycle.
   * Specialized lab/pharmacy/equipment/ambulance jobs are rejected by the server and
   * must use their native fulfillment workflow.
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
        return {
          success: false,
          code: body.code,
          error: body.error ?? error.message,
          fulfillment: body.fulfillment,
        };
      }
      throw error;
    }
  },

  saveProviderConsultationNote: async (
    bookingId: string,
    input: ProviderConsultationNoteInput
  ): Promise<{ success: boolean; error?: string; note?: V1ConsultationNote }> => {
    try {
      const response = await ApiClient.post<{
        success: boolean;
        error?: string;
        note?: V1ConsultationNote;
      }>('/v1/provider/consultation-notes', { bookingId, ...input });
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && error.status && error.status < 500) {
        const body = (error.body ?? {}) as { error?: string };
        return { success: false, error: body.error ?? error.message };
      }
      throw error;
    }
  },

  saveProviderPrescription: async (
    bookingId: string,
    input: ProviderPrescriptionInput
  ): Promise<{ success: boolean; error?: string; prescription?: V1Prescription }> => {
    try {
      const response = await ApiClient.post<{
        success: boolean;
        error?: string;
        prescription?: V1Prescription;
      }>('/v1/provider/prescriptions', { bookingId, ...input });
      return response.data;
    } catch (error) {
      if (error instanceof ApiError && error.status && error.status < 500) {
        const body = (error.body ?? {}) as { error?: string };
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
