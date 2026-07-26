/**
 * Vitals API (v1, JWT-authenticated).
 *
 * Vitals are recorded against a health profile (`profileId`), which is
 * required on every read/write.
 */

import { ApiClient } from '../ApiClient';

export interface Vital {
  id: string;
  profileId: string;
  type: string;
  value: string;
  unit: string;
  recordedAt: string;
}

export interface VitalsListResponse {
  success: boolean;
  error?: string;
  vitals?: Vital[];
}

export interface VitalResponse {
  success: boolean;
  error?: string;
  vital?: Vital;
}

export const vitalsApi = {
  list: async (params: {
    profileId: string;
    type?: string;
    limit?: number;
  }): Promise<VitalsListResponse> => {
    const response = await ApiClient.get<VitalsListResponse>('/v1/vitals', {
      params: {
        profileId: params.profileId,
        type: params.type,
        limit: params.limit,
      },
    });
    return response.data;
  },

  record: async (data: {
    profileId: string;
    type: string;
    value: string;
    unit: string;
    recordedAt?: string;
  }): Promise<VitalResponse> => {
    const response = await ApiClient.post<VitalResponse>('/v1/vitals', data);
    return response.data;
  },
};

export default vitalsApi;
