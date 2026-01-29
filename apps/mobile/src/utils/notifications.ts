/**
 * Notifications Utility
 * Re-exports from the new notification service for backward compatibility
 *
 * @deprecated Import from '@/services/notifications' instead
 */

import {
  NotificationService,
  initializeNotifications,
  type ScheduledNotification,
  type NotificationPermissionStatus,
} from '../services/notifications';

export interface LocalNotification {
  id: string;
  title: string;
  body: string;
  scheduledAt: Date;
  data?: Record<string, unknown>;
}

/**
 * Schedule a local notification
 * @deprecated Use NotificationService.schedule() instead
 */
export async function scheduleLocalNotification(
  notification: LocalNotification
): Promise<string | null> {
  const result = await NotificationService.schedule({
    id: notification.id,
    content: {
      title: notification.title,
      body: notification.body,
      data: notification.data,
    },
    trigger: {
      timestamp: notification.scheduledAt.getTime(),
      repeatType: 'none',
    },
  });

  return result;
}

/**
 * Cancel a scheduled local notification
 * @deprecated Use NotificationService.cancel() instead
 */
export async function cancelLocalNotification(notificationId: string): Promise<void> {
  await NotificationService.cancel(notificationId);
}

/**
 * Cancel all scheduled notifications
 * @deprecated Use NotificationService.cancelAll() instead
 */
export async function cancelAllNotifications(): Promise<void> {
  await NotificationService.cancelAll();
}

/**
 * Request notification permissions
 * @deprecated Use NotificationService.requestPermissions() instead
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  const status = await NotificationService.requestPermissions();
  return status.granted;
}

/**
 * Check if notifications are enabled
 * @deprecated Use NotificationService.getPermissionStatus() instead
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  const status = await NotificationService.getPermissionStatus();
  return status.granted;
}

// Re-export new service for migration
export { NotificationService, initializeNotifications };
