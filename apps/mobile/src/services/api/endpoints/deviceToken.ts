/**
 * Push notification device-token registration API (v1, JWT-authenticated).
 *
 * NOTE: `ApiClient.delete` does not support a request body (by design — see
 * ApiClient.ts HTTP method signatures), so `unregister` sends the token as a
 * query parameter instead of a body, matching the pattern already used by
 * `inventoryApi.remove`.
 */

import { ApiClient } from '../ApiClient';

export interface DeviceTokenResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export const deviceTokenApi = {
  register: async (data: {
    token: string;
    platform: 'ios' | 'android';
    deviceName?: string;
  }): Promise<DeviceTokenResponse> => {
    const response = await ApiClient.post<DeviceTokenResponse>('/v1/auth/device-token', data);
    return response.data;
  },

  unregister: async (token: string): Promise<DeviceTokenResponse> => {
    const response = await ApiClient.delete<DeviceTokenResponse>('/v1/auth/device-token', {
      params: { token },
    });
    return response.data;
  },
};

export default deviceTokenApi;
