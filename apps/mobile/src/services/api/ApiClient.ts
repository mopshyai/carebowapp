/**
 * API Client
 * Central HTTP client for all backend API calls.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, API_TIMEOUT } from '@env';
import { SecureStorage } from '@/services/storage/SecureStorage';
import { HttpMethod, RequestConfig, ApiResponse, ApiError, AuthTokens } from './types';

const API_CONFIG = {
  baseUrl: API_BASE_URL || 'https://www.carebow.com/api',
  timeout: Number(API_TIMEOUT) || 30000,
  retries: 2,
};

/**
 * The server now issues 15-minute access JWTs and keeps long sessions through
 * rotating refresh tokens. Cap the client's scheduling horizon too so an older
 * app/session carrying stale seven-day expiry metadata is proactively rotated
 * into the short-lived policy without a visible 401.
 */
export const MAX_ACCESS_TOKEN_HORIZON_SECONDS = 15 * 60;

const STORAGE_KEYS = {
  LEGACY_ACCESS_TOKEN: '@carebow/access_token',
  LEGACY_REFRESH_TOKEN: '@carebow/refresh_token',
  TOKEN_EXPIRY: '@carebow/token_expiry',
};

interface ClearTokenOptions {
  revokeRemote?: boolean;
}

function capAccessTokenExpiry(expiresAt: number): number {
  const now = Math.floor(Date.now() / 1000);
  const max = now + MAX_ACCESS_TOKEN_HORIZON_SECONDS;
  return Number.isFinite(expiresAt) && expiresAt > 0 ? Math.min(expiresAt, max) : max;
}

class ApiClientImpl {
  private baseUrl: string;
  private defaultTimeout: number;
  private defaultRetries: number;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry = 0;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    this.baseUrl = API_CONFIG.baseUrl;
    this.defaultTimeout = API_CONFIG.timeout;
    this.defaultRetries = API_CONFIG.retries;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  async initialize(): Promise<void> {
    try {
      const [{ accessToken, refreshToken }, expiry] = await Promise.all([
        SecureStorage.getAuthTokens(),
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRY),
      ]);

      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      const parsedExpiry = expiry ? parseInt(expiry, 10) : 0;
      this.tokenExpiry = accessToken ? capAccessTokenExpiry(parsedExpiry) : 0;

      await Promise.all([
        this.tokenExpiry > 0
          ? AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, this.tokenExpiry.toString())
          : AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY),
        AsyncStorage.removeItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.LEGACY_REFRESH_TOKEN),
      ]);

      if (__DEV__) {
        console.log('[ApiClient] Initialized', {
          hasAccessToken: !!this.accessToken,
          hasRefreshToken: !!this.refreshToken,
        });
      }
    } catch (error) {
      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpiry = 0;
      if (__DEV__) console.error('[ApiClient] Failed to initialize:', error);
    }
  }

  async setTokens(tokens: AuthTokens): Promise<void> {
    try {
      const storedSecurely = await SecureStorage.setAuthTokens(
        tokens.accessToken,
        tokens.refreshToken
      );
      if (!storedSecurely) {
        throw new Error('Failed to persist authentication tokens securely');
      }

      const effectiveExpiry = capAccessTokenExpiry(tokens.expiresAt);

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TOKEN_EXPIRY, effectiveExpiry.toString()),
        AsyncStorage.removeItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.LEGACY_REFRESH_TOKEN),
      ]);

      this.accessToken = tokens.accessToken;
      this.refreshToken = tokens.refreshToken;
      this.tokenExpiry = effectiveExpiry;
    } catch (error) {
      this.accessToken = null;
      this.refreshToken = null;
      this.tokenExpiry = 0;
      await Promise.all([
        SecureStorage.clearAuthTokens(),
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY),
        AsyncStorage.removeItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN),
        AsyncStorage.removeItem(STORAGE_KEYS.LEGACY_REFRESH_TOKEN),
      ]);
      throw error;
    }
  }

  async clearTokens(options: ClearTokenOptions = {}): Promise<void> {
    const accessToken = this.accessToken;
    const refreshToken = this.refreshToken;

    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = 0;

    if (options.revokeRemote !== false && refreshToken) {
      await this.revokeRemoteRefreshToken(accessToken, refreshToken);
    }

    await Promise.all([
      SecureStorage.clearAuthTokens(),
      AsyncStorage.removeItem(STORAGE_KEYS.TOKEN_EXPIRY),
      AsyncStorage.removeItem(STORAGE_KEYS.LEGACY_ACCESS_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.LEGACY_REFRESH_TOKEN),
    ]);
  }

  private async revokeRemoteRefreshToken(
    accessToken: string | null,
    refreshToken: string
  ): Promise<void> {
    try {
      const response = await this.executeWithTimeout(
        fetch(`${this.baseUrl}/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({ refreshToken }),
        }),
        Math.min(this.defaultTimeout, 5000)
      );

      if (__DEV__ && !response.ok) {
        console.log('[ApiClient] Remote logout did not confirm revocation', {
          status: response.status,
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.log('[ApiClient] Remote logout unavailable; local session still cleared', {
          message: (error as Error)?.message,
        });
      }
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  private isTokenExpired(): boolean {
    const bufferMs = 60 * 1000;
    return Date.now() >= this.tokenExpiry * 1000 - bufferMs;
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

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
      const response = await fetch(`${this.baseUrl}/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.accessToken ? { Authorization: `Bearer ${this.accessToken}` } : {}),
        },
        body: JSON.stringify({ refreshToken: this.refreshToken }),
      });

      if (!response.ok) {
        await this.clearTokens({ revokeRemote: false });
        return false;
      }

      const data = await response.json();
      const accessToken = data.accessToken ?? data.tokens?.accessToken;
      const refreshToken = data.refreshToken ?? data.tokens?.refreshToken;
      if (!accessToken || !refreshToken) {
        await this.clearTokens({ revokeRemote: false });
        return false;
      }

      const expiresAt =
        data.tokens?.expiresAt ??
        (data.expiresIn
          ? Math.floor(Date.now() / 1000) + data.expiresIn
          : Math.floor(Date.now() / 1000) + MAX_ACCESS_TOKEN_HORIZON_SECONDS);

      await this.setTokens({ accessToken, refreshToken, expiresAt });
      return true;
    } catch (error) {
      if (__DEV__) console.error('[ApiClient] Token refresh failed:', error);
      await this.clearTokens({ revokeRemote: false });
      return false;
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, config);
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, config);
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, config);
  }

  async patch<T>(
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, config);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }

  private async request<T>(
    method: HttpMethod,
    endpoint: string,
    data?: unknown,
    config?: RequestConfig
  ): Promise<ApiResponse<T>> {
    const { headers = {}, params, timeout, skipAuth, retries = this.defaultRetries } = config || {};

    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const queryString = Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
        .join('&');
      if (queryString) url += `?${queryString}`;
    }

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

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    };

    if (!skipAuth && this.accessToken) {
      requestHeaders.Authorization = `Bearer ${this.accessToken}`;
    }

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (data && method !== 'GET') {
      requestOptions.body = JSON.stringify(data);
    }

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.executeWithTimeout(
          fetch(url, requestOptions),
          timeout || this.defaultTimeout
        );

        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value: string, key: string) => {
          responseHeaders[key] = value;
        });

        if (!response.ok) {
          const errorData = await this.safeParseJson(response);

          if (response.status === 401 && !skipAuth && this.refreshToken && attempt === 0) {
            const refreshed = await this.refreshAccessToken();
            if (refreshed) {
              requestHeaders.Authorization = `Bearer ${this.accessToken}`;
              continue;
            }
          }

          throw ApiError.fromResponse(response.status, errorData);
        }

        const responseData = await this.safeParseJson(response);
        return {
          data: responseData as T,
          status: response.status,
          headers: responseHeaders,
        };
      } catch (error) {
        lastError = error as Error;

        if (__DEV__) {
          console.log('[ApiClient] request attempt failed', {
            url,
            attempt,
            name: (error as Error)?.name,
            message: (error as Error)?.message,
          });
        }

        if (error instanceof ApiError) {
          if (
            [
              'UNAUTHORIZED',
              'FORBIDDEN',
              'NOT_FOUND',
              'VALIDATION_ERROR',
              'CONFLICT',
              'RATE_LIMITED',
            ].includes(error.code)
          ) {
            throw error;
          }
        }

        if (attempt < retries) {
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }

    throw lastError || ApiError.networkError();
  }

  private async executeWithTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(ApiError.timeout()), timeoutMs);

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
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

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

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
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

    const responseData = await response.json();
    return {
      data: responseData,
      status: response.status,
      headers: {},
    };
  }
}

export const ApiClient = new ApiClientImpl();
export default ApiClient;
