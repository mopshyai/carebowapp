/**
 * Safety Feature Types
 * Types for Emergency & Safety functionality
 */

import { generateId } from '@/types/profile';

// ============================================
// SAFETY EVENT TYPES
// ============================================

export type SafetyEventType =
  | 'SOS_TRIGGERED'
  | 'CHECKIN_CONFIRMED'
  | 'CHECKIN_MISSED'
  | 'TEST_ALERT_SENT';

export type SafetyEvent = {
  id: string;
  type: SafetyEventType;
  userId: string;
  timestamp: string;
  metadata: SafetyEventMetadata;
};

export type SafetyEventMetadata = {
  location?: {
    lat: number;
    lng: number;
    accuracy: number | null;
  };
  note?: string;
  contactsNotified?: string[];
  wasLate?: boolean;
};

// ============================================
// SAFETY SETTINGS
// ============================================

export type EscalationOrder = 'PRIMARY_CONTACT' | 'ALL_CONTACTS';

export type SafetySettings = {
  // Daily check-in
  dailyCheckInEnabled: boolean;
  dailyCheckInTime: string; // HH:mm format, default "10:00"
  gracePeriodMinutes: number; // default 60

  // Escalation
  escalationEnabled: boolean;
  escalationOrder: EscalationOrder[];

  // Location sharing
  shareLocationOnSOS: boolean;
  shareLocationOnMissedCheckIn: boolean;

  // Check-in tracking
  lastCheckInAt: string | null; // ISO timestamp
  lastMissedCheckInAt: string | null; // ISO timestamp

  // Notification state
  checkInNotificationId: string | null;
  gracePeriodNotificationId: string | null;
};

// ============================================
// EMERGENCY CONTACT (Extended)
// ============================================

export type SafetyContact = {
  id: string;
  name: string;
  relationship?: string;
  phoneNumber: string;
  countryCode?: string;
  isPrimary: boolean;
  canReceiveSMS: boolean;
  canReceiveWhatsApp: boolean;
  createdAt: string;
  updatedAt: string;
};

// ============================================
// CHECK-IN STATUS
// ============================================

export type CheckInStatus =
  | 'NOT_DUE'        // Before check-in time
  | 'DUE'            // Past check-in time, not yet checked in
  | 'CHECKED_IN'     // Successfully checked in today
  | 'MISSED'         // Missed (past grace period)
  | 'CHECKED_IN_LATE'; // Checked in after grace period

export type CheckInState = {
  status: CheckInStatus;
  checkInTime: string | null; // When user checked in (if they did)
  scheduledTime: string;      // When check-in was scheduled
  deadlineTime: string;       // End of grace period
  isOverdue: boolean;
};

// ============================================
// SOS STATE
// ============================================

export type SOSState = {
  isTriggered: boolean;
  triggeredAt: string | null;
  location: {
    lat: number;
    lng: number;
    accuracy: number | null;
  } | null;
  contactsToNotify: SafetyContact[];
};

// ============================================
// PERMISSION STATE
// ============================================

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

export type SafetyPermissions = {
  location: PermissionStatus;
  notifications: PermissionStatus;
};

// ============================================
// DEFAULT VALUES
// ============================================

export const DEFAULT_SAFETY_SETTINGS: SafetySettings = {
  dailyCheckInEnabled: false,
  dailyCheckInTime: '10:00',
  gracePeriodMinutes: 60,
  escalationEnabled: true,
  escalationOrder: ['PRIMARY_CONTACT', 'ALL_CONTACTS'],
  shareLocationOnSOS: true,
  shareLocationOnMissedCheckIn: false,
  lastCheckInAt: null,
  lastMissedCheckInAt: null,
  checkInNotificationId: null,
  gracePeriodNotificationId: null,
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function createSafetyEvent(
  type: SafetyEventType,
  userId: string = 'guest',
  metadata: SafetyEventMetadata = {}
): SafetyEvent {
  return {
    id: generateId(),
    type,
    userId,
    timestamp: new Date().toISOString(),
    metadata,
  };
}

export function createSafetyContact(
  data: Omit<SafetyContact, 'id' | 'createdAt' | 'updatedAt'>
): SafetyContact {
  const now = new Date().toISOString();
  return {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };
}

// ============================================
// SMS TEMPLATES
// ============================================

export const SMS_TEMPLATES = {
  SOS_WITH_LOCATION: (name: string, mapsLink: string) =>
    `SOS: ${name} needs help. Please contact them immediately. Location: ${mapsLink}`,

  SOS_WITHOUT_LOCATION: (name: string) =>
    `SOS: ${name} needs help. Please contact them immediately.`,

  MISSED_CHECKIN_WITH_LOCATION: (name: string, mapsLink: string) =>
    `Alert: ${name} missed their daily check-in today. Please reach out. Last known location: ${mapsLink}`,

  MISSED_CHECKIN_WITHOUT_LOCATION: (name: string) =>
    `Alert: ${name} missed their daily check-in today. Please reach out.`,

  TEST_ALERT: (name: string) =>
    `This is a test alert from ${name}'s CareBow safety system. No action needed.`,
} as const;

// ============================================
// LOCATION HELPERS
// ============================================

export function createGoogleMapsLink(lat: number, lng: number): string {
  return `https://maps.google.com/?q=${lat},${lng}`;
}

export function formatLocationForSMS(location: { lat: number; lng: number } | null): string {
  if (!location) return '';
  return createGoogleMapsLink(location.lat, location.lng);
}
