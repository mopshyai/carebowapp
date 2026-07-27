/**
 * Bookings store — a cache, not a source of truth.
 *
 * The stores this replaced minted their own order ids, computed tax on the
 * device and persisted paid orders to AsyncStorage. These tests guard the rules
 * that make this one different.
 */

import {
  useBookingsStore,
  selectActiveBookings,
  selectPastBookings,
  selectBookingById,
} from './useBookingsStore';
import { memberApi, type V1Booking } from '../services/api/endpoints/member';

jest.mock('../services/api/endpoints/member', () => ({
  memberApi: {
    getBookings: jest.fn(),
    getBooking: jest.fn(),
    createBooking: jest.fn(),
    cancelBooking: jest.fn(),
  },
}));

const api = memberApi as jest.Mocked<typeof memberApi>;

const booking = (over: Partial<V1Booking> = {}): V1Booking =>
  ({
    id: 'bk_1',
    status: 'CONFIRMED',
    scheduledAt: '2026-08-01T10:00:00Z',
    amount: 250000,
    service: { name: 'Nurse visit' },
    profile: { name: 'Asha' },
    ...over,
  }) as V1Booking;

beforeEach(() => {
  jest.clearAllMocks();
  useBookingsStore.getState().reset();
});

describe('fetch', () => {
  it('loads bookings from the server', async () => {
    api.getBookings.mockResolvedValue({ success: true, bookings: [booking()] });

    await useBookingsStore.getState().fetch();

    expect(useBookingsStore.getState().bookings).toHaveLength(1);
    expect(useBookingsStore.getState().status).toBe('ready');
  });

  it('reuses the cache inside the freshness window', async () => {
    api.getBookings.mockResolvedValue({ success: true, bookings: [booking()] });

    await useBookingsStore.getState().fetch();
    await useBookingsStore.getState().fetch();

    expect(api.getBookings).toHaveBeenCalledTimes(1);
  });

  it('refetches when forced', async () => {
    api.getBookings.mockResolvedValue({ success: true, bookings: [booking()] });

    await useBookingsStore.getState().fetch();
    await useBookingsStore.getState().fetch({ force: true });

    expect(api.getBookings).toHaveBeenCalledTimes(2);
  });

  it('surfaces a server error without wiping what is on screen', async () => {
    api.getBookings.mockResolvedValue({ success: true, bookings: [booking()] });
    await useBookingsStore.getState().fetch();

    api.getBookings.mockRejectedValue(new Error('offline'));
    await useBookingsStore.getState().fetch({ force: true });

    const s = useBookingsStore.getState();
    expect(s.status).toBe('error');
    expect(s.error).toMatch(/No connection/);
    expect(s.bookings).toHaveLength(1); // still rendered, not blanked
  });
});

describe('create', () => {
  it('stores the server booking verbatim — no local id, price or tax', async () => {
    const serverBooking = booking({ id: 'bk_server_generated', amount: 999900 });
    api.createBooking.mockResolvedValue({ success: true, booking: serverBooking });

    const result = await useBookingsStore.getState().create({
      serviceId: 'svc_1',
      profileId: 'prof_1',
      scheduledAt: '2026-08-01T10:00:00Z',
    } as never);

    expect(result).toEqual({ ok: true, booking: serverBooking });

    const stored = useBookingsStore.getState().bookings[0];
    expect(stored.id).toBe('bk_server_generated');
    expect(stored.amount).toBe(999900);
  });

  it('returns an error rather than optimistically inserting a booking', async () => {
    api.createBooking.mockResolvedValue({ success: false, error: 'Service unavailable' });

    const result = await useBookingsStore.getState().create({} as never);

    expect(result).toEqual({ ok: false, error: 'Service unavailable' });
    expect(useBookingsStore.getState().bookings).toHaveLength(0);
  });
});

describe('cancel', () => {
  it('reconciles from the server response', async () => {
    api.getBookings.mockResolvedValue({ success: true, bookings: [booking()] });
    await useBookingsStore.getState().fetch();

    api.cancelBooking.mockResolvedValue({
      success: true,
      booking: booking({ status: 'CANCELLED' }),
    });
    const result = await useBookingsStore.getState().cancel('bk_1');

    expect(result).toEqual({ ok: true });
    expect(useBookingsStore.getState().bookings[0].status).toBe('CANCELLED');
  });

  it('does not change local status when the server refuses', async () => {
    api.getBookings.mockResolvedValue({ success: true, bookings: [booking()] });
    await useBookingsStore.getState().fetch();

    api.cancelBooking.mockResolvedValue({ success: false, error: 'Too late to cancel' });
    const result = await useBookingsStore.getState().cancel('bk_1');

    expect(result).toEqual({ ok: false, error: 'Too late to cancel' });
    expect(useBookingsStore.getState().bookings[0].status).toBe('CONFIRMED');
  });
});

describe('upsert', () => {
  it('replaces by id instead of duplicating', async () => {
    api.getBookings.mockResolvedValue({ success: true, bookings: [booking()] });
    await useBookingsStore.getState().fetch();

    api.getBooking.mockResolvedValue({
      success: true,
      booking: booking({ status: 'COMPLETED' }),
    });
    await useBookingsStore.getState().fetchOne('bk_1');

    const s = useBookingsStore.getState();
    expect(s.bookings).toHaveLength(1);
    expect(s.bookings[0].status).toBe('COMPLETED');
  });
});

describe('selectors', () => {
  it('split active from past without storing separate copies', async () => {
    api.getBookings.mockResolvedValue({
      success: true,
      bookings: [
        booking({ id: 'a', status: 'PENDING' }),
        booking({ id: 'b', status: 'IN_PROGRESS' }),
        booking({ id: 'c', status: 'COMPLETED' }),
        booking({ id: 'd', status: 'CANCELLED' }),
      ],
    });
    await useBookingsStore.getState().fetch();

    const s = useBookingsStore.getState();
    expect(selectActiveBookings(s).map((b) => b.id)).toEqual(['a', 'b']);
    expect(selectPastBookings(s).map((b) => b.id)).toEqual(['c', 'd']);
    expect(selectBookingById('c')(s)?.status).toBe('COMPLETED');
    expect(s.bookings).toHaveLength(4); // one list, derived views
  });
});

describe('persistence', () => {
  it('keeps nothing across a reset — no AsyncStorage rehydration', async () => {
    api.getBookings.mockResolvedValue({ success: true, bookings: [booking()] });
    await useBookingsStore.getState().fetch();

    useBookingsStore.getState().reset();

    const s = useBookingsStore.getState();
    expect(s.bookings).toEqual([]);
    expect(s.lastFetchedAt).toBeNull();
  });
});
