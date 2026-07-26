/**
 * App preferences API (v1, JWT-authenticated).
 *
 * Currently covers app-lock / biometric login preferences, stored server-side
 * so they follow the account across devices.
 */

import { ApiClient } from '../ApiClient';

export interface AppPreferences {
  appLockEnabled: boolean;
  biometricEnabled: boolean;
}

export interface PreferencesResponse {
  success: boolean;
  error?: string;
  preferences?: AppPreferences;
}

export const preferencesApi = {
  get: async (): Promise<PreferencesResponse> => {
    const response = await ApiClient.get<PreferencesResponse>('/v1/auth/preferences');
    return response.data;
  },

  update: async (data: Partial<AppPreferences>): Promise<PreferencesResponse> => {
    const response = await ApiClient.patch<PreferencesResponse>('/v1/auth/preferences', data);
    return response.data;
  },
};

export default preferencesApi;
