/**
 * Bookings — a cache of server state, not a second source of truth.
 *
 * The server owns ids, prices, taxes, totals and status. This store caches that
 * truth and reconciles Ask CareBow referrals and provider outcomes back to the
 * local longitudinal health episode.
 */

import { create } from 'zustand';
import {
  memberApi,
  type V1Booking,
  type BookingStatus,
  type V1CancelResponse,
} from '../services/api/endpoints/member';
import { useEpisodeStore } from './episodeStore';

type RefundOutcome = NonNullable<V1CancelResponse['refund']>;

const STALE_AFTER_MS = 30_000;
const ACTIVE_STATUSES: BookingStatus[] = ['PENDING', 'CONFIRMED', 'IN_PROGRESS'];

function referralEpisodeId(booking: V1Booking): string | null {
  if (!booking.notes) return null;
  const match = booking.notes.match(/(?:^|\n)CareBow episode:\s*([^\n]+)/i);
  return match?.[1]?.trim() || null;
}

function reconcileBookingToEpisode(booking: V1Booking): void {
  const episodeId = referralEpisodeId(booking);
  if (!episodeId) return;

  const episodeStore = useEpisodeStore.getState();
  episodeStore.linkBooking(episodeId, booking.id, booking.status);

  if (booking.consultationNote || booking.prescription) {
    episodeStore.recordProviderOutcome(episodeId, {
      bookingId: booking.id,
      providerName: booking.provider?.name,
      diagnosis: booking.consultationNote?.diagnosis,
      treatmentPlan: booking.consultationNote?.treatmentPlan,
      advice: booking.prescription?.advice,
      labTests: booking.prescription?.labTests,
      nextReview: booking.prescription?.nextReview,
      recordedAt:
        booking.consultationNote?.updatedAt ||
        booking.prescription?.updatedAt ||
        new Date().toISOString(),
    });
  }
}

function reconcileBookingsToEpisodes(bookings: V1Booking[]): void {
  bookings.forEach(reconcileBookingToEpisode);
}

export interface BookingsState {
  bookings: V1Booking[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  lastFetchedAt: number | null;

  fetch: (opts?: { force?: boolean; status?: BookingStatus }) => Promise<void>;
  fetchOne: (bookingId: string) => Promise<V1Booking | null>;
  create: (
    input: Parameters<typeof memberApi.createBooking>[0]
  ) => Promise<{ ok: true; booking: V1Booking } | { ok: false; error: string }>;
  cancel: (
    bookingId: string
  ) => Promise<{ ok: true; refund?: RefundOutcome } | { ok: false; error: string }>;
  reset: () => void;
}

function upsert(list: V1Booking[], booking: V1Booking): V1Booking[] {
  const i = list.findIndex((b) => b.id === booking.id);
  if (i === -1) return [booking, ...list];
  const next = [...list];
  next[i] = booking;
  return next;
}

export const useBookingsStore = create<BookingsState>((set, get) => ({
  bookings: [],
  status: 'idle',
  error: null,
  lastFetchedAt: null,

  fetch: async (opts = {}) => {
    const { lastFetchedAt, status } = get();

    if (status === 'loading') return;
    if (!opts.force && lastFetchedAt !== null && Date.now() - lastFetchedAt < STALE_AFTER_MS) {
      return;
    }

    set({ status: 'loading', error: null });

    try {
      const res = await memberApi.getBookings(opts.status);
      if (!res.success) {
        set({ status: 'error', error: res.error || 'Could not load your bookings.' });
        return;
      }
      const bookings = res.bookings ?? [];
      reconcileBookingsToEpisodes(bookings);
      set({
        bookings,
        status: 'ready',
        error: null,
        lastFetchedAt: Date.now(),
      });
    } catch {
      set({ status: 'error', error: 'No connection. Pull to retry.' });
    }
  },

  fetchOne: async (bookingId) => {
    try {
      const res = await memberApi.getBooking(bookingId);
      if (!res.success || !res.booking) return null;
      reconcileBookingToEpisode(res.booking);
      set((s) => ({ bookings: upsert(s.bookings, res.booking!) }));
      return res.booking;
    } catch {
      return null;
    }
  },

  create: async (input) => {
    try {
      const res = await memberApi.createBooking(input);
      if (!res.success || !res.booking) {
        return { ok: false as const, error: res.error || 'Could not create the booking.' };
      }
      reconcileBookingToEpisode(res.booking);
      set((s) => ({ bookings: upsert(s.bookings, res.booking!), lastFetchedAt: Date.now() }));
      return { ok: true as const, booking: res.booking };
    } catch {
      return { ok: false as const, error: 'No connection. Please try again.' };
    }
  },

  cancel: async (bookingId) => {
    try {
      const res = await memberApi.cancelBooking(bookingId);
      if (!res.success) {
        return { ok: false as const, error: res.error || 'Could not cancel the booking.' };
      }
      if (res.booking) {
        reconcileBookingToEpisode(res.booking);
        set((s) => ({ bookings: upsert(s.bookings, res.booking!) }));
      } else {
        await get().fetch({ force: true });
      }
      return { ok: true as const, refund: res.refund };
    } catch {
      return { ok: false as const, error: 'No connection. Please try again.' };
    }
  },

  reset: () => set({ bookings: [], status: 'idle', error: null, lastFetchedAt: null }),
}));

export const selectActiveBookings = (s: BookingsState): V1Booking[] =>
  s.bookings.filter((b) => ACTIVE_STATUSES.includes(b.status));

export const selectPastBookings = (s: BookingsState): V1Booking[] =>
  s.bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'CANCELLED');

export const selectBookingById =
  (bookingId: string) =>
  (s: BookingsState): V1Booking | undefined =>
    s.bookings.find((b) => b.id === bookingId);

export const selectIsLoading = (s: BookingsState): boolean => s.status === 'loading';
