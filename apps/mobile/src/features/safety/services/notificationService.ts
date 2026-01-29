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
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
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
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
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
let scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();

/**
 * Parse time string (HH:mm) and return Date for today at that time
 */
function getTimeForToday(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  const target = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0,
    0
  );
  return target;
}

/**
 * Get the next occurrence of a time (today if not passed, tomorrow if passed)
 */
function getNextOccurrence(timeString: string): Date {
  const target = getTimeForToday(timeString);
  const now = new Date();

  if (target <= now) {
    // Time has passed today, schedule for tomorrow
    target.setDate(target.getDate() + 1);
  }

  return target;
}

/**
 * Schedule the daily check-in reminder notification
 * Note: For production, use @notifee/react-native for proper scheduling
 */
export async function scheduleCheckInReminder(
  config: CheckInNotificationConfig
): Promise<string | null> {
  try {
    // Cancel any existing check-in notifications
    await cancelCheckInNotifications();

    const triggerTime = getNextOccurrence(config.checkInTime);
    const delay = triggerTime.getTime() - Date.now();

    const identifier = `checkin_reminder_${Date.now()}`;

    // Use setTimeout for demo (in production, use proper notification library)
    const timeout = setTimeout(() => {
      Alert.alert(
        'Daily Safety Check-in',
        "Quick check-in: Tap 'I'm OK' to let your family know you're safe.",
        [
          { text: "I'm OK", onPress: () => console.log('User checked in') },
          { text: 'Later', style: 'cancel' },
        ]
      );
    }, delay);

    scheduledNotifications.set(identifier, timeout);

    console.log(`Check-in reminder scheduled for ${triggerTime.toLocaleString()}`);
    return identifier;
  } catch (error) {
    console.error('Failed to schedule check-in reminder:', error);
    return null;
  }
}

/**
 * Schedule the grace period warning notification
 */
export async function scheduleGracePeriodWarning(
  config: CheckInNotificationConfig
): Promise<string | null> {
  try {
    const checkInTime = getTimeForToday(config.checkInTime);
    const graceDeadline = new Date(
      checkInTime.getTime() + config.gracePeriodMinutes * 60 * 1000
    );
    const now = new Date();

    if (graceDeadline <= now) {
      graceDeadline.setDate(graceDeadline.getDate() + 1);
    }

    const delay = graceDeadline.getTime() - Date.now();
    const identifier = `grace_period_${Date.now()}`;

    const timeout = setTimeout(() => {
      Alert.alert(
        'Missed Check-in',
        "You missed today's check-in. Tap to notify your emergency contacts or check in now.",
        [
          { text: 'Notify Contacts', onPress: () => console.log('Notify contacts') },
          { text: "I'm OK", onPress: () => console.log('User checked in late') },
        ]
      );
    }, delay);

    scheduledNotifications.set(identifier, timeout);
    return identifier;
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
  data?: Record<string, unknown>
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
  console.log('Notification categories setup - implement with native code or @notifee');
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

export type NotificationResponseCallback = (
  response: NotificationResponse
) => void;

export type EventSubscription = {
  remove: () => void;
};

/**
 * Subscribe to notification responses (placeholder)
 */
export function addNotificationResponseListener(
  callback: NotificationResponseCallback
): EventSubscription {
  // In RN CLI, implement with @notifee/react-native
  return { remove: () => {} };
}

/**
 * Subscribe to received notifications (placeholder)
 */
export function addNotificationReceivedListener(
  callback: (notification: { request: { content: { title: string; body: string } } }) => void
): EventSubscription {
  return { remove: () => {} };
}
