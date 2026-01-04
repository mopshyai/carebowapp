/**
 * Notification Service
 * Handles local notifications for safety check-ins
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { PermissionStatus } from '../types';

// ============================================
// CONFIGURATION
// ============================================

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ============================================
// PERMISSION HELPERS
// ============================================

export async function requestNotificationPermission(): Promise<PermissionStatus> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus === 'granted') {
    return 'granted';
  }

  const { status } = await Notifications.requestPermissionsAsync();

  if (status === 'granted') {
    return 'granted';
  } else if (status === 'denied') {
    return 'denied';
  }

  return 'undetermined';
}

export async function getNotificationPermissionStatus(): Promise<PermissionStatus> {
  const { status } = await Notifications.getPermissionsAsync();

  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';
  return 'undetermined';
}

// ============================================
// NOTIFICATION SCHEDULING
// ============================================

export type CheckInNotificationConfig = {
  checkInTime: string; // HH:mm format
  gracePeriodMinutes: number;
};

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
 */
export async function scheduleCheckInReminder(
  config: CheckInNotificationConfig
): Promise<string | null> {
  try {
    // Cancel any existing check-in notifications
    await cancelCheckInNotifications();

    const triggerTime = getNextOccurrence(config.checkInTime);

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Daily Safety Check-in',
        body: "Quick check-in: Tap 'I'm OK' to let your family know you're safe.",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'CHECKIN_REMINDER' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: triggerTime.getHours(),
        minute: triggerTime.getMinutes(),
      },
    });

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

    // If deadline has already passed today, schedule for tomorrow
    if (graceDeadline <= now) {
      graceDeadline.setDate(graceDeadline.getDate() + 1);
    }

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Missed Check-in',
        body: "You missed today's check-in. Tap to notify your emergency contacts or check in now.",
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'MISSED_CHECKIN' },
        categoryIdentifier: 'MISSED_CHECKIN',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: graceDeadline,
      },
    });

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
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();

    const checkInNotifications = scheduledNotifications.filter(
      (n) =>
        n.content.data?.type === 'CHECKIN_REMINDER' ||
        n.content.data?.type === 'MISSED_CHECKIN'
    );

    await Promise.all(
      checkInNotifications.map((n) =>
        Notifications.cancelScheduledNotificationAsync(n.identifier)
      )
    );
  } catch (error) {
    console.error('Failed to cancel check-in notifications:', error);
  }
}

/**
 * Cancel a specific notification by ID
 */
export async function cancelNotification(identifier: string): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(identifier);
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
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data,
      },
      trigger: null, // Immediate
    });
    return identifier;
  } catch (error) {
    console.error('Failed to show immediate notification:', error);
    return null;
  }
}

// ============================================
// NOTIFICATION CATEGORIES (Android actions)
// ============================================

export async function setupNotificationCategories(): Promise<void> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('safety', {
      name: 'Safety Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#DC2626',
      sound: 'default',
    });
  }

  // Set up action categories
  await Notifications.setNotificationCategoryAsync('MISSED_CHECKIN', [
    {
      identifier: 'NOTIFY_CONTACTS',
      buttonTitle: 'Notify Contacts',
      options: {
        opensAppToForeground: true,
      },
    },
    {
      identifier: 'IM_OK',
      buttonTitle: "I'm OK",
      options: {
        opensAppToForeground: true,
      },
    },
  ]);
}

// ============================================
// NOTIFICATION LISTENERS
// ============================================

export type NotificationResponseCallback = (
  response: Notifications.NotificationResponse
) => void;

/**
 * Subscribe to notification responses (when user taps notification)
 */
export function addNotificationResponseListener(
  callback: NotificationResponseCallback
): Notifications.EventSubscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Subscribe to received notifications (when notification arrives)
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.EventSubscription {
  return Notifications.addNotificationReceivedListener(callback);
}
