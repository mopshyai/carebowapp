import { ApiClient } from '../ApiClient';

export type V1ProfileGender = 'MALE' | 'FEMALE' | 'OTHER';

export interface V1Profile {
  id: string;
  userId: string;
  name: string;
  dateOfBirth: string;
  gender: V1ProfileGender;
  relationship: string;
  photoUrl?: string | null;
  bloodGroup?: string | null;
  allergies?: string | null;
  conditions?: string | null;
  medications?: string | null;
  emergencyContactName?: string | null;
  emergencyContactPhone?: string | null;
  isActive?: boolean;
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

export interface V1ProfileDeleteResponse {
  success: boolean;
  error?: string;
}

export type V1ProfileWrite = {
  name: string;
  dateOfBirth: string;
  gender: V1ProfileGender;
  relationship: string;
  bloodGroup?: string;
  allergies?: string;
  conditions?: string;
  medications?: string;
};

export const profilesApi = {
  createProfile: async (data: V1ProfileWrite): Promise<V1Profile> => {
    const response = await ApiClient.post<V1ProfileResponse>('/v1/profiles', data);
    if (!response.data.success || !response.data.profile) {
      throw new Error(response.data.error || 'Unable to create profile');
    }
    return response.data.profile;
  },

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
    data: Partial<
      V1ProfileWrite & {
        emergencyContactName: string;
        emergencyContactPhone: string;
        photoUrl: string;
      }
    >
  ): Promise<V1ProfileResponse> => {
    const response = await ApiClient.put<V1ProfileResponse>(`/v1/profiles/${profileId}`, data);
    return response.data;
  },

  deleteProfile: async (profileId: string): Promise<V1ProfileDeleteResponse> => {
    const response = await ApiClient.delete<V1ProfileDeleteResponse>(`/v1/profiles/${profileId}`);
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
