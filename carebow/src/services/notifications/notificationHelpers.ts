/**
 * Notification Helpers
 * High-level functions for common notification scenarios
 */

import { NotificationService } from './NotificationService';
import { NotificationContent, NotificationTrigger, ScheduledNotification } from './types';

// ============================================
// ID GENERATORS
// ============================================

export const NotificationIds = {
  checkInReminder: (memberId?: string) => `check_in_reminder_${memberId || 'default'}`,
  appointmentReminder: (appointmentId: string) => `appointment_${appointmentId}`,
  medicationReminder: (medicationId: string, time: string) => `medication_${medicationId}_${time}`,
  followUpReminder: (episodeId: string) => `follow_up_${episodeId}`,
  sosConfirmation: () => `sos_confirmation_${Date.now()}`,
};

// ============================================
// CHECK-IN REMINDERS
// ============================================

/**
 * Schedule daily check-in reminder
 */
export async function scheduleCheckInReminder(
  hour: number,
  minute: number,
  memberId?: string
): Promise<string> {
  const notificationId = NotificationIds.checkInReminder(memberId);

  // Cancel any existing check-in reminder
  await NotificationService.cancel(notificationId);

  const content: NotificationContent = {
    title: 'Time for your daily check-in',
    body: "Tap to let your family know you're okay",
    channelId: 'check_in_reminder',
    priority: 'high',
    data: {
      type: 'check_in',
      memberId,
    },
    actions: [
      {
        id: 'check_in_now',
        title: "I'm OK",
        pressAction: { id: 'check_in_now' },
      },
      {
        id: 'snooze',
        title: 'Remind me later',
        pressAction: { id: 'snooze' },
      },
    ],
  };

  const trigger: NotificationTrigger = {
    repeatType: 'daily',
    repeatHour: hour,
    repeatMinute: minute,
  };

  return NotificationService.schedule({
    id: notificationId,
    content,
    trigger,
  });
}

/**
 * Cancel check-in reminder
 */
export async function cancelCheckInReminder(memberId?: string): Promise<void> {
  await NotificationService.cancel(NotificationIds.checkInReminder(memberId));
}

// ============================================
// APPOINTMENT REMINDERS
// ============================================

/**
 * Schedule appointment reminder
 */
export async function scheduleAppointmentReminder(
  appointmentId: string,
  appointmentTime: Date,
  serviceName: string,
  providerName?: string,
  reminderMinutesBefore: number = 60
): Promise<string> {
  const notificationId = NotificationIds.appointmentReminder(appointmentId);

  // Calculate reminder time
  const reminderTime = new Date(appointmentTime.getTime() - reminderMinutesBefore * 60 * 1000);

  // Don't schedule if reminder time has passed
  if (reminderTime.getTime() < Date.now()) {
    console.log('[NotificationHelpers] Skipping past appointment reminder');
    return notificationId;
  }

  const content: NotificationContent = {
    title: `Upcoming: ${serviceName}`,
    body: providerName
      ? `Your appointment with ${providerName} is in ${reminderMinutesBefore} minutes`
      : `Your appointment is in ${reminderMinutesBefore} minutes`,
    channelId: 'appointment_reminder',
    priority: 'high',
    data: {
      type: 'appointment_reminder',
      appointmentId,
      appointmentTime: appointmentTime.toISOString(),
    },
  };

  const trigger: NotificationTrigger = {
    timestamp: reminderTime.getTime(),
    repeatType: 'none',
  };

  return NotificationService.schedule({
    id: notificationId,
    content,
    trigger,
  });
}

/**
 * Cancel appointment reminder
 */
export async function cancelAppointmentReminder(appointmentId: string): Promise<void> {
  await NotificationService.cancel(NotificationIds.appointmentReminder(appointmentId));
}

// ============================================
// MEDICATION REMINDERS
// ============================================

/**
 * Schedule medication reminder
 */
export async function scheduleMedicationReminder(
  medicationId: string,
  medicationName: string,
  dosage: string,
  hour: number,
  minute: number
): Promise<string> {
  const timeKey = `${hour}:${minute}`;
  const notificationId = NotificationIds.medicationReminder(medicationId, timeKey);

  const content: NotificationContent = {
    title: 'Medication Reminder',
    body: `Time to take ${medicationName} - ${dosage}`,
    channelId: 'medication_reminder',
    priority: 'high',
    data: {
      type: 'medication_reminder',
      medicationId,
      medicationName,
      dosage,
    },
    actions: [
      {
        id: 'taken',
        title: 'Mark as taken',
        pressAction: { id: 'medication_taken' },
      },
      {
        id: 'snooze',
        title: 'Snooze 10 min',
        pressAction: { id: 'medication_snooze' },
      },
    ],
  };

  const trigger: NotificationTrigger = {
    repeatType: 'daily',
    repeatHour: hour,
    repeatMinute: minute,
  };

  return NotificationService.schedule({
    id: notificationId,
    content,
    trigger,
  });
}

/**
 * Cancel medication reminder
 */
export async function cancelMedicationReminder(medicationId: string, time: string): Promise<void> {
  await NotificationService.cancel(NotificationIds.medicationReminder(medicationId, time));
}

// ============================================
// FOLLOW-UP REMINDERS
// ============================================

/**
 * Schedule follow-up reminder after health conversation
 */
export async function scheduleFollowUpReminder(
  episodeId: string,
  symptomSummary: string,
  reminderTime: Date
): Promise<string> {
  const notificationId = NotificationIds.followUpReminder(episodeId);

  // Don't schedule if reminder time has passed
  if (reminderTime.getTime() < Date.now()) {
    console.log('[NotificationHelpers] Skipping past follow-up reminder');
    return notificationId;
  }

  const content: NotificationContent = {
    title: 'Health Follow-up',
    body: `How are you feeling? Tap to update us about: ${symptomSummary}`,
    channelId: 'follow_up',
    priority: 'default',
    data: {
      type: 'follow_up',
      episodeId,
      symptomSummary,
    },
    actions: [
      {
        id: 'feeling_better',
        title: 'Feeling better',
        pressAction: { id: 'follow_up_better' },
      },
      {
        id: 'no_change',
        title: 'About the same',
        pressAction: { id: 'follow_up_same' },
      },
      {
        id: 'worse',
        title: 'Feeling worse',
        pressAction: { id: 'follow_up_worse' },
      },
    ],
  };

  const trigger: NotificationTrigger = {
    timestamp: reminderTime.getTime(),
    repeatType: 'none',
  };

  return NotificationService.schedule({
    id: notificationId,
    content,
    trigger,
  });
}

/**
 * Cancel follow-up reminder
 */
export async function cancelFollowUpReminder(episodeId: string): Promise<void> {
  await NotificationService.cancel(NotificationIds.followUpReminder(episodeId));
}

// ============================================
// SOS NOTIFICATIONS
// ============================================

/**
 * Send immediate SOS confirmation notification
 */
export async function sendSOSConfirmation(
  contactsNotified: number,
  locationShared: boolean
): Promise<string> {
  const content: NotificationContent = {
    title: 'SOS Alert Sent',
    body: `${contactsNotified} emergency contact${contactsNotified !== 1 ? 's' : ''} notified${
      locationShared ? '. Your location was shared.' : '.'
    }`,
    channelId: 'sos_alert',
    priority: 'max',
    data: {
      type: 'sos_confirmation',
      contactsNotified,
      locationShared,
    },
  };

  return NotificationService.displayNow(content);
}

/**
 * Send missed check-in alert
 */
export async function sendMissedCheckInAlert(
  memberName: string,
  lastCheckIn?: Date
): Promise<string> {
  const content: NotificationContent = {
    title: `Missed Check-in: ${memberName}`,
    body: lastCheckIn
      ? `Last check-in was ${formatTimeAgo(lastCheckIn)}. Tap to check on them.`
      : `${memberName} hasn't checked in today. Tap to check on them.`,
    channelId: 'check_in_reminder',
    priority: 'high',
    data: {
      type: 'missed_check_in',
      memberName,
      lastCheckIn: lastCheckIn?.toISOString(),
    },
  };

  return NotificationService.displayNow(content);
}

// ============================================
// UTILITIES
// ============================================

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

/**
 * Initialize notification system and request permissions
 */
export async function initializeNotifications(): Promise<boolean> {
  try {
    await NotificationService.initialize();
    const status = await NotificationService.requestPermissions();
    return status.granted;
  } catch (error) {
    console.error('[NotificationHelpers] Failed to initialize notifications:', error);
    return false;
  }
}
