/**
 * Missing Info Detector Utility
 * Detects key missing information from health context to build trust
 */

import { HealthContext } from '../types/askCarebow';

/**
 * Key field that could be missing
 */
export type MissingField = {
  field: string;
  label: string;
  question: string;
};

/**
 * Priority order for missing fields (most important first)
 */
const FIELD_PRIORITY: MissingField[] = [
  {
    field: 'duration',
    label: 'Timeline',
    question: "I don't yet know when this started",
  },
  {
    field: 'severity',
    label: 'Severity',
    question: "I haven't asked about the severity level",
  },
  {
    field: 'fever',
    label: 'Fever status',
    question: "I don't yet know if there's a fever",
  },
  {
    field: 'frequency',
    label: 'Pattern',
    question: "I don't know if this is constant or comes and goes",
  },
  {
    field: 'associatedSymptoms',
    label: 'Other symptoms',
    question: "I haven't asked about other symptoms",
  },
  {
    field: 'medications',
    label: 'Medications',
    question: "I don't know what medications are being taken",
  },
  {
    field: 'allergies',
    label: 'Allergies',
    question: "I haven't checked for known allergies",
  },
];

/**
 * Check if fever-related keywords exist in the conversation
 */
function hasFeverInfo(context: HealthContext, conversationText?: string): boolean {
  const text = conversationText?.toLowerCase() || '';
  const symptomText = context.primarySymptom?.toLowerCase() || '';
  const associated = context.associatedSymptoms.join(' ').toLowerCase();

  const feverKeywords = ['fever', 'temperature', 'chills', 'hot', 'cold sweat', 'no fever'];

  return feverKeywords.some(
    (keyword) =>
      text.includes(keyword) ||
      symptomText.includes(keyword) ||
      associated.includes(keyword)
  );
}

/**
 * Detect the most important missing field from health context
 * Returns only ONE missing field (the highest priority one)
 *
 * @param context - The current health context
 * @param conversationText - Optional full conversation text for additional context
 * @returns The most important missing field, or null if all key info is present
 */
export function detectMissingInfo(
  context: HealthContext,
  conversationText?: string
): MissingField | null {
  // Check each field in priority order
  for (const field of FIELD_PRIORITY) {
    switch (field.field) {
      case 'duration':
        if (!context.duration) {
          return field;
        }
        break;

      case 'severity':
        if (context.severity === undefined || context.severity === null) {
          return field;
        }
        break;

      case 'fever':
        if (!hasFeverInfo(context, conversationText)) {
          return field;
        }
        break;

      case 'frequency':
        if (!context.frequency) {
          return field;
        }
        break;

      case 'associatedSymptoms':
        // Only flag if we have no associated symptoms AND haven't asked
        // This is less critical so we skip it if other important fields are present
        if (context.associatedSymptoms.length === 0 && context.duration && context.severity) {
          return field;
        }
        break;

      case 'medications':
        // Only relevant if we're at the point of giving guidance
        // Skip for now - less critical for initial triage
        break;

      case 'allergies':
        // Only relevant if we're recommending treatments
        // Skip for now - less critical for initial triage
        break;
    }
  }

  return null;
}

/**
 * Get a list of all missing key fields (up to maxItems)
 *
 * @param context - The current health context
 * @param maxItems - Maximum number of items to return
 * @param conversationText - Optional full conversation text
 * @returns Array of missing fields
 */
export function getAllMissingInfo(
  context: HealthContext,
  maxItems: number = 3,
  conversationText?: string
): MissingField[] {
  const missing: MissingField[] = [];

  for (const field of FIELD_PRIORITY) {
    if (missing.length >= maxItems) break;

    switch (field.field) {
      case 'duration':
        if (!context.duration) {
          missing.push(field);
        }
        break;

      case 'severity':
        if (context.severity === undefined || context.severity === null) {
          missing.push(field);
        }
        break;

      case 'fever':
        if (!hasFeverInfo(context, conversationText)) {
          missing.push(field);
        }
        break;

      case 'frequency':
        if (!context.frequency) {
          missing.push(field);
        }
        break;

      case 'associatedSymptoms':
        if (context.associatedSymptoms.length === 0) {
          missing.push(field);
        }
        break;
    }
  }

  return missing;
}

/**
 * Calculate data completeness percentage
 *
 * @param context - The current health context
 * @returns Percentage (0-100) of key fields that are filled
 */
export function calculateCompleteness(context: HealthContext): number {
  const keyFields = [
    context.primarySymptom,
    context.duration,
    context.severity,
    context.frequency,
    context.associatedSymptoms.length > 0,
  ];

  const filled = keyFields.filter(Boolean).length;
  return Math.round((filled / keyFields.length) * 100);
}
