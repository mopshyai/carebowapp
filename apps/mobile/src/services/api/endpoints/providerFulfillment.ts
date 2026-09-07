import { ApiClient } from '../ApiClient';
import { ApiError } from '../types';

export type LabResultStatus =
  | 'ORDERED'
  | 'SAMPLE_COLLECTED'
  | 'PROCESSING'
  | 'REPORTED'
  | 'CANCELLED';

export type FulfillmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'RETURNED'
  | 'CANCELLED';

export type TripStatus =
  | 'REQUESTED'
  | 'DISPATCHED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'IN_TRANSIT'
  | 'COMPLETED'
  | 'CANCELLED';

export interface LabTestValue {
  name: string;
  value?: string | number | null;
  unit?: string | null;
  refRange?: string | null;
  flag?: string | null;
}

export interface AssignedLabTest {
  id: string;
  bookingId: string;
  bookingStatus: string;
  labStatus: LabResultStatus;
  serviceName: string;
  serviceCategory?: string | null;
  patientName: string;
  patientPhone?: string | null;
  scheduledAt: string;
  notes?: string | null;
  tests: LabTestValue[];
  sampleCollectedAt?: string | null;
  reportedAt?: string | null;
  reportFile?: { id: string; fileName: string; downloadUrl: string } | null;
}

export interface AssignedMedicineOrder {
  id: string;
  status: FulfillmentStatus;
  patientName: string;
  customerName?: string | null;
  customerPhone?: string | null;
  deliveryAddress?: string | null;
  totalAmount: number;
  currency: 'INR';
  notes?: string | null;
  items: Array<{
    id: string;
    name: string;
    dosage?: string | null;
    quantity: number;
    price: number;
  }>;
}

export interface AssignedRentalOrder {
  id: string;
  status: FulfillmentStatus;
  equipmentName: string;
  itemId: string;
  customer: string;
  customerPhone?: string | null;
  startDate: string;
  endDate: string;
  depositPaise: number;
  totalPaise: number;
  deliveryAddress?: string | null;
  availableUnits?: number | null;
}

export interface AssignedAmbulanceTrip {
  id: string;
  patient: string;
  customerName?: string | null;
  customerPhone?: string | null;
  pickupAddress?: string | null;
  destination?: string | null;
  pickupLat?: number | null;
  pickupLng?: number | null;
  status: TripStatus;
  requestedAt: string;
  dispatchedAt?: string | null;
  completedAt?: string | null;
  farePaise?: number | null;
  isEmergency: boolean;
}

type MutationResponse<T> = {
  error?: string;
  unchanged?: boolean;
  bookingSync?: unknown;
} & T;

async function patchWithClientError<T>(path: string, data: unknown): Promise<MutationResponse<T>> {
  try {
    const response = await ApiClient.patch<MutationResponse<T>>(path, data);
    return response.data;
  } catch (error) {
    if (error instanceof ApiError && error.status && error.status < 500) {
      const body = (error.body ?? {}) as MutationResponse<T>;
      return { ...body, error: body.error ?? error.message };
    }
    throw error;
  }
}

export const providerFulfillmentApi = {
  getLabTests: async (status?: LabResultStatus): Promise<{ tests: AssignedLabTest[] }> => {
    const response = await ApiClient.get<{ tests: AssignedLabTest[] }>('/v1/provider/assigned-tests', {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  updateLabTest: async (
    bookingId: string,
    status: LabResultStatus,
    input?: {
      tests?: LabTestValue[];
      notes?: string;
      reportFileId?: string;
    }
  ): Promise<MutationResponse<{ test?: AssignedLabTest | null }>> =>
    patchWithClientError('/v1/provider/assigned-tests', { bookingId, status, ...input }),

  getMedicineOrders: async (
    status?: FulfillmentStatus
  ): Promise<{ orders: AssignedMedicineOrder[] }> => {
    const response = await ApiClient.get<{ orders: AssignedMedicineOrder[] }>(
      '/v1/provider/assigned-orders',
      { params: status ? { status } : undefined }
    );
    return response.data;
  },

  updateMedicineOrder: async (
    orderId: string,
    status: FulfillmentStatus
  ): Promise<MutationResponse<{ order?: AssignedMedicineOrder | null }>> =>
    patchWithClientError('/v1/provider/assigned-orders', { orderId, status }),

  getRentalOrders: async (
    status?: FulfillmentStatus
  ): Promise<{ orders: AssignedRentalOrder[] }> => {
    const response = await ApiClient.get<{ orders: AssignedRentalOrder[] }>(
      '/v1/provider/rental-orders',
      { params: status ? { status } : undefined }
    );
    return response.data;
  },

  updateRentalOrder: async (
    orderId: string,
    status: FulfillmentStatus
  ): Promise<MutationResponse<{ order?: AssignedRentalOrder | null }>> =>
    patchWithClientError('/v1/provider/rental-orders', { orderId, status }),

  getActiveTrips: async (status?: TripStatus): Promise<{ trips: AssignedAmbulanceTrip[] }> => {
    const response = await ApiClient.get<{ trips: AssignedAmbulanceTrip[] }>(
      '/v1/provider/active-trips',
      { params: status ? { status } : undefined }
    );
    return response.data;
  },

  updateActiveTrip: async (
    tripId: string,
    status: TripStatus
  ): Promise<MutationResponse<{ trip?: AssignedAmbulanceTrip | null }>> =>
    patchWithClientError('/v1/provider/active-trips', { tripId, status }),
};
