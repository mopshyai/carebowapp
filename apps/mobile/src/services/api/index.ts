/**
 * API Service Index
 */

// Core client
export { ApiClient } from './ApiClient';

// Types
export * from './types';

// API Endpoints
export {
  authApi,
  servicesApi,
  memberApi,
  profilesApi,
  safetyApi,
  inventoryApi,
  notificationsApi,
  vitalsApi,
  preferencesApi,
  deviceTokenApi,
} from './endpoints';
export type {
  MemberOverview,
  MemberOverviewResponse,
  V1Booking,
  V1BookingsResponse,
  V1ProviderProfile,
  V1ProviderProfileResponse,
  BookingStatus,
  V1Profile,
  V1ProfileResponse,
  V1ProfileShareResponse,
  SosReportPayload,
  SosReportResponse,
  InventoryItem,
  InventoryListResponse,
  InventoryItemResponse,
  InventoryDeleteResponse,
  AppNotification,
  NotificationsListResponse,
  NotificationsMutateResponse,
  Vital,
  VitalsListResponse,
  VitalResponse,
  AppPreferences,
  PreferencesResponse,
  DeviceTokenResponse,
} from './endpoints';

// Convenience re-export
import { ApiClient } from './ApiClient';
import { authApi } from './endpoints/auth';
import { servicesApi } from './endpoints/services';
import { memberApi } from './endpoints/member';
import { profilesApi } from './endpoints/profiles';
import { safetyApi } from './endpoints/safety';
import { inventoryApi } from './endpoints/inventory';
import { notificationsApi } from './endpoints/notifications';
import { vitalsApi } from './endpoints/vitals';
import { preferencesApi } from './endpoints/preferences';
import { deviceTokenApi } from './endpoints/deviceToken';

/**
 * Unified API object for easy access
 */
export const api = {
  client: ApiClient,
  auth: authApi,
  services: servicesApi,
  member: memberApi,
  profiles: profilesApi,
  safety: safetyApi,
  inventory: inventoryApi,
  notifications: notificationsApi,
  vitals: vitalsApi,
  preferences: preferencesApi,
  deviceToken: deviceTokenApi,
};

export default api;
