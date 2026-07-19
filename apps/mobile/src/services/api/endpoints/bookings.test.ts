import { ApiClient } from '../ApiClient';
import { bookingsApi, toScheduledAt } from './bookings';

jest.mock('../ApiClient', () => ({ ApiClient: { post: jest.fn() } }));

const postMock = ApiClient.post as jest.Mock;

describe('bookingsApi production contract', () => {
  beforeEach(() => postMock.mockReset());

  it('creates a pending booking through the v1 endpoint', async () => {
    const booking = {
      id: 'booking_1',
      userId: 'user_1',
      profileId: 'profile_1',
      serviceId: 'service_1',
      scheduledAt: '2026-07-21T14:30:00.000Z',
      status: 'PENDING' as const,
      notes: null,
      address: null,
      amount: 80000,
      paymentStatus: 'PENDING',
    };
    postMock.mockResolvedValue({ data: { success: true, booking } });

    await expect(
      bookingsApi.create({
        serviceId: 'service_1',
        profileId: 'profile_1',
        scheduledAt: booking.scheduledAt,
      })
    ).resolves.toEqual(booking);
    expect(postMock).toHaveBeenCalledWith(
      '/v1/bookings',
      {
        serviceId: 'service_1',
        profileId: 'profile_1',
        scheduledAt: booking.scheduledAt,
      },
      { retries: 0 }
    );
  });

  it('builds a timezone-aware ISO timestamp and rejects incomplete input', () => {
    expect(toScheduledAt('2026-07-21', '14:30')).toBe(
      new Date('2026-07-21T14:30:00').toISOString()
    );
    expect(() => toScheduledAt('07/21/2026', '2:30 PM')).toThrow(
      'A valid booking date and time are required.'
    );
  });
});
