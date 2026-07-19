import { ApiClient } from '../ApiClient';

export type CreateProductionBooking = {
  serviceId: string;
  profileId: string;
  scheduledAt: string;
  notes?: string;
  address?: string;
};

export type ProductionBooking = {
  id: string;
  userId: string;
  profileId: string;
  serviceId: string | null;
  scheduledAt: string;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes: string | null;
  address: string | null;
  amount: number;
  paymentStatus: string;
  service?: { name: string; category: string };
  profile?: { name: string };
};

type CreateBookingResponse = { success: boolean; booking: ProductionBooking };

export const toScheduledAt = (date: string, time: string): string => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error('A valid booking date and time are required.');
  }
  const scheduledAt = new Date(`${date}T${time}:00`);
  if (Number.isNaN(scheduledAt.getTime())) {
    throw new Error('A valid booking date and time are required.');
  }
  return scheduledAt.toISOString();
};

export const bookingsApi = {
  create: async (booking: CreateProductionBooking): Promise<ProductionBooking> => {
    const response = await ApiClient.post<CreateBookingResponse>('/v1/bookings', booking, {
      retries: 0,
    });
    return response.data.booking;
  },
};

export default bookingsApi;
