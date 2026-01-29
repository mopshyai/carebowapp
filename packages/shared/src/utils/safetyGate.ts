import { TRIAGE_KEYWORDS, EMERGENCY_NUMBERS } from './constants';
import type { TriageLevel } from '../types';

export type SafetyCheckResult = {
  isEmergency: boolean;
  level: TriageLevel | null;
  matchedKeywords: string[];
  emergencyNumber: string;
};

/**
 * Checks user message for emergency keywords and returns triage level
 * This gate runs BEFORE AI processing to catch emergencies immediately
 */
export const checkSafety = (
  message: string,
  countryCode = 'US'
): SafetyCheckResult => {
  const lower = message.toLowerCase();

  // Check P1 (Emergency - Call ambulance immediately)
  const p1Matches = TRIAGE_KEYWORDS.P1.filter((k) => lower.includes(k));
  if (p1Matches.length > 0) {
    return {
      isEmergency: true,
      level: 'P1',
      matchedKeywords: p1Matches,
      emergencyNumber: EMERGENCY_NUMBERS[countryCode] || '911',
    };
  }

  // Check P2 (Urgent - Needs medical attention soon)
  const p2Matches = TRIAGE_KEYWORDS.P2.filter((k) => lower.includes(k));
  if (p2Matches.length > 0) {
    return {
      isEmergency: true,
      level: 'P2',
      matchedKeywords: p2Matches,
      emergencyNumber: EMERGENCY_NUMBERS[countryCode] || '911',
    };
  }

  return {
    isEmergency: false,
    level: null,
    matchedKeywords: [],
    emergencyNumber: EMERGENCY_NUMBERS[countryCode] || '911',
  };
};

/**
 * Get the emergency number for a country
 */
export const getEmergencyNumber = (countryCode: string): string => {
  return EMERGENCY_NUMBERS[countryCode] || '911';
};

/**
 * Get triage level display info
 */
export const getTriageLevelInfo = (level: TriageLevel) => {
  const info = {
    P1: {
      label: 'Emergency',
      description: 'Life-threatening - Call emergency services immediately',
      color: '#DC2626',
      bgColor: '#FEE2E2',
    },
    P2: {
      label: 'Urgent',
      description: 'Needs medical attention within hours',
      color: '#F97316',
      bgColor: '#FFEDD5',
    },
    P3: {
      label: 'Semi-Urgent',
      description: 'Needs attention within 24-48 hours',
      color: '#EAB308',
      bgColor: '#FEF3C7',
    },
    P4: {
      label: 'Non-Urgent',
      description: 'Can be scheduled for routine care',
      color: '#22C55E',
      bgColor: '#D1FAE5',
    },
  };
  return info[level];
};
