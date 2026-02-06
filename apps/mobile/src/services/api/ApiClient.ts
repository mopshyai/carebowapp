/**
 * API Client
 * Central HTTP client for all backend API calls
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  HttpMethod,
  RequestConfig,
  ApiResponse,
  ApiError,
  AuthTokens,
} from './types';

// ============================================
// CONFIGURATION
// ============================================

const API_CONFIG = {
  // SECURITY: Explicit fallback handling - never default to production
  baseUrl: process.env.API_BASE_URL || (__DEV__ ? 'http://localhost:3000/api' : (() => { throw new Error('API_BASE_URL must be configured for production'); })()),
  timeout: 30000, // 30 seconds
  retries: 2,
};

const STORAGE_KEYS = {
  ACCESS_TOKEN: '@carebow/access_token',
  REFRESH_TOKEN: '@carebow/refresh_token',
  TOKEN_EXPIRY: '@carebow/token_expiry',
};

// ============================================
// API CLIENT CLASS
// ============================================

class ApiClientImpl {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: number = 0;
  private isRefreshing: boolean = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.defaultTimeout = API_CONFIG.timeout;
    this.defaultRetries = API_CONFIG.retries;
  }

  // ========================================
  // INITIALIZATION
  // ========================================

  async initialize(): Promise<void> {
    try {
      const [accessToken, refreshToken, expiry] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY),
      ]);

      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      this.tokenExpiry = expiry ? parseInt(expiry, 10) : 0;

      if (__DEV__) {
        console.log('[ApiClient] Initialized', {
          hasAccessToken: !!this.accessToken,
          hasRefreshToken: !!this.refreshToken,
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error('[ApiClient] Failed to initialize:', error);
      }
    }
  }

  // ========================================
  // TOKEN MANAGEMENT
  // ========================================

  async setTokens(tokens: AuthTokens): Promise<void> {
    this.accessToken = tokens.accessToken;
    this.refreshToken = tokens.refreshToken;
    this.tokenExpiry = tokens.expiresAt;

    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, tokens.accessToken),
      AsyncStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, tokens.refreshToken),
      AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, tokens.expiresAt.toString()),
    ]);
  }

  async clearTokens(): Promise<void> {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = 0;

    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY),
    ]);
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private isTokenExpired(): boolean {
    // Add 60 second buffer before expiry
    // tokenExpiry is stored as Unix timestamp in seconds
    const bufferMs = 60 * 1000; // 60 seconds
    return Date.now() >= (this.tokenExpiry * 1000) - bufferMs;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) {
      return false;
    }

    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.doRefreshToken();

    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async doRefreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        await this.clearTokens();
        return false;
      }

      const data = await response.json();
      await this.setTokens(data.tokens);
      return true;
    } catch (error) {
      if (__DEV__) {
        console.error('[ApiClient] Token refresh failed:', error);
      }
      await this.clearTokens();
      return false;
    }
  }

  // ========================================
  // HTTP METHODS
  // ========================================

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, config);
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, config);
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, config);
  }

  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, config);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }

  // ========================================
  // CORE REQUEST METHOD
  // ========================================

  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const { headers = {}, params, timeout, skipAuth, retries = this.defaultRetries } = config || {};

    // Build URL with query params
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const queryString = Object.entries(params)
        .filter(([_, v]) => v !== undefined)
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
        .join('&');
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    // Check and refresh token if needed
    if (!skipAuth && this.accessToken && this.isTokenExpired()) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        throw new ApiError({
          code: 'UNAUTHORIZED',
          message: 'Session expired. Please login again.',
          status: 401,
        });
      }
    }

    // Build headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...headers,
    };

    if (!skipAuth && this.accessToken) {
      requestHeaders['Authorization'] = `Bearer ${this.accessToken}`;
    }

    // Build request options
    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (data && method !== 'GET') {
      requestOptions.body = JSON.stringify(data);
    }

    // Execute request with retry logic
    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.executeWithTimeout(
          fetch(url, requestOptions),
          timeout || this.defaultTimeout
        );

        // Parse response
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });

        // Handle non-2xx responses
        if (!response.ok) {
          const errorData = await this.safeParseJson(response);

          // Handle 401 - try to refresh token once
          if (response.status === 401 && !skipAuth && this.refreshToken && attempt === 0) {
            const refreshed = await this.refreshAccessToken();
            if (refreshed) {
              // Retry the request with new token
              requestHeaders['Authorization'] = `Bearer ${this.accessToken}`;
              continue;
            }
          }

          throw ApiError.fromResponse(response.status, errorData);
        }

        // Parse successful response
        const responseData = await this.safeParseJson(response);

        return {
          data: responseData as T,
          status: response.status,
          headers: responseHeaders,
        };
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        if (error instanceof ApiError) {
          if (['UNAUTHORIZED', 'FORBIDDEN', 'NOT_FOUND', 'VALIDATION_ERROR'].includes(error.code)) {
            throw error;
          }
        }

        // Wait before retrying
        if (attempt < retries) {
          await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        }
      }
    }

    throw lastError || ApiError.networkError();
  }

  // ========================================
  // UTILITIES
  // ========================================

  private async executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(ApiError.timeout());
      }, timeoutMs);

      promise
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          if (error.name === 'TypeError' && error.message === 'Network request failed') {
            reject(ApiError.networkError());
          } else {
            reject(error);
          }
        });
    });
  }

  private async safeParseJson(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ========================================
  // FILE UPLOAD
  // ========================================

  async uploadFile(
    endpoint: string,
    file: { uri: string; type: string; name: string },
    additionalData?: Record<string, string>
  ): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', {
      uri: file.uri,
      type: file.type,
      name: file.name,
    } as any);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await this.safeParseJson(response);
      throw ApiError.fromResponse(response.status, errorData);
    }

    const data = await response.json();
    return {
      data,
      status: response.status,
      headers: {},
    };
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const ApiClient = new ApiClientImpl();
export default ApiClient;
