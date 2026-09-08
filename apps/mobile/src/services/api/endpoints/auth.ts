/**
 * Auth API Endpoints
 *
 * Canonical mobile contract:
 * - GET  /v1/auth/enabled-methods?action=signup&userType=<slug>
 * - POST /v1/auth/signup, /login, /verify, /refresh
 * - POST /v1/auth/resend-verification, /forgot, /reset, /logout
 * Responses use a {success, error?, ...} envelope; error shape is stable but
 * success payloads are not fully documented — use the normalizers below.
 */

import { ApiClient } from '../ApiClient';
import {
  AuthEnvelope,
  AuthTokens,
  EnabledMethodsResponse,
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from '../types';

type DeleteAccountResponse = {
  success?: boolean;
  message?: string;
  confirmationRequired?: boolean;
  confirmationMethod?: 'email_otp';
  email?: string;
  expiresAt?: string;
};

type DataExportLinkResponse = {
  success: boolean;
  downloadUrl: string;
  expiresAt: string;
};

/**
 * Pull tokens out of whichever envelope field the backend used.
 * Returns null when the response carries no tokens (e.g. signup that
 * requires OTP verification before issuing a session).
 */
export function extractTokens(payload: AuthEnvelope | null | undefined): AuthTokens | null {
  if (!payload) return null;
  const t = payload.tokens ?? payload.data?.tokens;
  const accessToken = t?.accessToken ?? payload.accessToken;
  const refreshToken = t?.refreshToken ?? payload.refreshToken;
  if (!accessToken || !refreshToken) return null;

  // expiresAt (unix seconds) preferred; fall back to expiresIn (relative seconds),
  // then to a conservative 15-minute assumption so refresh kicks in early.
  const expiresAt =
    t?.expiresAt ??
    (t?.expiresIn
      ? Math.floor(Date.now() / 1000) + t.expiresIn
      : Math.floor(Date.now() / 1000) + 15 * 60);

  return { accessToken, refreshToken, expiresAt };
}

/** Pull the user object out of whichever envelope field the backend used. */
export function extractUser(
  payload: AuthEnvelope | null | undefined
): Record<string, unknown> | null {
  return payload?.user ?? payload?.data?.user ?? null;
}

export const authApi = {
  /** Which auth methods are enabled for a user type (drives signup/login UI). */
  getEnabledMethods: async (
    action: 'signup' | 'login',
    userType: string
  ): Promise<EnabledMethodsResponse> => {
    const response = await ApiClient.get<EnabledMethodsResponse>('/v1/auth/enabled-methods', {
      params: { action, userType },
      skipAuth: true,
    });
    return response.data;
  },

  /** Login with email and password via the v1 mobile API. */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await ApiClient.post<LoginResponse>(
      '/v1/auth/login',
      {
        method: data.method,
        email: data.email,
        password: data.password,
        ...(data.userTypeSlug ? { userTypeSlug: data.userTypeSlug } : {}),
      },
      { skipAuth: true }
    );

    const tokens = extractTokens(response.data);
    if (tokens) await ApiClient.setTokens(tokens);
    return response.data;
  },

  /** Register a new user via the v1 mobile API. */
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const response = await ApiClient.post<SignupResponse>(
      '/v1/auth/signup',
      {
        method: data.method,
        email: data.email,
        password: data.password,
        name: [data.firstName, data.lastName].filter(Boolean).join(' ') || undefined,
        userTypeSlug: data.userTypeSlug,
        mainType: 'USER',
      },
      { skipAuth: true }
    );

    const tokens = extractTokens(response.data);
    if (tokens) await ApiClient.setTokens(tokens);
    return response.data;
  },

  /** Request a one-time sign-in code for an existing account. */
  requestEmailCode: async (email: string): Promise<AuthEnvelope> => {
    const response = await ApiClient.post<AuthEnvelope>(
      '/v1/auth/login',
      { method: 'email-otp', email },
      { skipAuth: true }
    );
    return response.data;
  },

  /** Verify an OTP / email-verification token and persist the issued session. */
  verifyEmail: async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
    const response = await ApiClient.post<VerifyEmailResponse>('/v1/auth/verify', data, {
      skipAuth: true,
    });

    const tokens = extractTokens(response.data);
    if (tokens) await ApiClient.setTokens(tokens);
    return response.data;
  },

  resendVerificationCode: async (email: string): Promise<{ message: string }> => {
    const response = await ApiClient.post<{ message: string }>(
      '/v1/auth/resend-verification',
      { email },
      { skipAuth: true }
    );
    return response.data;
  },

  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const response = await ApiClient.post<{ message: string }>(
      '/v1/auth/forgot',
      { email },
      { skipAuth: true }
    );
    return response.data;
  },

  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await ApiClient.post<{ message: string }>(
      '/v1/auth/reset',
      { token, password: newPassword },
      { skipAuth: true }
    );
    return response.data;
  },

  getCurrentUser: async (): Promise<AuthEnvelope> => {
    const response = await ApiClient.get<AuthEnvelope>('/v1/auth/me');
    return response.data;
  },

  updateProfile: async (data: { name?: string; phoneNumber?: string }): Promise<AuthEnvelope> => {
    const response = await ApiClient.patch<AuthEnvelope>('/v1/auth/update-profile', data);
    return response.data;
  },

  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    const response = await ApiClient.post<{ message: string }>('/v1/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      const refreshToken = ApiClient.getRefreshToken();
      await ApiClient.post('/v1/auth/logout', refreshToken ? { refreshToken } : {});
    } catch {
      // Local logout must still clear credentials if the network/server is unavailable.
    } finally {
      await ApiClient.clearTokens();
    }
  },

  /**
   * Delete an account. Password accounts submit a password. OAuth-only accounts
   * first call with an empty payload to request an email code, then submit that
   * code through confirmationCode.
   */
  deleteAccount: async (confirmation?: {
    password?: string;
    confirmationCode?: string;
  }): Promise<DeleteAccountResponse> => {
    const response = await ApiClient.post<DeleteAccountResponse>(
      '/v1/auth/delete-account',
      confirmation ?? {}
    );
    if (response.data.success) await ApiClient.clearTokens();
    return response.data;
  },

  /** Create a five-minute browser download link for the self-service data export. */
  createDataExportLink: async (): Promise<DataExportLinkResponse> => {
    const response = await ApiClient.post<DataExportLinkResponse>('/v1/privacy/export-link', {});
    return response.data;
  },
};

export default authApi;
