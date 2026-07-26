import { ApiClient } from '../ApiClient';

export interface V1Profile {
  id: string;
  name: string;
  relationship: string;
  photoUrl?: string | null;
}

interface V1ProfilesResponse {
  success: boolean;
  error?: string;
  profiles?: V1Profile[];
}

export interface V1ProfileResponse {
  success: boolean;
  error?: string;
  profile?: V1Profile;
}

export interface V1ProfileShareResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export const profilesApi = {
  getProfiles: async (): Promise<V1Profile[]> => {
    const response = await ApiClient.get<V1ProfilesResponse>('/v1/profiles');
    if (!response.data.success) throw new Error(response.data.error || 'Unable to load profiles');
    return response.data.profiles ?? [];
  },

  getProfile: async (profileId: string): Promise<V1ProfileResponse> => {
    const response = await ApiClient.get<V1ProfileResponse>(`/v1/profiles/${profileId}`);
    return response.data;
  },

  updateProfile: async (
    profileId: string,
    data: Partial<{
      name: string;
      dateOfBirth: string;
      gender: string;
      relationship: string;
      bloodGroup: string;
      allergies: string;
      conditions: string;
      medications: string;
      emergencyContactName: string;
      emergencyContactPhone: string;
      photoUrl: string;
    }>
  ): Promise<V1ProfileResponse> => {
    const response = await ApiClient.put<V1ProfileResponse>(`/v1/profiles/${profileId}`, data);
    return response.data;
  },

  shareProfile: async (
    profileId: string,
    data: { email: string; accessLevel?: 'READ_ONLY' | 'FULL' }
  ): Promise<V1ProfileShareResponse> => {
    const response = await ApiClient.post<V1ProfileShareResponse>(
      `/v1/profiles/${profileId}/share`,
      data
    );
    return response.data;
  },
};

export default profilesApi;
