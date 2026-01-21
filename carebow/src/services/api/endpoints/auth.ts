/**
 * Auth API Endpoints
 */

import { ApiClient } from '../ApiClient';
import {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  UserResponse,
  UpdateUserRequest,
} from '../types';

export const authApi = {
  /**
   * Login with email and password
   */
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await ApiClient.post<LoginResponse>('/auth/login', data, {
      skipAuth: true,
    });

    // Store tokens
    await ApiClient.setTokens(response.data.tokens);

    return response.data;
  },

  /**
   * Register a new user
   */
  signup: async (data: SignupRequest): Promise<SignupResponse> => {
    const response = await ApiClient.post<SignupResponse>('/auth/signup', data, {
      skipAuth: true,
    });
    return response.data;
  },

  /**
   * Verify email with code
   */
  verifyEmail: async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
    const response = await ApiClient.post<VerifyEmailResponse>('/auth/verify-email', data, {
      skipAuth: true,
    });

    // Store tokens
    await ApiClient.setTokens(response.data.tokens);

    return response.data;
  },

  /**
   * Resend verification code
   */
  resendVerificationCode: async (email: string): Promise<{ message: string }> => {
    const response = await ApiClient.post<{ message: string }>('/auth/resend-verification', { email }, {
      skipAuth: true,
    });
    return response.data;
  },

  /**
   * Request password reset
   */
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    const response = await ApiClient.post<{ message: string }>('/auth/forgot-password', { email }, {
      skipAuth: true,
    });
    return response.data;
  },

  /**
   * Reset password with token
   */
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await ApiClient.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword,
    }, {
      skipAuth: true,
    });
    return response.data;
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await ApiClient.get<UserResponse>('/auth/me');
    return response.data;
  },

  /**
   * Update user profile
   */
  updateProfile: async (data: UpdateUserRequest): Promise<UserResponse> => {
    const response = await ApiClient.patch<UserResponse>('/auth/me', data);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const response = await ApiClient.post<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  /**
   * Logout - clear tokens
   */
  logout: async (): Promise<void> => {
    try {
      // Optionally notify server
      await ApiClient.post('/auth/logout', {});
    } catch {
      // Ignore errors
    } finally {
      await ApiClient.clearTokens();
    }
  },

  /**
   * Delete account
   */
  deleteAccount: async (password: string): Promise<{ message: string }> => {
    const response = await ApiClient.post<{ message: string }>('/auth/delete-account', { password });
    await ApiClient.clearTokens();
    return response.data;
  },
};

export default authApi;
