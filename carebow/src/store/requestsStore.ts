/**
 * Service Requests Store (New Version with Persistence)
 * Manages on-request service requests with status tracking and quotes
 */

import React from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  ServiceRequest,
  RequestStatus,
  BookingCore,
  Quote,
  Money,
  money,
  generateBookingId,
} from '@/types/booking';

// ============================================
// STORE TYPES
// ============================================

type RequestsState = {
  requests: ServiceRequest[];
};

type RequestsActions = {
  // Create request
  createRequest: (draft: BookingCore) => ServiceRequest;

  // Status updates
  updateRequestStatus: (requestId: string, status: RequestStatus) => void;
  markInReview: (requestId: string, assignedTo?: string) => void;
  cancelRequest: (requestId: string) => void;
  closeRequest: (requestId: string) => void;

  // Quote handling
  attachQuote: (requestId: string, quotedTotal: Money, quoteNotes?: string) => void;
  acceptQuote: (requestId: string) => void;

  // Booking fee handling
  markBookingFeePaid: (requestId: string, paymentId: string, amount: Money) => void;

  // Getters
  getRequestById: (requestId: string) => ServiceRequest | undefined;
  getRequestsByMember: (memberId: string) => ServiceRequest[];
  getRequestsByStatus: (status: RequestStatus) => ServiceRequest[];
  getRequestsByService: (serviceId: string) => ServiceRequest[];
  getPendingRequests: () => ServiceRequest[];
  getQuotedRequests: () => ServiceRequest[];

  // Clear
  clearRequests: () => void;
};

type RequestsStore = RequestsState & RequestsActions;

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useRequestsStore = create<RequestsStore>()(
  persist(
    (set, get) => ({
      requests: [],

      /**
       * Create a new service request from BookingCore
       * Status is set to "submitted"
       */
      createRequest: (draft: BookingCore): ServiceRequest => {
        const now = new Date().toISOString();

        const newRequest: ServiceRequest = {
          ...draft,
          id: draft.id || generateBookingId('req'),
          kind: 'request',
          requestStatus: 'submitted',
          assignedTo: null,
          quote: undefined,
          bookingFee: undefined,
          createdAtISO: draft.createdAtISO || now,
          updatedAtISO: now,
        };

        set((state) => ({
          requests: [newRequest, ...state.requests],
        }));

        console.log('[RequestsStore] Created request:', newRequest.id);
        return newRequest;
      },

      /**
       * Update request status
       */
      updateRequestStatus: (requestId: string, status: RequestStatus) => {
        const now = new Date().toISOString();

        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === requestId
              ? { ...request, requestStatus: status, updatedAtISO: now }
              : request
          ),
        }));

        console.log('[RequestsStore] Updated status for request:', requestId, status);
      },

      /**
       * Mark request as in review and optionally assign
       */
      markInReview: (requestId: string, assignedTo?: string) => {
        const now = new Date().toISOString();

        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === requestId
              ? {
                  ...request,
                  requestStatus: 'in_review' as RequestStatus,
                  assignedTo: assignedTo || request.assignedTo,
                  updatedAtISO: now,
                }
              : request
          ),
        }));

        console.log('[RequestsStore] Marked in review:', requestId);
      },

      /**
       * Cancel a request
       */
      cancelRequest: (requestId: string) => {
        const now = new Date().toISOString();

        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === requestId
              ? { ...request, requestStatus: 'cancelled' as RequestStatus, updatedAtISO: now }
              : request
          ),
        }));

        console.log('[RequestsStore] Cancelled request:', requestId);
      },

      /**
       * Close a request
       */
      closeRequest: (requestId: string) => {
        const now = new Date().toISOString();

        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === requestId
              ? { ...request, requestStatus: 'closed' as RequestStatus, updatedAtISO: now }
              : request
          ),
        }));

        console.log('[RequestsStore] Closed request:', requestId);
      },

      /**
       * Attach a quote to a request
       */
      attachQuote: (requestId: string, quotedTotal: Money, quoteNotes?: string) => {
        const now = new Date().toISOString();

        const quote: Quote = {
          quotedTotal,
          quoteNotes,
          quotedAtISO: now,
        };

        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === requestId
              ? {
                  ...request,
                  requestStatus: 'quoted' as RequestStatus,
                  quote,
                  updatedAtISO: now,
                }
              : request
          ),
        }));

        console.log('[RequestsStore] Attached quote to request:', requestId, quotedTotal);
      },

      /**
       * Accept a quote (move to scheduled)
       */
      acceptQuote: (requestId: string) => {
        const now = new Date().toISOString();

        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === requestId
              ? { ...request, requestStatus: 'scheduled' as RequestStatus, updatedAtISO: now }
              : request
          ),
        }));

        console.log('[RequestsStore] Accepted quote for request:', requestId);
      },

      /**
       * Mark booking fee as paid
       */
      markBookingFeePaid: (requestId: string, paymentId: string, amount: Money) => {
        const now = new Date().toISOString();

        set((state) => ({
          requests: state.requests.map((request) =>
            request.id === requestId
              ? {
                  ...request,
                  bookingFee: {
                    paid: true,
                    amount,
                    paymentId,
                    paidAtISO: now,
                  },
                  updatedAtISO: now,
                }
              : request
          ),
        }));

        console.log('[RequestsStore] Marked booking fee paid:', requestId, amount);
      },

      /**
       * Get request by ID
       */
      getRequestById: (requestId: string): ServiceRequest | undefined => {
        return get().requests.find((request) => request.id === requestId);
      },

      /**
       * Get requests by member ID
       */
      getRequestsByMember: (memberId: string): ServiceRequest[] => {
        return get().requests.filter((request) => request.memberId === memberId);
      },

      /**
       * Get requests by status
       */
      getRequestsByStatus: (status: RequestStatus): ServiceRequest[] => {
        return get().requests.filter((request) => request.requestStatus === status);
      },

      /**
       * Get requests by service ID
       */
      getRequestsByService: (serviceId: string): ServiceRequest[] => {
        return get().requests.filter((request) => request.serviceId === serviceId);
      },

      /**
       * Get pending requests (submitted status)
       */
      getPendingRequests: (): ServiceRequest[] => {
        return get().requests.filter((request) => request.requestStatus === 'submitted');
      },

      /**
       * Get quoted requests
       */
      getQuotedRequests: (): ServiceRequest[] => {
        return get().requests.filter((request) => request.requestStatus === 'quoted');
      },

      /**
       * Clear all requests (for testing)
       */
      clearRequests: () => {
        set({ requests: [] });
        console.log('[RequestsStore] Cleared all requests');
      },
    }),
    {
      name: 'carebow-requests-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ requests: state.requests }),
    }
  )
);

// ============================================
// SELECTOR HOOKS - With stable references
// ============================================

// Stable selector to get requests array
const selectRequests = (state: RequestsState) => state.requests;

/**
 * Get all requests sorted by creation date (newest first)
 * Uses shallow equality check to prevent unnecessary re-renders
 */
export const useAllRequests = () => {
  const requests = useRequestsStore(selectRequests);
  return React.useMemo(() => {
    if (requests.length === 0) return [];
    return [...requests].sort(
      (a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime()
    );
  }, [requests]);
};

/**
 * Get request count
 */
export const useRequestCount = () => useRequestsStore((state) => state.requests.length);

/**
 * Get requests for a specific member
 */
export const useMemberRequests = (memberId: string) => {
  const requests = useRequestsStore(selectRequests);
  return React.useMemo(() => {
    if (requests.length === 0) return [];
    return requests
      .filter((request) => request.memberId === memberId)
      .sort((a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime());
  }, [requests, memberId]);
};

/**
 * Get active requests (not cancelled or closed)
 */
export const useActiveRequests = () => {
  const requests = useRequestsStore(selectRequests);
  return React.useMemo(() => {
    if (requests.length === 0) return [];
    return requests
      .filter((r) => r.requestStatus !== 'cancelled' && r.requestStatus !== 'closed')
      .sort((a, b) => new Date(b.createdAtISO).getTime() - new Date(a.createdAtISO).getTime());
  }, [requests]);
};
