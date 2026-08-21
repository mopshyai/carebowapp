/**
 * Notification Service
 * Handles safety check-in scheduling.
 *
 * Native background reminder notifications are still not connected in this RN
 * build. The important safety behavior is now server-authoritative: CareBow
 * stores the daily schedule and can escalate a missed check-in even when the
 * app is closed. This module never claims the feature is active unless that
 * server schedule was accepted.
 */

import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { safetyApi, getDeviceTimeZone } from '@/services/api/endpoints/safety';
import { useSafetyStore } from '../store/useSafetyStore';
import { PermissionStatus } from '../types';

// ============================================
// PERMISSION HELPERS
// ============================================

export async function requestNotificationPermission(): Promise<PermissionStatus> {
  if (Platform.OS === 'android') {
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
    return 'granted';
  }
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
// CHECK-IN SCHEDULING
// ============================================

export type CheckInNotificationConfig = {
  checkInTime: string;
  gracePeriodMinutes: number;
};

const scheduledNotifications: Map<string, NodeJS.Timeout> = new Map();

function clearLocalCheckInTimers(): void {
  scheduledNotifications.forEach((timeout, id) => {
    if (id.includes('checkin') || id.includes('grace_period')) {
      clearTimeout(timeout);
      scheduledNotifications.delete(id);
    }
  });
}

/**
 * Persist the schedule that powers automatic missed-check-in escalation.
 *
 * Native reminder delivery is intentionally not faked. If the backend rejects
 * the schedule, local state is rolled back to the last server value so the UI
 * cannot promise a safety feature the server does not know about.
 */
export async function scheduleCheckInReminder(
  config: CheckInNotificationConfig
): Promise<string | null> {
  const previous = await safetyApi.getDailyCheckIn();
  const response = await safetyApi.updateDailyCheckIn({
    enabled: true,
    time: config.checkInTime,
    gracePeriodMinutes: config.gracePeriodMinutes,
    timezone: getDeviceTimeZone(),
  });

  if (!response?.success) {
    const fallback = previous?.settings;
    useSafetyStore.getState().updateSettings({
      dailyCheckInEnabled: fallback?.enabled ?? false,
      dailyCheckInTime: fallback?.time ?? config.checkInTime,
      gracePeriodMinutes: fallback?.gracePeriodMinutes ?? config.gracePeriodMinutes,
    });
    Alert.alert(
      'Daily check-in not enabled',
      'CareBow could not save the safety schedule on the server. Automatic family alerts are not active. Please try again when you are online.'
    );
    return null;
  }

  clearLocalCheckInTimers();

  // Be explicit about the current boundary: automatic missed-check-in
  // escalation is live, but this build does not yet have a native background
  // reminder scheduler. Do not pretend an OS notification was scheduled.
  if (!previous?.settings?.enabled) {
    Alert.alert(
      'Daily check-in enabled',
      'CareBow will track the check-in on the server and alert your saved safety contacts if you miss the grace period. Background reminder notifications are not yet available in this build.'
    );
  }

  return response.checkIn?.id ?? `server_checkin_${Date.now()}`;
}

/**
 * Grace-period escalation is server-side now; no fake local warning timer.
 */
export async function scheduleGracePeriodWarning(
  _config: CheckInNotificationConfig
): Promise<string | null> {
  return null;
}

/**
 * Disable both local placeholder timers and the server schedule. If the server
 * cannot confirm disablement, restore the previous server state locally so the
 * UI does not falsely tell the user automatic escalation has stopped.
 */
export async function cancelCheckInNotifications(): Promise<void> {
  clearLocalCheckInTimers();

  const previous = await safetyApi.getDailyCheckIn();
  const current = useSafetyStore.getState().settings;
  const response = await safetyApi.updateDailyCheckIn({
    enabled: false,
    time: current.dailyCheckInTime,
    gracePeriodMinutes: current.gracePeriodMinutes,
    timezone: getDeviceTimeZone(),
  });

  if (!response?.success) {
    const fallback = previous?.settings;
    if (fallback) {
      useSafetyStore.getState().updateSettings({
        dailyCheckInEnabled: fallback.enabled,
        dailyCheckInTime: fallback.time,
        gracePeriodMinutes: fallback.gracePeriodMinutes,
      });
    }
    Alert.alert(
      'Could not disable daily check-in',
      'CareBow could not confirm the change with the server. Your previous safety schedule may still be active. Please try again when you are online.'
    );
  }
}

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
// NOTIFICATION CATEGORIES / LISTENERS
// ============================================

export async function setupNotificationCategories(): Promise<void> {
  // Native notification channels still need @notifee/react-native or an
  // equivalent native integration. Server escalation does not depend on this.
}

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

export function addNotificationResponseListener(
  _callback: NotificationResponseCallback
): EventSubscription {
  return { remove: () => {} };
}

export function addNotificationReceivedListener(
  _callback: (notification: { request: { content: { title: string; body: string } } }) => void
): EventSubscription {
  return { remove: () => {} };
}
