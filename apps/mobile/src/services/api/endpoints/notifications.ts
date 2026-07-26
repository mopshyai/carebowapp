/**
 * In-app notifications API (v1, JWT-authenticated).
 *
 * Named `AppNotification` to avoid clashing with the local scheduling types
 * in `src/services/notifications` (NotificationContent, ScheduledNotification,
 * etc.), which are unrelated, device-local reminder primitives.
 */

import { ApiClient } from '../ApiClient';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsListResponse {
  success: boolean;
  error?: string;
  notifications?: AppNotification[];
  unreadCount?: number;
}

export interface NotificationsMutateResponse {
  success: boolean;
  error?: string;
}

export const notificationsApi = {
  list: async (limit = 20): Promise<NotificationsListResponse> => {
    const response = await ApiClient.get<NotificationsListResponse>('/v1/notifications', {
      params: { limit },
    });
    return response.data;
  },

  markRead: async (ids: string[]): Promise<NotificationsMutateResponse> => {
    const response = await ApiClient.patch<NotificationsMutateResponse>('/v1/notifications', {
      ids,
    });
    return response.data;
  },

  markAllRead: async (): Promise<NotificationsMutateResponse> => {
    const response = await ApiClient.patch<NotificationsMutateResponse>('/v1/notifications', {
      markAll: true,
    });
    return response.data;
  },
};

export default notificationsApi;
