/**
 * Service Request Store
 * Manages service requests for on_request type services
 *
 * TODO: Persist to AsyncStorage when implementing offline support
 * TODO: Sync with backend API when available
 */

import { create } from 'zustand';
import { ServiceRequest, ServiceRequestStatus, BookingDraft } from '@/data/types';

type ServiceRequestStore = {
  requests: ServiceRequest[];

  // Actions
  createRequest: (
    draft: BookingDraft,
    bookingFeePaid?: boolean,
    bookingFeeAmount?: number,
    bookingFeePaymentId?: string
  ) => ServiceRequest;

  updateRequestStatus: (requestId: string, status: ServiceRequestStatus) => void;
  updateRequestQuote: (requestId: string, quotedPrice: number) => void;
  markBookingFeePaid: (requestId: string, paymentId: string, amount: number) => void;

  // Getters
  getRequestById: (requestId: string) => ServiceRequest | undefined;
  getRequestsByService: (serviceId: string) => ServiceRequest[];
  getRequestsByStatus: (status: ServiceRequestStatus) => ServiceRequest[];
  getPendingRequests: () => ServiceRequest[];

  clearRequests: () => void;
};

// Generate unique ID
const generateId = () => `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useServiceRequestStore = create<ServiceRequestStore>((set, get) => ({
  requests: [],

  // Create a new service request from booking draft
  createRequest: (draft, bookingFeePaid = false, bookingFeeAmount, bookingFeePaymentId) => {
    const now = new Date().toISOString();
    const newRequest: ServiceRequest = {
      id: generateId(),
      serviceId: draft.serviceId,
      serviceTitle: draft.serviceTitle,
      memberId: draft.memberId || '',
      memberName: draft.memberName || '',
      date: draft.date || '',
      startTime: draft.startTime || '',
      endTime: draft.endTime || undefined,
      durationMinutes: draft.durationMinutes || undefined,
      requestNotes: draft.requestNotes,
      status: 'submitted',
      bookingFeePaid,
      bookingFeeAmount,
      bookingFeePaymentId,
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({
      requests: [...state.requests, newRequest],
    }));

    return newRequest;
  },

  // Update request status
  updateRequestStatus: (requestId, status) => {
    set((state) => ({
      requests: state.requests.map((request) =>
        request.id === requestId
          ? { ...request, status, updatedAt: new Date().toISOString() }
          : request
      ),
    }));
  },

  // Update quoted price for a request
  updateRequestQuote: (requestId, quotedPrice) => {
    set((state) => ({
      requests: state.requests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              quotedPrice,
              status: 'quoted' as ServiceRequestStatus,
              updatedAt: new Date().toISOString(),
            }
          : request
      ),
    }));
  },

  // Mark booking fee as paid
  markBookingFeePaid: (requestId, paymentId, amount) => {
    set((state) => ({
      requests: state.requests.map((request) =>
        request.id === requestId
          ? {
              ...request,
              bookingFeePaid: true,
              bookingFeePaymentId: paymentId,
              bookingFeeAmount: amount,
              updatedAt: new Date().toISOString(),
            }
          : request
      ),
    }));
  },

  // Get request by ID
  getRequestById: (requestId) => {
    return get().requests.find((request) => request.id === requestId);
  },

  // Get requests by service ID
  getRequestsByService: (serviceId) => {
    return get().requests.filter((request) => request.serviceId === serviceId);
  },

  // Get requests by status
  getRequestsByStatus: (status) => {
    return get().requests.filter((request) => request.status === status);
  },

  // Get pending requests (submitted status)
  getPendingRequests: () => {
    return get().requests.filter((request) => request.status === 'submitted');
  },

  // Clear all requests
  clearRequests: () => {
    set({ requests: [] });
  },
}));
