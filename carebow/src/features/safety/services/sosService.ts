/**
 * SOS Service
 * Handles emergency SOS actions and contact communication
 */

import { Linking, Platform } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { SafetyContact, SMS_TEMPLATES, createGoogleMapsLink } from '../types';
import { LocationData, getLocationWithFallback } from './locationService';

// ============================================
// TYPES
// ============================================

export type SOSAction = 'CALL_PRIMARY' | 'CALL_911' | 'SMS_PRIMARY' | 'SMS_ALL';

export type SOSResult = {
  success: boolean;
  action: SOSAction;
  error?: string;
};

// ============================================
// HAPTIC FEEDBACK
// ============================================

export async function triggerSOSHaptic(): Promise<void> {
  try {
    // Strong haptic feedback for SOS
    ReactNativeHapticFeedback.trigger('notificationWarning');
  } catch (error) {
    // Haptics may not be available on all devices
    console.log('Haptics not available');
  }
}

export async function triggerSuccessHaptic(): Promise<void> {
  try {
    ReactNativeHapticFeedback.trigger('notificationSuccess');
  } catch (error) {
    console.log('Haptics not available');
  }
}

export async function triggerLightHaptic(): Promise<void> {
  try {
    await ReactNativeHapticFeedback.trigger('impactLight');
  } catch (error) {
    console.log('Haptics not available');
  }
}

// ============================================
// PHONE ACTIONS
// ============================================

/**
 * Open phone dialer with a number
 */
export async function openPhoneDialer(phoneNumber: string): Promise<boolean> {
  const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
  const url = `tel:${cleanNumber}`;

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to open phone dialer:', error);
    return false;
  }
}

/**
 * Call emergency services (911 in US)
 */
export async function callEmergencyServices(): Promise<boolean> {
  // Note: In a production app, you'd want to detect the user's country
  // and use the appropriate emergency number
  return openPhoneDialer('911');
}

/**
 * Call the primary contact
 */
export async function callPrimaryContact(contact: SafetyContact): Promise<boolean> {
  return openPhoneDialer(contact.phoneNumber);
}

// ============================================
// SMS ACTIONS
// ============================================

/**
 * Open SMS composer with pre-filled message
 * Note: Cannot auto-send SMS in Expo/React Native without native modules
 */
export async function openSMSComposer(
  phoneNumbers: string[],
  message: string
): Promise<boolean> {
  if (phoneNumbers.length === 0) return false;

  // Clean phone numbers
  const cleanNumbers = phoneNumbers.map((n) => n.replace(/[^\d+]/g, ''));

  // Build SMS URL
  // iOS: sms:/open?addresses=xxx,yyy&body=message
  // Android: sms:xxx,yyy?body=message
  let url: string;

  if (Platform.OS === 'ios') {
    const addresses = cleanNumbers.join(',');
    const encodedBody = encodeURIComponent(message);
    url = `sms:/open?addresses=${addresses}&body=${encodedBody}`;
  } else {
    const addresses = cleanNumbers.join(',');
    const encodedBody = encodeURIComponent(message);
    url = `sms:${addresses}?body=${encodedBody}`;
  }

  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }

    // Fallback for single number
    if (cleanNumbers.length > 0) {
      const fallbackUrl =
        Platform.OS === 'ios'
          ? `sms:${cleanNumbers[0]}&body=${encodeURIComponent(message)}`
          : `sms:${cleanNumbers[0]}?body=${encodeURIComponent(message)}`;

      await Linking.openURL(fallbackUrl);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Failed to open SMS composer:', error);
    return false;
  }
}

/**
 * Generate SOS SMS message
 */
export function generateSOSMessage(
  userName: string,
  location: LocationData | null,
  includeLocation: boolean
): string {
  if (includeLocation && location) {
    const mapsLink = createGoogleMapsLink(location.lat, location.lng);
    return SMS_TEMPLATES.SOS_WITH_LOCATION(userName, mapsLink);
  }
  return SMS_TEMPLATES.SOS_WITHOUT_LOCATION(userName);
}

/**
 * Generate missed check-in message
 */
export function generateMissedCheckInMessage(
  userName: string,
  location: LocationData | null,
  includeLocation: boolean
): string {
  if (includeLocation && location) {
    const mapsLink = createGoogleMapsLink(location.lat, location.lng);
    return SMS_TEMPLATES.MISSED_CHECKIN_WITH_LOCATION(userName, mapsLink);
  }
  return SMS_TEMPLATES.MISSED_CHECKIN_WITHOUT_LOCATION(userName);
}

/**
 * Send SOS SMS to primary contact
 */
export async function sendSOSSMSToPrimary(
  contact: SafetyContact,
  userName: string,
  location: LocationData | null,
  includeLocation: boolean
): Promise<boolean> {
  const message = generateSOSMessage(userName, location, includeLocation);
  return openSMSComposer([contact.phoneNumber], message);
}

/**
 * Send SOS SMS to all contacts
 */
export async function sendSOSSMSToAll(
  contacts: SafetyContact[],
  userName: string,
  location: LocationData | null,
  includeLocation: boolean
): Promise<boolean> {
  const smsContacts = contacts.filter((c) => c.canReceiveSMS);
  if (smsContacts.length === 0) return false;

  const phoneNumbers = smsContacts.map((c) => c.phoneNumber);
  const message = generateSOSMessage(userName, location, includeLocation);

  return openSMSComposer(phoneNumbers, message);
}

/**
 * Send missed check-in alert to contacts
 */
export async function sendMissedCheckInAlert(
  contacts: SafetyContact[],
  userName: string,
  location: LocationData | null,
  includeLocation: boolean
): Promise<boolean> {
  const smsContacts = contacts.filter((c) => c.canReceiveSMS);
  if (smsContacts.length === 0) return false;

  const phoneNumbers = smsContacts.map((c) => c.phoneNumber);
  const message = generateMissedCheckInMessage(userName, location, includeLocation);

  return openSMSComposer(phoneNumbers, message);
}

// ============================================
// SOS FLOW ORCHESTRATION
// ============================================

export type SOSFlowConfig = {
  contacts: SafetyContact[];
  userName: string;
  shareLocation: boolean;
};

export type SOSFlowResult = {
  event: 'triggered';
  location: LocationData | null;
  locationError?: string;
};

/**
 * Execute the initial SOS trigger phase:
 * - Trigger haptic feedback
 * - Attempt to get location (non-blocking)
 * Returns location data for use in subsequent actions
 */
export async function executeSOSTrigger(
  config: SOSFlowConfig
): Promise<SOSFlowResult> {
  // Immediate haptic feedback
  await triggerSOSHaptic();

  let location: LocationData | null = null;
  let locationError: string | undefined;

  // Try to get location if sharing is enabled
  if (config.shareLocation) {
    const locationResult = await getLocationWithFallback(8000);
    if (locationResult.success) {
      location = locationResult.data;
    } else {
      locationError = locationResult.error;
    }
  }

  return {
    event: 'triggered',
    location,
    locationError,
  };
}

// ============================================
// PHONE NUMBER UTILITIES
// ============================================

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  // US format
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  // With country code
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  }

  // International or other format
  return phone;
}

/**
 * Basic phone number validation
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  // Accept 10-15 digit numbers
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Normalize phone number to E.164-ish format
 */
export function normalizePhoneNumber(phone: string, countryCode?: string): string {
  const cleaned = phone.replace(/\D/g, '');

  // If already has country code prefix
  if (phone.startsWith('+')) {
    return `+${cleaned}`;
  }

  // Add country code if provided
  if (countryCode) {
    const cleanCountry = countryCode.replace(/\D/g, '');
    return `+${cleanCountry}${cleaned}`;
  }

  // Default to US (+1) for 10-digit numbers
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }

  return cleaned;
}
