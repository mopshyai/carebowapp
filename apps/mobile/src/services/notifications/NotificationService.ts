/**
 * Notification Service Implementation
 *
 * This service provides local notifications using @notifee/react-native.
 * Supports scheduled notifications, channels (Android), and event handling.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import notifee, {
  AndroidImportance,
  AndroidVisibility,
  TriggerType,
  RepeatFrequency,
  EventType,
  TimestampTrigger,
  IntervalTrigger,
  Event,
  Notification,
} from '@notifee/react-native';
import {
  INotificationService,
  NotificationContent,
  NotificationPermissionStatus,
  ScheduledNotification,
  NotificationTrigger,
  NOTIFICATION_CHANNELS,
  NotificationChannel,
} from './types';

// ============================================
// STORAGE KEY
// ============================================

const STORAGE_KEY = '@carebow/scheduled_notifications';

// ============================================
// IMPORTANCE MAPPING
// ============================================

const importanceMap: Record<string, AndroidImportance> = {
  max: AndroidImportance.HIGH,
  high: AndroidImportance.HIGH,
  default: AndroidImportance.DEFAULT,
  low: AndroidImportance.LOW,
  min: AndroidImportance.MIN,
};

// ============================================
// NOTIFICATION SERVICE IMPLEMENTATION
// ============================================

class NotificationServiceImpl implements INotificationService {
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();
  private pressCallbacks: Set<(notification: ScheduledNotification) => void> = new Set();
  private actionCallbacks: Set<(actionId: string, notification: ScheduledNotification) => void> = new Set();
  private initialized = false;
  private foregroundUnsubscribe: (() => void) | null = null;

  // ========================================
  // INITIALIZATION
  // ========================================

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Load persisted notifications metadata
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const notifications: ScheduledNotification[] = JSON.parse(stored);
        notifications.forEach((n) => {
          this.scheduledNotifications.set(n.id, n);
        });
      }

      // Create notification channels (Android only)
      if (Platform.OS === 'android') {
        await this.createChannels();
      }

      // Set up foreground event handler
      this.foregroundUnsubscribe = notifee.onForegroundEvent(this.handleForegroundEvent.bind(this));

      // Set up background event handler
      notifee.onBackgroundEvent(this.handleBackgroundEvent.bind(this));

      this.initialized = true;

      if (__DEV__) {
        console.log('[NotificationService] Initialized with', this.scheduledNotifications.size, 'scheduled notifications');
      }
    } catch (error) {
      console.error('[NotificationService] Initialization failed:', error);
    }
  }

  private async createChannels(): Promise<void> {
    try {
      const channels = NOTIFICATION_CHANNELS.map((channel: NotificationChannel) => ({
        id: channel.id,
        name: channel.name,
        description: channel.description,
        importance: importanceMap[channel.importance] || AndroidImportance.DEFAULT,
        vibration: channel.vibration,
        sound: channel.sound,
        visibility: AndroidVisibility.PUBLIC,
        lights: true,
        badge: true,
      }));

      await notifee.createChannels(channels);

      if (__DEV__) {
        console.log('[NotificationService] Created', channels.length, 'notification channels');
      }
    } catch (error) {
      console.error('[NotificationService] Failed to create channels:', error);
    }
  }

  // ========================================
  // PERMISSIONS
  // ========================================

  async requestPermissions(): Promise<NotificationPermissionStatus> {
    try {
      const settings = await notifee.requestPermission();

      const status: NotificationPermissionStatus = {
        granted: settings.authorizationStatus >= 1,
        ios: Platform.OS === 'ios' ? {
          alert: settings.ios?.alert === 1,
          badge: settings.ios?.badge === 1,
          sound: settings.ios?.sound === 1,
          criticalAlert: settings.ios?.criticalAlert === 1,
        } : undefined,
        android: Platform.OS === 'android' ? {
          alarm: true, // Check exact permissions if needed
        } : undefined,
      };

      if (__DEV__) {
        console.log('[NotificationService] Permission status:', status.granted ? 'granted' : 'denied');
      }

      return status;
    } catch (error) {
      console.error('[NotificationService] Permission request failed:', error);
      return { granted: false };
    }
  }

  async getPermissionStatus(): Promise<NotificationPermissionStatus> {
    try {
      const settings = await notifee.getNotificationSettings();

      return {
        granted: settings.authorizationStatus >= 1,
        ios: Platform.OS === 'ios' ? {
          alert: settings.ios?.alert === 1,
          badge: settings.ios?.badge === 1,
          sound: settings.ios?.sound === 1,
          criticalAlert: settings.ios?.criticalAlert === 1,
        } : undefined,
        android: Platform.OS === 'android' ? {
          alarm: true,
        } : undefined,
      };
    } catch (error) {
      console.error('[NotificationService] Get permission status failed:', error);
      return { granted: false };
    }
  }

  // ========================================
  // SCHEDULING
  // ========================================

  async schedule(notification: Omit<ScheduledNotification, 'createdAt'>): Promise<string> {
    const fullNotification: ScheduledNotification = {
      ...notification,
      createdAt: Date.now(),
    };

    try {
      // Build the Notifee trigger
      const trigger = this.buildTrigger(notification.trigger);

      // Build notification content
      const notificationContent: Notification = {
        id: notification.id,
        title: notification.content.title,
        body: notification.content.body,
        subtitle: notification.content.subtitle,
        data: notification.content.data,
        android: {
          channelId: notification.content.channelId || 'general',
          smallIcon: 'ic_notification',
          pressAction: {
            id: 'default',
          },
          actions: notification.content.actions?.map((action) => ({
            title: action.title,
            pressAction: {
              id: action.id,
            },
          })),
        },
        ios: {
          sound: notification.content.sound || 'default',
          badgeCount: notification.content.badge,
          categoryId: notification.content.channelId,
        },
      };

      // Create the trigger notification
      await notifee.createTriggerNotification(notificationContent, trigger);

      // Store in our map and persist
      this.scheduledNotifications.set(notification.id, fullNotification);
      await this.persistNotifications();

      if (__DEV__) {
        console.log('[NotificationService] Scheduled notification:', {
          id: notification.id,
          title: notification.content.title,
          trigger: this.formatTrigger(notification.trigger),
        });
      }

      return notification.id;
    } catch (error) {
      console.error('[NotificationService] Failed to schedule notification:', error);
      throw error;
    }
  }

  private buildTrigger(trigger: NotificationTrigger): TimestampTrigger | IntervalTrigger {
    // Timestamp-based trigger (one-time or repeating at specific time)
    if (trigger.timestamp) {
      const timestampTrigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: trigger.timestamp,
      };

      // Add repeat frequency if specified
      if (trigger.repeatType) {
        switch (trigger.repeatType) {
          case 'daily':
            timestampTrigger.repeatFrequency = RepeatFrequency.DAILY;
            break;
          case 'weekly':
            timestampTrigger.repeatFrequency = RepeatFrequency.WEEKLY;
            break;
        }
      }

      return timestampTrigger;
    }

    // Daily repeating at specific time
    if (trigger.repeatType === 'daily' && trigger.repeatHour !== undefined) {
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setHours(trigger.repeatHour, trigger.repeatMinute || 0, 0, 0);

      // If the time has passed today, schedule for tomorrow
      if (scheduledTime.getTime() <= now.getTime()) {
        scheduledTime.setDate(scheduledTime.getDate() + 1);
      }

      return {
        type: TriggerType.TIMESTAMP,
        timestamp: scheduledTime.getTime(),
        repeatFrequency: RepeatFrequency.DAILY,
      };
    }

    // Interval-based trigger
    if (trigger.intervalMs) {
      return {
        type: TriggerType.INTERVAL,
        interval: Math.floor(trigger.intervalMs / 60000), // Convert to minutes
      };
    }

    // Default: schedule for 1 minute from now
    return {
      type: TriggerType.TIMESTAMP,
      timestamp: Date.now() + 60000,
    };
  }

  private formatTrigger(trigger: NotificationTrigger): string {
    if (trigger.timestamp) {
      const date = new Date(trigger.timestamp);
      const repeatStr = trigger.repeatType ? ` (repeating ${trigger.repeatType})` : '';
      return `at ${date.toLocaleString()}${repeatStr}`;
    }
    if (trigger.repeatType === 'daily' && trigger.repeatHour !== undefined) {
      return `daily at ${trigger.repeatHour}:${String(trigger.repeatMinute || 0).padStart(2, '0')}`;
    }
    if (trigger.intervalMs) {
      return `every ${Math.floor(trigger.intervalMs / 60000)} minutes`;
    }
    return 'unknown trigger';
  }

  async cancel(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
      this.scheduledNotifications.delete(notificationId);
      await this.persistNotifications();

      if (__DEV__) {
        console.log('[NotificationService] Cancelled notification:', notificationId);
      }
    } catch (error) {
      console.error('[NotificationService] Failed to cancel notification:', error);
    }
  }

  async cancelAll(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
      this.scheduledNotifications.clear();
      await this.persistNotifications();

      if (__DEV__) {
        console.log('[NotificationService] Cancelled all notifications');
      }
    } catch (error) {
      console.error('[NotificationService] Failed to cancel all notifications:', error);
    }
  }

  async getScheduled(): Promise<ScheduledNotification[]> {
    return Array.from(this.scheduledNotifications.values());
  }

  // ========================================
  // IMMEDIATE DISPLAY
  // ========================================

  async displayNow(content: NotificationContent): Promise<string> {
    const notificationId = content.id || `immediate_${Date.now()}`;

    try {
      await notifee.displayNotification({
        id: notificationId,
        title: content.title,
        body: content.body,
        subtitle: content.subtitle,
        data: content.data,
        android: {
          channelId: content.channelId || 'general',
          smallIcon: 'ic_notification',
          pressAction: {
            id: 'default',
          },
          actions: content.actions?.map((action) => ({
            title: action.title,
            pressAction: {
              id: action.id,
            },
          })),
        },
        ios: {
          sound: content.sound || 'default',
          badgeCount: content.badge,
        },
      });

      if (__DEV__) {
        console.log('[NotificationService] Displayed notification:', {
          id: notificationId,
          title: content.title,
        });
      }

      return notificationId;
    } catch (error) {
      console.error('[NotificationService] Failed to display notification:', error);
      throw error;
    }
  }

  // ========================================
  // EVENT HANDLERS
  // ========================================

  private handleForegroundEvent({ type, detail }: Event): void {
    const notification = detail.notification;
    if (!notification) return;

    const scheduledNotification = this.scheduledNotifications.get(notification.id || '');

    switch (type) {
      case EventType.DISMISSED:
        if (__DEV__) {
          console.log('[NotificationService] Notification dismissed:', notification.id);
        }
        break;

      case EventType.PRESS:
        if (__DEV__) {
          console.log('[NotificationService] Notification pressed:', notification.id);
        }
        if (scheduledNotification) {
          this.pressCallbacks.forEach((callback) => callback(scheduledNotification));
        }
        break;

      case EventType.ACTION_PRESS:
        const actionId = detail.pressAction?.id;
        if (__DEV__) {
          console.log('[NotificationService] Action pressed:', actionId, 'on', notification.id);
        }
        if (actionId && scheduledNotification) {
          this.actionCallbacks.forEach((callback) => callback(actionId, scheduledNotification));
        }
        break;
    }
  }

  private async handleBackgroundEvent({ type, detail }: Event): Promise<void> {
    // Background events are handled similarly
    // Can be used for actions that need to happen even when app is backgrounded
    const notification = detail.notification;
    if (!notification) return;

    if (type === EventType.PRESS || type === EventType.ACTION_PRESS) {
      // Store the event to be handled when app comes to foreground
      // Or handle immediately if it's an action that doesn't need UI
      if (__DEV__) {
        console.log('[NotificationService] Background event:', type, notification.id);
      }
    }
  }

  onNotificationPressed(callback: (notification: ScheduledNotification) => void): () => void {
    this.pressCallbacks.add(callback);
    return () => {
      this.pressCallbacks.delete(callback);
    };
  }

  onActionPressed(callback: (actionId: string, notification: ScheduledNotification) => void): () => void {
    this.actionCallbacks.add(callback);
    return () => {
      this.actionCallbacks.delete(callback);
    };
  }

  // ========================================
  // BADGE MANAGEMENT
  // ========================================

  async setBadgeCount(count: number): Promise<void> {
    try {
      await notifee.setBadgeCount(count);
    } catch (error) {
      console.error('[NotificationService] Failed to set badge count:', error);
    }
  }

  async getBadgeCount(): Promise<number> {
    try {
      return await notifee.getBadgeCount();
    } catch (error) {
      console.error('[NotificationService] Failed to get badge count:', error);
      return 0;
    }
  }

  async incrementBadgeCount(): Promise<void> {
    try {
      await notifee.incrementBadgeCount();
    } catch (error) {
      console.error('[NotificationService] Failed to increment badge count:', error);
    }
  }

  async decrementBadgeCount(): Promise<void> {
    try {
      await notifee.decrementBadgeCount();
    } catch (error) {
      console.error('[NotificationService] Failed to decrement badge count:', error);
    }
  }

  // ========================================
  // PERSISTENCE
  // ========================================

  private async persistNotifications(): Promise<void> {
    try {
      const notifications = Array.from(this.scheduledNotifications.values());
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error('[NotificationService] Failed to persist notifications:', error);
    }
  }

  // ========================================
  // CLEANUP
  // ========================================

  destroy(): void {
    if (this.foregroundUnsubscribe) {
      this.foregroundUnsubscribe();
      this.foregroundUnsubscribe = null;
    }
    this.pressCallbacks.clear();
    this.actionCallbacks.clear();
    this.initialized = false;
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const NotificationService = new NotificationServiceImpl();
export default NotificationService;
