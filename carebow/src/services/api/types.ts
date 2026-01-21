/**
 * API Service Types
 * Type definitions for the API client
 */

// ============================================
// HTTP TYPES
// ============================================

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestConfig {
  /** Request headers */
  headers?: Record<string, string>;
  /** Query parameters */
  params?: Record<string, string | number | boolean | undefined>;
  /** Request timeout in ms */
  timeout?: number;
  /** Skip auth header */
  skipAuth?: boolean;
  /** Retry count on failure */
  retries?: number;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

// ============================================
// ERROR TYPES
// ============================================

export type ApiErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

export interface ApiErrorDetails {
  code: ApiErrorCode;
  message: string;
  status?: number;
  field?: string;
  details?: Record<string, unknown>;
}

export class ApiError extends Error {
  code: ApiErrorCode;
  status?: number;
  field?: string;
  details?: Record<string, unknown>;

  constructor(error: ApiErrorDetails) {
    super(error.message);
    this.name = 'ApiError';
    this.code = error.code;
    this.status = error.status;
    this.field = error.field;
    this.details = error.details;
  }

  static fromResponse(status: number, data?: unknown): ApiError {
    const message = (data as any)?.message || (data as any)?.error || 'An error occurred';
    const field = (data as any)?.field;
    const details = (data as any)?.details;

    let code: ApiErrorCode;
    switch (status) {
      case 401:
        code = 'UNAUTHORIZED';
        break;
      case 403:
        code = 'FORBIDDEN';
        break;
      case 404:
        code = 'NOT_FOUND';
        break;
      case 409:
        code = 'CONFLICT';
        break;
      case 422:
        code = 'VALIDATION_ERROR';
        break;
      case 429:
        code = 'RATE_LIMITED';
        break;
      default:
        code = status >= 500 ? 'SERVER_ERROR' : 'UNKNOWN';
    }

    return new ApiError({ code, message, status, field, details });
  }

  static networkError(message = 'Network error'): ApiError {
    return new ApiError({ code: 'NETWORK_ERROR', message });
  }

  static timeout(message = 'Request timeout'): ApiError {
    return new ApiError({ code: 'TIMEOUT', message });
  }
}

// ============================================
// AUTH TYPES
// ============================================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix timestamp
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    avatarUrl?: string;
  };
  tokens: AuthTokens;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

export interface SignupResponse {
  message: string;
  requiresVerification: boolean;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface VerifyEmailResponse {
  user: LoginResponse['user'];
  tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  tokens: AuthTokens;
}

// ============================================
// USER TYPES
// ============================================

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// ORDER TYPES
// ============================================

export interface CreateOrderRequest {
  items: Array<{
    serviceId: string;
    packageId?: string;
    quantity: number;
    scheduledDate?: string;
    scheduledTime?: string;
    memberId?: string;
    addressId?: string;
    notes?: string;
  }>;
  paymentMethodId?: string;
  couponCode?: string;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  items: Array<{
    id: string;
    serviceName: string;
    packageName?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    scheduledDate?: string;
    scheduledTime?: string;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  orders: OrderResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// ============================================
// SERVICE TYPES
// ============================================

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description?: string;
  serviceCount: number;
}

export interface ServiceListItem {
  id: string;
  name: string;
  shortDescription: string;
  categoryId: string;
  basePrice: number;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  tags: string[];
  isPopular: boolean;
  isAvailable: boolean;
}

export interface ServiceDetails extends ServiceListItem {
  longDescription: string;
  features: string[];
  packages: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    duration?: string;
    includes: string[];
    isPopular: boolean;
  }>;
  availableSlots?: Array<{
    date: string;
    times: string[];
  }>;
  providers?: Array<{
    id: string;
    name: string;
    rating: number;
    experience: string;
    avatarUrl?: string;
  }>;
}

export interface ServicesListResponse {
  services: ServiceListItem[];
  categories: ServiceCategory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// ============================================
// PAGINATION & FILTERS
// ============================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ServiceFilters extends PaginationParams {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'rating' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderFilters extends PaginationParams {
  status?: OrderResponse['status'];
  startDate?: string;
  endDate?: string;
}
