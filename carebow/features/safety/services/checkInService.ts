/**
 * Check-In Service
 * Core logic for daily safety check-ins
 */

import { SafetySettings, CheckInStatus, CheckInState } from '../types';

// ============================================
// DATE/TIME HELPERS
// ============================================

/**
 * Parse time string (HH:mm) and return today's date at that time
 */
export function parseTimeToToday(timeString: string): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0,
    0
  );
}

/**
 * Get start of today in local time
 */
export function getTodayStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/**
 * Get end of today in local time
 */
export function getTodayEnd(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
}

/**
 * Check if two dates are the same local calendar day
 */
export function isSameLocalDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Format date to display time (e.g., "9:32 AM")
 */
export function formatDisplayTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format HH:mm time string to display format (e.g., "10:00" -> "10:00 AM")
 */
export function formatScheduledTime(timeString: string): string {
  const date = parseTimeToToday(timeString);
  return formatDisplayTime(date);
}

// ============================================
// CHECK-IN LOGIC
// ============================================

/**
 * Determine if check-in is due today based on settings
 */
export function isCheckInDueToday(settings: SafetySettings): boolean {
  if (!settings.dailyCheckInEnabled) return false;

  const now = new Date();
  const scheduledTime = parseTimeToToday(settings.dailyCheckInTime);

  // Check-in becomes due after the scheduled time
  return now >= scheduledTime;
}

/**
 * Calculate the deadline (end of grace period) for today's check-in
 */
export function getCheckInDeadline(settings: SafetySettings): Date {
  const scheduledTime = parseTimeToToday(settings.dailyCheckInTime);
  return new Date(scheduledTime.getTime() + settings.gracePeriodMinutes * 60 * 1000);
}

/**
 * Check if the user has missed the check-in deadline
 */
export function hasMissedDeadline(settings: SafetySettings): boolean {
  if (!settings.dailyCheckInEnabled) return false;

  // If already checked in today, not missed
  if (settings.lastCheckInAt) {
    const lastCheckIn = new Date(settings.lastCheckInAt);
    if (isSameLocalDay(lastCheckIn, new Date())) {
      return false;
    }
  }

  const now = new Date();
  const deadline = getCheckInDeadline(settings);

  return now > deadline;
}

/**
 * Check if the user has checked in today
 */
export function hasCheckedInToday(settings: SafetySettings): boolean {
  if (!settings.lastCheckInAt) return false;

  const lastCheckIn = new Date(settings.lastCheckInAt);
  return isSameLocalDay(lastCheckIn, new Date());
}

/**
 * Check if user checked in late (after the deadline but same day)
 */
export function didCheckInLate(settings: SafetySettings): boolean {
  if (!settings.lastCheckInAt) return false;

  const lastCheckIn = new Date(settings.lastCheckInAt);
  if (!isSameLocalDay(lastCheckIn, new Date())) return false;

  const deadline = getCheckInDeadline(settings);
  return lastCheckIn > deadline;
}

/**
 * Get the comprehensive check-in state for UI display
 */
export function getCheckInState(settings: SafetySettings): CheckInState {
  const now = new Date();
  const scheduledTime = parseTimeToToday(settings.dailyCheckInTime);
  const deadline = getCheckInDeadline(settings);
  const checkedInToday = hasCheckedInToday(settings);
  const missedDeadline = hasMissedDeadline(settings);
  const isOverdue = now > scheduledTime && !checkedInToday;

  let status: CheckInStatus;
  let checkInTime: string | null = null;

  if (!settings.dailyCheckInEnabled) {
    status = 'NOT_DUE';
  } else if (checkedInToday) {
    checkInTime = settings.lastCheckInAt;
    if (didCheckInLate(settings)) {
      status = 'CHECKED_IN_LATE';
    } else {
      status = 'CHECKED_IN';
    }
  } else if (missedDeadline) {
    status = 'MISSED';
  } else if (now >= scheduledTime) {
    status = 'DUE';
  } else {
    status = 'NOT_DUE';
  }

  return {
    status,
    checkInTime,
    scheduledTime: scheduledTime.toISOString(),
    deadlineTime: deadline.toISOString(),
    isOverdue,
  };
}

/**
 * Get a human-readable status message
 */
export function getCheckInStatusMessage(state: CheckInState): string {
  switch (state.status) {
    case 'CHECKED_IN':
      if (state.checkInTime) {
        const time = formatDisplayTime(new Date(state.checkInTime));
        return `Checked in at ${time} ✓`;
      }
      return 'Checked in today ✓';

    case 'CHECKED_IN_LATE':
      if (state.checkInTime) {
        const time = formatDisplayTime(new Date(state.checkInTime));
        return `Checked in late at ${time}`;
      }
      return 'Checked in late today';

    case 'MISSED':
      return 'Missed check-in - please check in now';

    case 'DUE':
      return 'Check-in due - tap below';

    case 'NOT_DUE':
      const scheduledTime = formatDisplayTime(new Date(state.scheduledTime));
      return `Check-in scheduled for ${scheduledTime}`;

    default:
      return 'Check-in status unknown';
  }
}

// ============================================
// VALIDATION
// ============================================

/**
 * Validate time string format (HH:mm)
 */
export function isValidTimeFormat(timeString: string): boolean {
  const regex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
  return regex.test(timeString);
}

/**
 * Validate grace period (must be positive, max 24 hours)
 */
export function isValidGracePeriod(minutes: number): boolean {
  return minutes > 0 && minutes <= 1440; // 1440 = 24 hours
}

// ============================================
// MISSED CHECK-IN DETECTION (APP FOREGROUND)
// ============================================

/**
 * Check if we should prompt user about missed check-in
 * Called when app comes to foreground
 */
export function shouldPromptMissedCheckIn(settings: SafetySettings): boolean {
  if (!settings.dailyCheckInEnabled) return false;
  if (hasCheckedInToday(settings)) return false;

  return hasMissedDeadline(settings);
}

/**
 * Check if we already recorded this missed check-in
 * (to avoid duplicate events)
 */
export function alreadyRecordedMissedCheckIn(settings: SafetySettings): boolean {
  if (!settings.lastMissedCheckInAt) return false;

  const lastMissed = new Date(settings.lastMissedCheckInAt);
  return isSameLocalDay(lastMissed, new Date());
}
