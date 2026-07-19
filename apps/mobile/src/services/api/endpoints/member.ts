/**
 * Member / Provider API (mobile, JWT-authenticated v1 endpoints only)
 *
 * IMPORTANT: the backend's `member/*`, `provider/stats`, and `dashboard/*`
 * routes authenticate with WEB SESSION COOKIES (getCurrentUser) and return 401
 * to the mobile v1 JWT — they are NOT usable from the app. The only
 * JWT-accessible provider data today is:
 *   - GET /v1/bookings          → bookings where I'm the provider or the user
 *   - GET /v1/provider/profile  → provider profile (rating, verification)
 *   - GET /v1/services          → service catalog
 * So the provider home derives its dashboard aggregates CLIENT-SIDE from
 * /v1/bookings. A server-side /v1/member/overview is tracked as backend work.
 * Verified against source `mopshyai/carebow-main` + live JWT calls 2026-07-19.
 */

import { ApiClient } from '../ApiClient';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export interface V1Booking {
  id: string;
  scheduledAt: string;
  status: BookingStatus;
  amount: number; // paise
  service?: { name: string; category: string } | null;
  profile?: { name: string } | null;
  provider?: { name: string; image?: string | null } | null;
  user?: { name?: string; email?: string } | null;
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

/** Aggregates derived client-side from the provider's bookings. */
export interface MemberOverview {
  todayCount: number;
  pendingCount: number;
  completedTotal: number;
  totalPatients: number;
  earningsThisMonthPaise: number;
  nextAppointment: { scheduledAt: string; patientName: string; service: string; status: string } | null;
  recentActivity: Array<{ id: string; patientName: string; service: string; scheduledAt: string; status: string; amount: number }>;
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/** Fold a bookings list into the home dashboard aggregates. */
export function deriveOverview(bookings: V1Booking[]): MemberOverview {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const patientNames = new Set<string>();
  let todayCount = 0;
  let pendingCount = 0;
  let completedTotal = 0;
  let earningsThisMonthPaise = 0;

  for (const b of bookings) {
    const when = new Date(b.scheduledAt);
    const who = b.profile?.name || b.user?.name || b.user?.email;
    if (who) patientNames.add(who);
    if (isSameDay(when, now)) todayCount++;
    if (b.status === 'PENDING') pendingCount++;
    if (b.status === 'COMPLETED') {
      completedTotal++;
      if (when >= monthStart) earningsThisMonthPaise += b.amount ?? 0;
    }
  }

  const upcoming = bookings
    .filter((b) => new Date(b.scheduledAt) >= now && b.status !== 'CANCELLED' && b.status !== 'COMPLETED')
    .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
  const next = upcoming[0];

  return {
    todayCount,
    pendingCount,
    completedTotal,
    totalPatients: patientNames.size,
    earningsThisMonthPaise,
    nextAppointment: next
      ? {
          scheduledAt: next.scheduledAt,
          patientName: next.profile?.name || next.user?.name || 'Client',
          service: next.service?.name ?? '—',
          status: next.status,
        }
      : null,
    recentActivity: [...bookings]
      .sort((a, b) => +new Date(b.scheduledAt) - +new Date(a.scheduledAt))
      .slice(0, 6)
      .map((b) => ({
        id: b.id,
        patientName: b.profile?.name || b.user?.name || 'Client',
        service: b.service?.name ?? '—',
        scheduledAt: b.scheduledAt,
        status: b.status,
        amount: b.amount ?? 0,
      })),
  };
}

export const memberApi = {
  /** All bookings involving me (as provider or user). JWT-accessible. */
  getBookings: async (status?: BookingStatus): Promise<V1BookingsResponse> => {
    const response = await ApiClient.get<V1BookingsResponse>('/v1/bookings', {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  /** Provider profile: rating, reviews, verification. JWT-accessible. */
  getProviderProfile: async (): Promise<V1ProviderProfileResponse> => {
    const response = await ApiClient.get<V1ProviderProfileResponse>('/v1/provider/profile');
    return response.data;
  },

  /**
   * Home dashboard aggregates. Prefers the server-side v1/member/overview
   * endpoint (added in backend PR feat/v1-member-overview); if that isn't
   * deployed yet (404) or errors, falls back to deriving the same shape
   * client-side from /v1/bookings so the app works either way.
   */
  getOverview: async (): Promise<{ success: boolean; error?: string; overview?: MemberOverview }> => {
    try {
      const response = await ApiClient.get<{ success: boolean; error?: string; overview?: MemberOverview }>(
        '/v1/member/overview'
      );
      if (response.data?.success && response.data.overview) {
        return response.data;
      }
    } catch {
      // fall through to client-side derivation
    }
    const res = await memberApi.getBookings();
    if (!res.success) return { success: false, error: res.error };
    return { success: true, overview: deriveOverview(res.bookings ?? []) };
  },
};
