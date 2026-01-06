/**
 * Safety Utilities Tests
 * Unit tests for check-in logic, formatting, and validation functions
 */

import {
  isCheckInDueToday,
  hasMissedDeadline,
  hasCheckedInToday,
  didCheckInLate,
  getCheckInState,
  parseTimeToToday,
  isSameLocalDay,
  formatDisplayTime,
  formatScheduledTime,
  isValidTimeFormat,
  isValidGracePeriod,
  getCheckInStatusMessage,
} from '../services/checkInService';

import {
  isValidPhoneNumber,
  normalizePhoneNumber,
  formatPhoneNumber,
  generateSOSMessage,
  generateMissedCheckInMessage,
} from '../services/sosService';

import {
  SMS_TEMPLATES,
  createGoogleMapsLink,
  formatLocationForSMS,
  DEFAULT_SAFETY_SETTINGS,
  createSafetyEvent,
  createSafetyContact,
} from '../types';

// ============================================
// CHECK-IN SERVICE TESTS
// ============================================

describe('Check-in Service', () => {
  describe('isCheckInDueToday', () => {
    it('returns false when check-in is disabled', () => {
      const settings = { ...DEFAULT_SAFETY_SETTINGS, dailyCheckInEnabled: false };
      expect(isCheckInDueToday(settings)).toBe(false);
    });

    it('returns true when past scheduled time', () => {
      // Set scheduled time to 1 hour ago
      const pastTime = new Date();
      pastTime.setHours(pastTime.getHours() - 1);
      const timeString = `${pastTime.getHours().toString().padStart(2, '0')}:00`;

      const settings = {
        ...DEFAULT_SAFETY_SETTINGS,
        dailyCheckInEnabled: true,
        dailyCheckInTime: timeString,
      };

      expect(isCheckInDueToday(settings)).toBe(true);
    });

    it('returns false when before scheduled time', () => {
      // Set scheduled time to 23:59
      const settings = {
        ...DEFAULT_SAFETY_SETTINGS,
        dailyCheckInEnabled: true,
        dailyCheckInTime: '23:59',
      };

      const now = new Date();
      if (now.getHours() < 23 || (now.getHours() === 23 && now.getMinutes() < 59)) {
        expect(isCheckInDueToday(settings)).toBe(false);
      }
    });
  });

  describe('hasMissedDeadline', () => {
    it('returns false when check-in is disabled', () => {
      const settings = { ...DEFAULT_SAFETY_SETTINGS, dailyCheckInEnabled: false };
      expect(hasMissedDeadline(settings)).toBe(false);
    });

    it('returns false when already checked in today', () => {
      const now = new Date();
      const settings = {
        ...DEFAULT_SAFETY_SETTINGS,
        dailyCheckInEnabled: true,
        dailyCheckInTime: '00:00',
        gracePeriodMinutes: 60,
        lastCheckInAt: now.toISOString(),
      };

      expect(hasMissedDeadline(settings)).toBe(false);
    });
  });

  describe('hasCheckedInToday', () => {
    it('returns false when lastCheckInAt is null', () => {
      const settings = { ...DEFAULT_SAFETY_SETTINGS, lastCheckInAt: null };
      expect(hasCheckedInToday(settings)).toBe(false);
    });

    it('returns true when checked in today', () => {
      const now = new Date();
      const settings = {
        ...DEFAULT_SAFETY_SETTINGS,
        lastCheckInAt: now.toISOString(),
      };

      expect(hasCheckedInToday(settings)).toBe(true);
    });

    it('returns false when checked in yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const settings = {
        ...DEFAULT_SAFETY_SETTINGS,
        lastCheckInAt: yesterday.toISOString(),
      };

      expect(hasCheckedInToday(settings)).toBe(false);
    });
  });

  describe('isSameLocalDay', () => {
    it('returns true for same day', () => {
      const date1 = new Date(2024, 0, 15, 10, 0);
      const date2 = new Date(2024, 0, 15, 23, 59);
      expect(isSameLocalDay(date1, date2)).toBe(true);
    });

    it('returns false for different days', () => {
      const date1 = new Date(2024, 0, 15, 10, 0);
      const date2 = new Date(2024, 0, 16, 10, 0);
      expect(isSameLocalDay(date1, date2)).toBe(false);
    });
  });

  describe('formatDisplayTime', () => {
    it('formats morning time correctly', () => {
      const date = new Date(2024, 0, 15, 9, 30);
      const result = formatDisplayTime(date);
      expect(result).toMatch(/9:30\s*AM/i);
    });

    it('formats afternoon time correctly', () => {
      const date = new Date(2024, 0, 15, 14, 45);
      const result = formatDisplayTime(date);
      expect(result).toMatch(/2:45\s*PM/i);
    });
  });

  describe('formatScheduledTime', () => {
    it('formats HH:mm to display format', () => {
      const result = formatScheduledTime('10:00');
      expect(result).toMatch(/10:00\s*AM/i);
    });

    it('formats afternoon time', () => {
      const result = formatScheduledTime('14:30');
      expect(result).toMatch(/2:30\s*PM/i);
    });
  });

  describe('isValidTimeFormat', () => {
    it('accepts valid time formats', () => {
      expect(isValidTimeFormat('00:00')).toBe(true);
      expect(isValidTimeFormat('10:30')).toBe(true);
      expect(isValidTimeFormat('23:59')).toBe(true);
      expect(isValidTimeFormat('9:00')).toBe(true);
    });

    it('rejects invalid time formats', () => {
      expect(isValidTimeFormat('25:00')).toBe(false);
      expect(isValidTimeFormat('10:60')).toBe(false);
      expect(isValidTimeFormat('abc')).toBe(false);
      expect(isValidTimeFormat('')).toBe(false);
    });
  });

  describe('isValidGracePeriod', () => {
    it('accepts valid grace periods', () => {
      expect(isValidGracePeriod(30)).toBe(true);
      expect(isValidGracePeriod(60)).toBe(true);
      expect(isValidGracePeriod(1440)).toBe(true); // 24 hours
    });

    it('rejects invalid grace periods', () => {
      expect(isValidGracePeriod(0)).toBe(false);
      expect(isValidGracePeriod(-1)).toBe(false);
      expect(isValidGracePeriod(1441)).toBe(false); // > 24 hours
    });
  });

  describe('getCheckInStatusMessage', () => {
    it('returns correct message for checked in status', () => {
      const state = {
        status: 'CHECKED_IN' as const,
        checkInTime: new Date().toISOString(),
        scheduledTime: new Date().toISOString(),
        deadlineTime: new Date().toISOString(),
        isOverdue: false,
      };

      const message = getCheckInStatusMessage(state);
      expect(message).toContain('Checked in');
      expect(message).toContain('✓');
    });

    it('returns correct message for missed status', () => {
      const state = {
        status: 'MISSED' as const,
        checkInTime: null,
        scheduledTime: new Date().toISOString(),
        deadlineTime: new Date().toISOString(),
        isOverdue: true,
      };

      const message = getCheckInStatusMessage(state);
      expect(message).toContain('Missed');
    });
  });
});

// ============================================
// SOS SERVICE TESTS
// ============================================

describe('SOS Service', () => {
  describe('isValidPhoneNumber', () => {
    it('accepts valid phone numbers', () => {
      expect(isValidPhoneNumber('5551234567')).toBe(true);
      expect(isValidPhoneNumber('(555) 123-4567')).toBe(true);
      expect(isValidPhoneNumber('+1 555 123 4567')).toBe(true);
      expect(isValidPhoneNumber('+44 20 7946 0958')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(isValidPhoneNumber('123')).toBe(false);
      expect(isValidPhoneNumber('abc')).toBe(false);
      expect(isValidPhoneNumber('')).toBe(false);
    });
  });

  describe('normalizePhoneNumber', () => {
    it('normalizes US numbers', () => {
      expect(normalizePhoneNumber('5551234567')).toBe('+15551234567');
      expect(normalizePhoneNumber('(555) 123-4567')).toBe('+15551234567');
    });

    it('keeps country code if already present', () => {
      expect(normalizePhoneNumber('+15551234567')).toBe('+15551234567');
    });

    it('adds country code when provided', () => {
      expect(normalizePhoneNumber('7946 0958', '+44')).toBe('+4479460958');
    });
  });

  describe('formatPhoneNumber', () => {
    it('formats US numbers correctly', () => {
      expect(formatPhoneNumber('5551234567')).toBe('(555) 123-4567');
    });

    it('formats with country code', () => {
      expect(formatPhoneNumber('15551234567')).toBe('+1 (555) 123-4567');
    });
  });

  describe('generateSOSMessage', () => {
    it('generates message without location', () => {
      const message = generateSOSMessage('John', null, false);
      expect(message).toContain('SOS');
      expect(message).toContain('John');
      expect(message).not.toContain('maps.google.com');
    });

    it('generates message with location', () => {
      const location = { lat: 40.7128, lng: -74.006, accuracy: 10, timestamp: Date.now() };
      const message = generateSOSMessage('John', location, true);
      expect(message).toContain('SOS');
      expect(message).toContain('John');
      expect(message).toContain('maps.google.com');
    });
  });

  describe('generateMissedCheckInMessage', () => {
    it('generates message without location', () => {
      const message = generateMissedCheckInMessage('Jane', null, false);
      expect(message).toContain('missed');
      expect(message).toContain('Jane');
      expect(message).not.toContain('maps.google.com');
    });

    it('generates message with location', () => {
      const location = { lat: 40.7128, lng: -74.006, accuracy: 10, timestamp: Date.now() };
      const message = generateMissedCheckInMessage('Jane', location, true);
      expect(message).toContain('missed');
      expect(message).toContain('Jane');
      expect(message).toContain('maps.google.com');
    });
  });
});

// ============================================
// TYPES/HELPERS TESTS
// ============================================

describe('Safety Types', () => {
  describe('SMS_TEMPLATES', () => {
    it('generates SOS message with location', () => {
      const message = SMS_TEMPLATES.SOS_WITH_LOCATION('John', 'https://maps.google.com/?q=1,2');
      expect(message).toContain('SOS');
      expect(message).toContain('John');
      expect(message).toContain('https://maps.google.com');
    });

    it('generates SOS message without location', () => {
      const message = SMS_TEMPLATES.SOS_WITHOUT_LOCATION('John');
      expect(message).toContain('SOS');
      expect(message).toContain('John');
      expect(message).toContain('immediately');
    });

    it('generates missed check-in message', () => {
      const message = SMS_TEMPLATES.MISSED_CHECKIN_WITHOUT_LOCATION('Jane');
      expect(message).toContain('missed');
      expect(message).toContain('Jane');
    });

    it('generates test alert message', () => {
      const message = SMS_TEMPLATES.TEST_ALERT('John');
      expect(message).toContain('test');
      expect(message).toContain('John');
      expect(message).toContain('No action needed');
    });
  });

  describe('createGoogleMapsLink', () => {
    it('creates correct maps link', () => {
      const link = createGoogleMapsLink(40.7128, -74.006);
      expect(link).toBe('https://maps.google.com/?q=40.7128,-74.006');
    });
  });

  describe('formatLocationForSMS', () => {
    it('returns empty string for null location', () => {
      expect(formatLocationForSMS(null)).toBe('');
    });

    it('returns maps link for valid location', () => {
      const result = formatLocationForSMS({ lat: 40.7128, lng: -74.006 });
      expect(result).toContain('maps.google.com');
    });
  });

  describe('createSafetyEvent', () => {
    it('creates event with correct type', () => {
      const event = createSafetyEvent('SOS_TRIGGERED', 'user123', { note: 'test' });
      expect(event.type).toBe('SOS_TRIGGERED');
      expect(event.userId).toBe('user123');
      expect(event.metadata.note).toBe('test');
      expect(event.id).toBeTruthy();
      expect(event.timestamp).toBeTruthy();
    });

    it('creates event with default user', () => {
      const event = createSafetyEvent('CHECKIN_CONFIRMED');
      expect(event.userId).toBe('guest');
    });
  });

  describe('createSafetyContact', () => {
    it('creates contact with timestamps', () => {
      const contact = createSafetyContact({
        name: 'John Doe',
        phoneNumber: '+15551234567',
        isPrimary: true,
        canReceiveSMS: true,
        canReceiveWhatsApp: false,
      });

      expect(contact.name).toBe('John Doe');
      expect(contact.phoneNumber).toBe('+15551234567');
      expect(contact.isPrimary).toBe(true);
      expect(contact.id).toBeTruthy();
      expect(contact.createdAt).toBeTruthy();
      expect(contact.updatedAt).toBeTruthy();
    });
  });

  describe('DEFAULT_SAFETY_SETTINGS', () => {
    it('has correct default values', () => {
      expect(DEFAULT_SAFETY_SETTINGS.dailyCheckInEnabled).toBe(false);
      expect(DEFAULT_SAFETY_SETTINGS.dailyCheckInTime).toBe('10:00');
      expect(DEFAULT_SAFETY_SETTINGS.gracePeriodMinutes).toBe(60);
      expect(DEFAULT_SAFETY_SETTINGS.shareLocationOnSOS).toBe(true);
      expect(DEFAULT_SAFETY_SETTINGS.shareLocationOnMissedCheckIn).toBe(false);
      expect(DEFAULT_SAFETY_SETTINGS.escalationEnabled).toBe(true);
    });
  });
});
