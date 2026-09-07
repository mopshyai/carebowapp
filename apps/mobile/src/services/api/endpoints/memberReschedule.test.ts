jest.mock('../ApiClient', () => ({
  __esModule: true,
  ApiClient: { post: jest.fn(), get: jest.fn() },
  default: { post: jest.fn(), get: jest.fn() },
}));

import { ApiClient } from '../ApiClient';
import { ApiError } from '../types';
import { memberApi } from './member';

const post = ApiClient.post as jest.Mock;

const SCHEDULED_AT = '2026-09-12T14:30:00.000Z';

describe('memberApi.rescheduleBooking', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends only the canonical booking id and an ISO timestamp', async () => {
    post.mockResolvedValueOnce({ data: { success: true, booking: { id: 'booking_1' } } });

    await memberApi.rescheduleBooking('booking_1', SCHEDULED_AT);

    expect(post).toHaveBeenCalledWith('/v1/bookings/booking_1/reschedule', {
      scheduledAt: SCHEDULED_AT,
    });
    // Price, provider, profile and status are server-owned for this booking.
    const [, body] = post.mock.calls[0];
    expect(Object.keys(body)).toEqual(['scheduledAt']);
  });

  it('surfaces a confirmed booking as requiring operations, not as a generic failure', async () => {
    post.mockRejectedValueOnce(
      ApiError.fromResponse(409, {
        success: false,
        error: 'This booking is already confirmed.',
        requiresOperations: true,
        currentStatus: 'CONFIRMED',
      })
    );

    const result = await memberApi.rescheduleBooking('booking_1', SCHEDULED_AT);

    expect(result.success).toBe(false);
    expect(result.requiresOperations).toBe(true);
    expect(result.currentStatus).toBe('CONFIRMED');
    expect(result.error).toBe('This booking is already confirmed.');
  });

  it('surfaces a materialized custom job as requiring operations', async () => {
    post.mockRejectedValueOnce(
      ApiError.fromResponse(409, {
        success: false,
        error: 'CareBow operations must confirm a new time with the provider.',
        requiresOperations: true,
        currentStatus: 'PENDING',
      })
    );

    const result = await memberApi.rescheduleBooking('booking_1', SCHEDULED_AT);

    expect(result.success).toBe(false);
    expect(result.requiresOperations).toBe(true);
  });

  it('reports revoked patient access as a refusal rather than throwing', async () => {
    post.mockRejectedValueOnce(
      ApiError.fromResponse(404, { success: false, error: 'Profile not found' })
    );

    const result = await memberApi.rescheduleBooking('booking_1', SCHEDULED_AT);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Profile not found');
    expect(result.requiresOperations).toBeUndefined();
  });

  it('never reports a network failure as a booking state', async () => {
    post.mockRejectedValueOnce(ApiError.networkError());

    // A transport failure says nothing about whether the booking moved, so the
    // caller must reload from the server instead of rendering an outcome.
    await expect(memberApi.rescheduleBooking('booking_1', SCHEDULED_AT)).rejects.toThrow();
  });

  it('passes through the server verdict on success, including provider release', async () => {
    post.mockResolvedValueOnce({
      data: {
        success: true,
        booking: { id: 'booking_1', scheduledAt: SCHEDULED_AT, status: 'PENDING' },
        unchanged: false,
        providerReleased: true,
      },
    });

    const result = await memberApi.rescheduleBooking('booking_1', SCHEDULED_AT);

    expect(result.success).toBe(true);
    expect(result.booking?.id).toBe('booking_1');
    expect(result.providerReleased).toBe(true);
  });
});
