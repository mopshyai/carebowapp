/**
 * Notification Service Types
 * Type definitions for the notification system
 */

// ============================================
// NOTIFICATION TYPES
// ============================================

export type NotificationChannel =
  | 'check_in_reminder'
  | 'sos_alert'
  | 'appointment_reminder'
  | 'medication_reminder'
  | 'follow_up'
  | 'general';

export type NotificationPriority = 'default' | 'high' | 'max';

export type NotificationRepeatType =
  | 'none'
  | 'daily'
  | 'weekly'
  | 'custom';

export interface NotificationAction {
  id: string;
  title: string;
  /** Action to perform when pressed */
  pressAction?: {
    id: string;
    launchActivity?: string;
  };
}

export interface NotificationTrigger {
  /** Specific date/time to trigger */
  timestamp?: number;
  /** Repeat configuration */
  repeatType?: NotificationRepeatType;
  /** For daily repeat: hour (0-23) */
  repeatHour?: number;
  /** For daily repeat: minute (0-59) */
  repeatMinute?: number;
  /** For weekly repeat: days of week (0-6, 0 = Sunday) */
  repeatDays?: number[];
  /** Custom interval in milliseconds */
  repeatInterval?: number;
}

export interface NotificationContent {
  /** Notification title */
  title: string;
  /** Notification body text */
  body: string;
  /** Optional subtitle (iOS) */
  subtitle?: string;
  /** Custom data payload */
  data?: Record<string, unknown>;
  /** Android channel ID */
  channelId?: NotificationChannel;
  /** Notification priority */
  priority?: NotificationPriority;
  /** Actions to show on notification */
  actions?: NotificationAction[];
  /** Badge count (iOS) */
  badge?: number;
  /** Sound file name */
  sound?: string;
  /** Show as silent notification */
  silent?: boolean;
}

export interface ScheduledNotification {
  id: string;
  content: NotificationContent;
  trigger: NotificationTrigger;
  createdAt: number;
}

export interface NotificationPermissionStatus {
  granted: boolean;
  ios?: {
    alert: boolean;
    badge: boolean;
    sound: boolean;
    criticalAlert: boolean;
  };
  android?: {
    alarm: boolean;
  };
}

// ============================================
// CHANNEL DEFINITIONS
// ============================================

export interface NotificationChannelConfig {
  id: NotificationChannel;
  name: string;
  description: string;
  importance: 'default' | 'high' | 'max';
  sound?: string;
  vibration?: boolean;
  lights?: boolean;
}

export const NOTIFICATION_CHANNELS: NotificationChannelConfig[] = [
  {
    id: 'check_in_reminder',
    name: 'Check-in Reminders',
    description: 'Daily safety check-in reminders',
    importance: 'high',
    vibration: true,
  },
  {
    id: 'sos_alert',
    name: 'SOS Alerts',
    description: 'Emergency SOS alerts',
    importance: 'max',
    vibration: true,
    sound: 'emergency',
  },
  {
    id: 'appointment_reminder',
    name: 'Appointment Reminders',
    description: 'Reminders for upcoming appointments',
    importance: 'high',
    vibration: true,
  },
  {
    id: 'medication_reminder',
    name: 'Medication Reminders',
    description: 'Reminders to take medications',
    importance: 'high',
    vibration: true,
  },
  {
    id: 'follow_up',
    name: 'Follow-up Reminders',
    description: 'Follow-up check reminders from health conversations',
    importance: 'default',
  },
  {
    id: 'general',
    name: 'General',
    description: 'General notifications',
    importance: 'default',
  },
];

// ============================================
// SERVICE INTERFACE
// ============================================

export interface INotificationService {
  /** Initialize the notification service */
  initialize(): Promise<void>;

  /** Request notification permissions */
  requestPermissions(): Promise<NotificationPermissionStatus>;

  /** Check current permission status */
  getPermissionStatus(): Promise<NotificationPermissionStatus>;

  /** Schedule a notification */
  schedule(notification: Omit<ScheduledNotification, 'createdAt'>): Promise<string>;

  /** Cancel a scheduled notification */
  cancel(notificationId: string): Promise<void>;

  /** Cancel all scheduled notifications */
  cancelAll(): Promise<void>;

  /** Get all scheduled notifications */
  getScheduled(): Promise<ScheduledNotification[]>;

  /** Display an immediate notification */
  displayNow(content: NotificationContent): Promise<string>;

  /** Handle notification press */
  onNotificationPressed(callback: (notification: ScheduledNotification) => void): () => void;

  /** Handle notification action press */
  onActionPressed(callback: (actionId: string, notification: ScheduledNotification) => void): () => void;
}
