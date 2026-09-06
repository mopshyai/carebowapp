jest.mock('../ApiClient', () => ({
  __esModule: true,
  ApiClient: { patch: jest.fn(), post: jest.fn(), get: jest.fn() },
  default: { patch: jest.fn(), post: jest.fn(), get: jest.fn() },
}));

import { ApiClient } from '../ApiClient';
import { ApiError } from '../types';
import { memberApi } from './member';

const patch = ApiClient.patch as jest.Mock;
const get = ApiClient.get as jest.Mock;

describe('mobile provider booking API', () => {
  beforeEach(() => jest.clearAllMocks());

  it('loads provider work from the assignment-scoped endpoint', async () => {
    get.mockResolvedValueOnce({ data: { success: true, bookings: [] } });

    await memberApi.getProviderBookings('PENDING');

    expect(get).toHaveBeenCalledWith('/v1/provider/bookings', {
      params: { status: 'PENDING' },
    });
  });

  it('sends only the canonical booking id and requested provider transition', async () => {
    patch.mockResolvedValueOnce({
      data: { success: true, booking: { id: 'booking_1', status: 'CONFIRMED' } },
    });

    await memberApi.updateProviderBookingStatus('booking_1', 'CONFIRMED');

    expect(patch).toHaveBeenCalledWith('/v1/provider/bookings', {
      bookingId: 'booking_1',
      status: 'CONFIRMED',
    });
    const [, body] = patch.mock.calls[0];
    expect(Object.keys(body).sort()).toEqual(['bookingId', 'status']);
  });

  it('surfaces a provider authorization refusal without inventing local state', async () => {
    patch.mockRejectedValueOnce(
      ApiError.fromResponse(403, { success: false, error: 'Booking is assigned to another provider' })
    );

    const result = await memberApi.updateProviderBookingStatus('booking_1', 'CONFIRMED');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Booking is assigned to another provider');
    expect(result.booking).toBeUndefined();
  });

  it('passes through the server booking on success', async () => {
    patch.mockResolvedValueOnce({
      data: {
        success: true,
        unchanged: false,
        booking: { id: 'booking_1', status: 'IN_PROGRESS' },
      },
    });

    const result = await memberApi.updateProviderBookingStatus('booking_1', 'IN_PROGRESS');

    expect(result.success).toBe(true);
    expect(result.booking?.id).toBe('booking_1');
    expect(result.booking?.status).toBe('IN_PROGRESS');
  });

  it('throws on transport/server failure so the screen reloads canonical state', async () => {
    patch.mockRejectedValueOnce(ApiError.networkError());

    await expect(
      memberApi.updateProviderBookingStatus('booking_1', 'COMPLETED')
    ).rejects.toThrow();
  });
});
