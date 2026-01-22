/**
 * Check-In Notifications Hook
 * Integrates the notification service with safety check-in settings
 */

import { useEffect, useCallback } from 'react';
import { useSafetySettings, useSafetyStore } from '../store/useSafetyStore';
import {
  scheduleCheckInReminder,
  cancelCheckInReminder,
  sendMissedCheckInAlert,
  initializeNotifications,
} from '@/services/notifications';

/**
 * Hook to manage check-in notification scheduling
 * Automatically schedules/cancels reminders when settings change
 */
export function useCheckInNotifications() {
  const settings = useSafetySettings();
  const { dailyCheckInEnabled, dailyCheckInTime } = settings;
  const updatePermissions = useSafetyStore((s) => s.updatePermissions);

  // Initialize notifications on mount
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const granted = await initializeNotifications();
      if (mounted) {
        updatePermissions({ notifications: granted ? 'granted' : 'denied' });
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, [updatePermissions]);

  // Schedule/cancel check-in reminder when settings change
  useEffect(() => {
    const manageReminder = async () => {
      if (dailyCheckInEnabled && dailyCheckInTime) {
        // Parse time string (format: "HH:MM" or "9:00 AM")
        const { hour, minute } = parseTimeString(dailyCheckInTime);

        if (hour !== null && minute !== null) {
          console.log(`[CheckInNotifications] Scheduling check-in reminder for ${hour}:${minute}`);
          await scheduleCheckInReminder(hour, minute);
        }
      } else {
        console.log('[CheckInNotifications] Cancelling check-in reminder');
        await cancelCheckInReminder();
      }
    };

    manageReminder();
  }, [dailyCheckInEnabled, dailyCheckInTime]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't cancel on unmount - we want reminders to persist
    };
  }, []);
}

/**
 * Hook to check if user missed their check-in and alert contacts
 */
export function useCheckInMonitor() {
  const settings = useSafetySettings();
  const hasCheckedInToday = useSafetyStore((s) => s.hasCheckedInToday());
  const recordMissedCheckIn = useSafetyStore((s) => s.recordMissedCheckIn);
  const contacts = useSafetyStore((s) => s.contacts);

  const checkForMissedCheckIn = useCallback(async () => {
    if (!settings.dailyCheckInEnabled || !settings.dailyCheckInTime) {
      return false;
    }

    // Parse check-in time
    const { hour, minute } = parseTimeString(settings.dailyCheckInTime);
    if (hour === null || minute === null) return false;

    // Check if current time is past check-in time
    const now = new Date();
    const checkInTime = new Date();
    checkInTime.setHours(hour, minute, 0, 0);

    // Add grace period (e.g., 30 minutes)
    const gracePeriodMs = 30 * 60 * 1000;
    const deadlineTime = new Date(checkInTime.getTime() + gracePeriodMs);

    // If past deadline and hasn't checked in
    if (now > deadlineTime && !hasCheckedInToday) {
      // Record missed check-in
      recordMissedCheckIn();

      // Alert primary contact
      const primaryContact = contacts.find((c) => c.isPrimary);
      if (primaryContact) {
        await sendMissedCheckInAlert(
          primaryContact.name,
          settings.lastCheckInAt ? new Date(settings.lastCheckInAt) : undefined
        );
      }

      return true;
    }

    return false;
  }, [
    settings.dailyCheckInEnabled,
    settings.dailyCheckInTime,
    settings.lastCheckInAt,
    hasCheckedInToday,
    recordMissedCheckIn,
    contacts,
  ]);

  return { checkForMissedCheckIn };
}

/**
 * Parse time string to hour and minute
 * Supports formats: "9:00", "09:00", "9:00 AM", "21:00"
 */
function parseTimeString(timeStr: string): { hour: number | null; minute: number | null } {
  if (!timeStr) return { hour: null, minute: null };

  // Try to parse "HH:MM" format
  const simpleMatch = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (simpleMatch) {
    return {
      hour: parseInt(simpleMatch[1], 10),
      minute: parseInt(simpleMatch[2], 10),
    };
  }

  // Try to parse "H:MM AM/PM" format
  const amPmMatch = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (amPmMatch) {
    let hour = parseInt(amPmMatch[1], 10);
    const minute = parseInt(amPmMatch[2], 10);
    const isPM = amPmMatch[3].toUpperCase() === 'PM';

    if (isPM && hour !== 12) {
      hour += 12;
    } else if (!isPM && hour === 12) {
      hour = 0;
    }

    return { hour, minute };
  }

  return { hour: null, minute: null };
}

export default useCheckInNotifications;
