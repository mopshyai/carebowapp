jest.mock('../ApiClient', () => ({
  __esModule: true,
  ApiClient: { patch: jest.fn(), post: jest.fn(), get: jest.fn() },
  default: { patch: jest.fn(), post: jest.fn(), get: jest.fn() },
}));

import { ApiClient } from '../ApiClient';
import { ApiError } from '../types';
import { memberApi } from './member';

const patch = ApiClient.patch as jest.Mock;
const post = ApiClient.post as jest.Mock;
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

  it('loads provider detail from the bounded provider projection', async () => {
    get.mockResolvedValueOnce({
      data: {
        success: true,
        booking: {
          id: 'booking_1',
          familyNotes: 'Please call on arrival',
          careHandoff: { source: 'ask_carebow', symptoms: ['fever'], lines: [] },
          documentationCapabilities: { consultationNote: true, prescription: false },
        },
      },
    });

    const result = await memberApi.getProviderBooking('booking_1');

    expect(get).toHaveBeenCalledWith('/v1/provider/bookings/booking_1');
    expect(result.booking?.familyNotes).toBe('Please call on arrival');
    expect(result.booking?.careHandoff?.symptoms).toEqual(['fever']);
    expect(result.booking?.documentationCapabilities?.consultationNote).toBe(true);
    expect(result.booking?.documentationCapabilities?.prescription).toBe(false);
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

  it('writes a consultation note through the provider JWT route and binds the booking id itself', async () => {
    post.mockResolvedValueOnce({
      data: {
        success: true,
        note: {
          id: 'note_1',
          bookingId: 'booking_1',
          chiefComplaint: 'Persistent fatigue',
          diagnosis: 'Viral syndrome',
        },
      },
    });

    const result = await memberApi.saveProviderConsultationNote('booking_1', {
      chiefComplaint: 'Persistent fatigue',
      diagnosis: 'Viral syndrome',
      findings: 'Stable findings',
      treatmentPlan: 'Hydration and monitoring',
    });

    expect(post).toHaveBeenCalledWith('/v1/provider/consultation-notes', {
      bookingId: 'booking_1',
      chiefComplaint: 'Persistent fatigue',
      diagnosis: 'Viral syndrome',
      findings: 'Stable findings',
      treatmentPlan: 'Hydration and monitoring',
    });
    expect(result.note?.bookingId).toBe('booking_1');
  });

  it('surfaces server scope refusals for clinical documentation', async () => {
    post.mockRejectedValueOnce(
      ApiError.fromResponse(403, {
        success: false,
        error: 'This provider role cannot author clinical consultation notes',
      })
    );

    const result = await memberApi.saveProviderConsultationNote('booking_1', {
      chiefComplaint: 'x',
      diagnosis: 'y',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('This provider role cannot author clinical consultation notes');
  });

  it('writes a prescription only through the server-owned provider route', async () => {
    post.mockResolvedValueOnce({
      data: {
        success: true,
        prescription: { id: 'rx_1', bookingId: 'booking_1', medicines: [] },
      },
    });

    const result = await memberApi.saveProviderPrescription('booking_1', {
      medicines: [{ name: 'Example item', dose: '1 unit' }],
      labTests: ['Follow-up test'],
      advice: 'Follow up as directed',
    });

    expect(post).toHaveBeenCalledWith('/v1/provider/prescriptions', {
      bookingId: 'booking_1',
      medicines: [{ name: 'Example item', dose: '1 unit' }],
      labTests: ['Follow-up test'],
      advice: 'Follow up as directed',
    });
    expect(result.prescription?.bookingId).toBe('booking_1');
  });
});
