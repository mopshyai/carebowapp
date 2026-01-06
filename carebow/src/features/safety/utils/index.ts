/**
 * Safety Utils Barrel Export
 */

// Export from services for convenience
export {
  isCheckInDueToday,
  hasMissedDeadline,
  hasCheckedInToday,
  didCheckInLate,
  getCheckInState,
  getCheckInStatusMessage,
  parseTimeToToday,
  isSameLocalDay,
  formatDisplayTime,
  formatScheduledTime,
  isValidTimeFormat,
  isValidGracePeriod,
  shouldPromptMissedCheckIn,
  alreadyRecordedMissedCheckIn,
} from '../services/checkInService';

export {
  isValidPhoneNumber,
  normalizePhoneNumber,
  formatPhoneNumber,
  generateSOSMessage,
  generateMissedCheckInMessage,
} from '../services/sosService';

export {
  createGoogleMapsLink,
  formatLocationForSMS,
} from '../types';
