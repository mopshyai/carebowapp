/**
 * Notification Service
 * Handles local notifications for safety check-ins
 *
 * Note: This is a simplified implementation for RN CLI.
 * For production, consider using @notifee/react-native for full notification features.
 */

import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { PermissionStatus } from '../types';

// ============================================
// PERMISSION HELPERS
// ============================================

export async function requestNotificationPermission(): Promise<PermissionStatus> {
  if (Platform.OS === 'android') {
    // Android 13+ requires notification permission
    if (Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 'denied';
      } catch (error) {
        console.error('Error requesting notification permission:', error);
        return 'denied';
      }
    }
    return 'granted'; // Pre-Android 13 doesn't need permission
  }
  // iOS - permissions handled via native configuration
  return 'granted';
}

export async function getNotificationPermissionStatus(): Promise<PermissionStatus> {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    return granted ? 'granted' : 'denied';
  }
  return 'granted';
}

// ============================================
// NOTIFICATION SCHEDULING (Simplified)
// ============================================

export type CheckInNotificationConfig = {
  checkInTime: string; // HH:mm format
  gracePeriodMinutes: number;
};

// Storage for scheduled notification IDs
const scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();

/**
 * Schedule the daily check-in reminder notification
 * Fails closed until native background notification scheduling is connected.
 */
export async function scheduleCheckInReminder(
  _config: CheckInNotificationConfig
): Promise<string | null> {
  try {
    // Cancel any existing check-in notifications
    await cancelCheckInNotifications();

    Alert.alert(
      'Reminder not enabled',
      'Background safety reminders are not connected on this build. No reminder was scheduled.'
    );
    return null;
  } catch (error) {
    console.error('Failed to schedule check-in reminder:', error);
    return null;
  }
}

/**
 * Schedule the grace period warning notification
 */
export async function scheduleGracePeriodWarning(
  _config: CheckInNotificationConfig
): Promise<string | null> {
  try {
    Alert.alert(
      'Missed check-in alerts not enabled',
      'This build cannot send a background alert or notify contacts. No alert was scheduled.'
    );
    return null;
  } catch (error) {
    console.error('Failed to schedule grace period warning:', error);
    return null;
  }
}

/**
 * Cancel all check-in related notifications
 */
export async function cancelCheckInNotifications(): Promise<void> {
  try {
    scheduledNotifications.forEach((timeout, id) => {
      if (id.includes('checkin') || id.includes('grace_period')) {
        clearTimeout(timeout);
        scheduledNotifications.delete(id);
      }
    });
  } catch (error) {
    console.error('Failed to cancel check-in notifications:', error);
  }
}

/**
 * Cancel a specific notification by ID
 */
export async function cancelNotification(identifier: string): Promise<void> {
  try {
    const timeout = scheduledNotifications.get(identifier);
    if (timeout) {
      clearTimeout(timeout);
      scheduledNotifications.delete(identifier);
    }
  } catch (error) {
    console.error('Failed to cancel notification:', error);
  }
}

/**
 * Show an immediate local notification
 */
export async function showImmediateNotification(
  title: string,
  body: string,
  _data?: Record<string, unknown>
): Promise<string | null> {
  try {
    Alert.alert(title, body, [{ text: 'OK' }]);
    return `immediate_${Date.now()}`;
  } catch (error) {
    console.error('Failed to show immediate notification:', error);
    return null;
  }
}

// ============================================
// NOTIFICATION CATEGORIES (Placeholder)
// ============================================

export async function setupNotificationCategories(): Promise<void> {
  // For RN CLI, notification channels need to be configured in native code
  // or using @notifee/react-native
}

// ============================================
// NOTIFICATION LISTENERS (Placeholder types)
// ============================================

export type NotificationResponse = {
  notification: {
    request: {
      content: {
        title: string;
        body: string;
        data: Record<string, unknown>;
      };
    };
  };
  actionIdentifier: string;
};

export type NotificationResponseCallback = (response: NotificationResponse) => void;

export type EventSubscription = {
  remove: () => void;
};

/**
 * Subscribe to notification responses (placeholder)
 */
export function addNotificationResponseListener(
  _callback: NotificationResponseCallback
): EventSubscription {
  // In RN CLI, implement with @notifee/react-native
  return { remove: () => {} };
}

/**
 * Subscribe to received notifications (placeholder)
 */
export function addNotificationReceivedListener(
  _callback: (notification: { request: { content: { title: string; body: string } } }) => void
): EventSubscription {
  return { remove: () => {} };
}
