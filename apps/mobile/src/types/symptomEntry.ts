/**
 * Symptom Entry Types (PRD V1 Spec)
 * Types for simple symptom documentation and rule-based triage
 */

// ============================================
// DURATION OPTIONS
// ============================================

export type SymptomDuration =
  | 'just_started'    // Within last hour
  | 'hours'           // 1-24 hours
  | 'days'            // 1-7 days
  | 'weeks'           // 1-4 weeks
  | 'ongoing';        // More than a month

export const DURATION_LABELS: Record<SymptomDuration, string> = {
  just_started: 'Just Started (within the hour)',
  hours: 'A Few Hours',
  days: 'A Few Days',
  weeks: 'A Week or More',
  ongoing: 'Ongoing (more than a month)',
};

export const DURATION_ORDER: SymptomDuration[] = [
  'just_started',
  'hours',
  'days',
  'weeks',
  'ongoing',
];

// ============================================
// SEVERITY OPTIONS
// ============================================

export type SymptomSeverity = 'low' | 'medium' | 'high';

export const SEVERITY_LABELS: Record<SymptomSeverity, string> = {
  low: 'Mild - Noticeable but manageable',
  medium: 'Moderate - Affecting daily activities',
  high: 'Severe - Very distressing',
};

export const SEVERITY_COLORS: Record<SymptomSeverity, string> = {
  low: '#16A34A',      // Green
  medium: '#D97706',   // Amber
  high: '#DC2626',     // Red
};

// ============================================
// RISK LEVEL (TRIAGE OUTPUT)
// ============================================

export type RiskLevel = 'low' | 'medium' | 'high' | 'emergency';

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  low: 'Low Risk',
  medium: 'Medium Risk',
  high: 'High Risk',
  emergency: 'Emergency',
};

export const RISK_LEVEL_COLORS: Record<RiskLevel, { bg: string; text: string; border: string }> = {
  low: {
    bg: '#DCFCE7',
    text: '#16A34A',
    border: '#16A34A',
  },
  medium: {
    bg: '#FEF3C7',
    text: '#D97706',
    border: '#D97706',
  },
  high: {
    bg: '#FEE2E2',
    text: '#DC2626',
    border: '#DC2626',
  },
  emergency: {
    bg: '#DC2626',
    text: '#FFFFFF',
    border: '#DC2626',
  },
};

// ============================================
// CARE SUGGESTION (TRIAGE OUTPUT)
// ============================================

export type CareSuggestion = 'monitor' | 'doctor_visit' | 'urgent_care' | 'emergency';

export const CARE_SUGGESTION_LABELS: Record<CareSuggestion, string> = {
  monitor: 'Monitor at Home',
  doctor_visit: 'Schedule Doctor Visit',
  urgent_care: 'Visit Urgent Care',
  emergency: 'Seek Emergency Care',
};

export const CARE_SUGGESTION_DESCRIPTIONS: Record<CareSuggestion, string> = {
  monitor: 'Continue to monitor symptoms. If symptoms worsen or new symptoms develop, reassess.',
  doctor_visit: 'Schedule an appointment with your doctor within the next few days.',
  urgent_care: 'Consider visiting an urgent care center today or tomorrow.',
  emergency: 'Go to the emergency room or call emergency services immediately.',
};

// ============================================
// SYMPTOM ENTRY
// ============================================

export type SymptomEntry = {
  id: string;
  profileId: string;           // Family member profile ID
  profileName: string;         // Cached profile name for display
  profileRelationship: string; // Cached relationship for display
  description: string;         // Max 2000 characters
  duration: SymptomDuration;
  severity: SymptomSeverity;
  // Triage results
  riskLevel: RiskLevel;
  careSuggestion: CareSuggestion;
  triageReason: string;        // Explanation for the triage result
  emergencyKeywordsFound: string[]; // List of emergency keywords found
  // Timestamps
  createdAt: string;
  updatedAt: string;
};

// ============================================
// TRIAGE RESULT
// ============================================

export type TriageResult = {
  riskLevel: RiskLevel;
  careSuggestion: CareSuggestion;
  reason: string;
  emergencyKeywordsFound: string[];
  isEmergency: boolean;
};

// ============================================
// EMERGENCY KEYWORDS (PRD SPEC)
// ============================================

export const EMERGENCY_KEYWORDS: string[] = [
  // Cardiac
  'chest pain',
  'heart attack',
  'cardiac arrest',

  // Respiratory
  'difficulty breathing',
  'shortness of breath',
  "can't breathe",
  'choking',
  'drowning',

  // Neurological
  'stroke',
  'face drooping',
  'arm weakness',
  'slurred speech',
  'seizure',
  'convulsion',
  'unconscious',
  'passed out',
  'fainted',
  'unresponsive',

  // Trauma
  'severe bleeding',
  'heavy bleeding',
  'severe head injury',
  'head trauma',
  'severe burns',
  'electric shock',

  // Toxicology
  'overdose',
  'poisoning',

  // Allergic
  'severe allergic reaction',
  'anaphylaxis',
  "can't swallow",

  // Mental health crisis
  'suicidal',
  'suicide',
  'self-harm',
  'want to die',

  // Other critical
  'coughing blood',
  'vomiting blood',
  'severe abdominal pain',
  'sudden severe headache',
  'worst headache',
  'high fever infant',
  'newborn fever',
];

// ============================================
// DISCLAIMER
// ============================================

export const SYMPTOM_DISCLAIMER = {
  short: "This guidance doesn't replace medical professional advice.",
  full: "This information is for educational purposes only and is not intended to replace professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.",
  emergency: "If you are experiencing a medical emergency, call 911 (or your local emergency number) immediately. Do not delay seeking emergency care based on information from this app.",
};

// ============================================
// HELPERS
// ============================================

export function generateEntryId(): string {
  return `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function createEmptyEntry(profileId: string, profileName: string, profileRelationship: string): Omit<SymptomEntry, 'id' | 'riskLevel' | 'careSuggestion' | 'triageReason' | 'emergencyKeywordsFound' | 'createdAt' | 'updatedAt'> {
  return {
    profileId,
    profileName,
    profileRelationship,
    description: '',
    duration: 'hours',
    severity: 'medium',
  };
}
