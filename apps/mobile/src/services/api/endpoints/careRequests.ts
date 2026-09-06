import { ApiClient } from '../ApiClient';

export type CareRequestAction = 'APPROVE_QUOTE' | 'CANCEL';

export interface CareRequestProfile {
  id: string;
  name: string;
  relationship: string;
}

export interface CareRequestLinkedBooking {
  bookingId: string;
  category: string;
  serviceName: string;
  status: string;
  scheduledAt: string;
  providerId: string | null;
  providerName: string | null;
  paymentStatus: string;
}

export interface CareRequest {
  id: string;
  requestText: string;
  serviceHint: string | null;
  preferredDate: string | null;
  preferredWindow: string | null;
  location: string | null;
  urgency: string;
  status: string;
  escalation: {
    escalatedAt: string;
    acknowledgedAt: string | null;
  } | null;
  quote: {
    amountMinor: number;
    currency: string;
  } | null;
  profile: CareRequestProfile | null;
  linkedBooking: CareRequestLinkedBooking | null;
  createdAt: string;
  updatedAt: string;
}

interface CareRequestsResponse {
  careRequests: CareRequest[];
}

interface CareRequestMutationResponse {
  careRequest: CareRequest;
  linkedBookingId?: string;
  refund?: {
    refunded: boolean;
    amountMinor?: number | null;
    pending?: boolean;
    error?: string;
  };
}

/**
 * Customer-facing custom/unlisted care requests.
 *
 * This intentionally targets the same `/chat/care-requests` contract used by
 * the web Ask CareBow experience. Mobile must not create a second request
 * lifecycle or translate these records into a client-only request store.
 */
export const careRequestsApi = {
  list: async (params?: {
    includeCompleted?: boolean;
    sessionId?: string;
  }): Promise<CareRequest[]> => {
    const response = await ApiClient.get<CareRequestsResponse>('/chat/care-requests', {
      params: {
        ...(params?.includeCompleted ? { includeCompleted: 'true' } : {}),
        ...(params?.sessionId ? { sessionId: params.sessionId } : {}),
      },
    });
    return response.data.careRequests ?? [];
  },

  get: async (id: string): Promise<CareRequest | null> => {
    const response = await ApiClient.get<CareRequestsResponse>('/chat/care-requests', {
      params: { id },
    });
    return response.data.careRequests?.[0] ?? null;
  },

  approveQuote: async (id: string): Promise<CareRequestMutationResponse> => {
    const response = await ApiClient.patch<CareRequestMutationResponse>('/chat/care-requests', {
      id,
      action: 'APPROVE_QUOTE',
    });
    return response.data;
  },

  cancel: async (id: string): Promise<CareRequestMutationResponse> => {
    const response = await ApiClient.patch<CareRequestMutationResponse>('/chat/care-requests', {
      id,
      action: 'CANCEL',
    });
    return response.data;
  },
};

export default careRequestsApi;
