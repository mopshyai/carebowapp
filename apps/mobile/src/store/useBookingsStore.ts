/**
 * Bookings — a cache of server state, not a second source of truth.
 *
 * Replaces four stores that between them held 1,024 lines and were imported by
 * nothing: ordersStore, useOrdersStore, requestsStore, useServiceRequestStore.
 * Those minted their own order ids, computed tax rates on the device, marked
 * orders paid locally, and persisted all of it to AsyncStorage — so the phone
 * and the server could disagree about what a customer owed, with the phone's
 * version surviving restarts.
 *
 * Rules this store keeps:
 *   - the server owns ids, prices, taxes, totals and status. Nothing is derived
 *     here that money depends on.
 *   - no persistence. Offline sync is deliberately out of scope, and a stale
 *     booking cached across restarts is worse than an empty list.
 *   - every mutation goes to the API first and reconciles from the response.
 *
 * "Orders" and "requests" are the same thing. RequestsScreen is a re-export of
 * OrdersScreen ("Real requests now live in Bookings"), and the backend has one
 * Booking model, so one store with derived views is the honest shape.
 *
 *   screen ──> fetch() ──> GET /v1/bookings ──> bookings[]
 *                                                  │
 *                    selectActive / selectPast / selectById (derived, no copies)
 */

import { create } from 'zustand';
import {
  memberApi,
  type V1Booking,
  type BookingStatus,
  type V1CancelResponse,
} from '../services/api/endpoints/member';

type RefundOutcome = NonNullable<V1CancelResponse['refund']>;

/** Treat cached bookings as fresh for this long before a background refetch. */
const STALE_AFTER_MS = 30_000;

const ACTIVE_STATUSES: BookingStatus[] = ['PENDING', 'CONFIRMED', 'IN_PROGRESS'];

export interface BookingsState {
  bookings: V1Booking[];
  status: 'idle' | 'loading' | 'ready' | 'error';
  /** User-facing message. Null whenever status !== 'error'. */
  error: string | null;
  lastFetchedAt: number | null;

  /** Load from the server. No-op if fresh, unless `force`. */
  fetch: (opts?: { force?: boolean; status?: BookingStatus }) => Promise<void>;
  /** Fetch one booking and merge it in. Used by the details screen. */
  fetchOne: (bookingId: string) => Promise<V1Booking | null>;
  create: (
    input: Parameters<typeof memberApi.createBooking>[0]
  ) => Promise<{ ok: true; booking: V1Booking } | { ok: false; error: string }>;
  /**
   * No reason parameter: the v1 cancel endpoint does not accept one today.
   * Reports the refund the server issued, so the screen can say what happened
   * to the customer's money instead of silently succeeding.
   */
  cancel: (
    bookingId: string
  ) => Promise<{ ok: true; refund?: RefundOutcome } | { ok: false; error: string }>;
  reset: () => void;
}

/** Replace by id, or append. Keeps a single row per booking. */
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

    if (status === 'loading') return; // in-flight request already covers this
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
      set({
        bookings: res.bookings ?? [],
        status: 'ready',
        error: null,
        lastFetchedAt: Date.now(),
      });
    } catch {
      // Network failure. Keep whatever is already on screen rather than
      // blanking the list underneath the user.
      set({ status: 'error', error: 'No connection. Pull to retry.' });
    }
  },

  fetchOne: async (bookingId) => {
    try {
      const res = await memberApi.getBooking(bookingId);
      if (!res.success || !res.booking) return null;
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
      // Merge the server's booking — its id, price and status, not ours.
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
        set((s) => ({ bookings: upsert(s.bookings, res.booking!) }));
      } else {
        // Server confirmed but returned no row: refetch rather than guess at
        // the resulting status locally.
        await get().fetch({ force: true });
      }
      return { ok: true as const, refund: res.refund };
    } catch {
      return { ok: false as const, error: 'No connection. Please try again.' };
    }
  },

  reset: () => set({ bookings: [], status: 'idle', error: null, lastFetchedAt: null }),
}));

// ============================================
// SELECTORS — derived views, never stored copies
// ============================================

export const selectActiveBookings = (s: BookingsState): V1Booking[] =>
  s.bookings.filter((b) => ACTIVE_STATUSES.includes(b.status));

export const selectPastBookings = (s: BookingsState): V1Booking[] =>
  s.bookings.filter((b) => b.status === 'COMPLETED' || b.status === 'CANCELLED');

export const selectBookingById =
  (bookingId: string) =>
  (s: BookingsState): V1Booking | undefined =>
    s.bookings.find((b) => b.id === bookingId);

export const selectIsLoading = (s: BookingsState): boolean => s.status === 'loading';
