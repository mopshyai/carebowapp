/**
 * API Service Index
 */

// Core client
export { ApiClient } from './ApiClient';

// Types
export * from './types';

// API Endpoints
export { authApi, servicesApi, ordersApi } from './endpoints';

// Convenience re-export
import { ApiClient } from './ApiClient';
import { authApi } from './endpoints/auth';
import { servicesApi } from './endpoints/services';
import { ordersApi } from './endpoints/orders';

/**
 * Unified API object for easy access
 */
export const api = {
  client: ApiClient,
  auth: authApi,
  services: servicesApi,
  orders: ordersApi,
};

export default api;
