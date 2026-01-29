/**
 * Episode Title Generator
 * Generates human-readable titles from symptom descriptions
 */

import { AgeGroup, ForWhom } from '../types/episode';

interface TitlePattern {
  keywords: string[];
  title: string;
}

/**
 * Keyword patterns for auto-generating episode titles
 * Order matters - more specific patterns should come first
 */
const TITLE_PATTERNS: TitlePattern[] = [
  // Skin conditions
  { keywords: ['rash', 'hives', 'itchy skin', 'skin rash'], title: 'Rash / Skin concern' },
  { keywords: ['acne', 'pimple', 'breakout'], title: 'Skin breakout' },
  { keywords: ['burn', 'sunburn'], title: 'Burn' },
  { keywords: ['cut', 'wound', 'bleeding'], title: 'Wound / Cut' },
  { keywords: ['bruise', 'swelling'], title: 'Bruise / Swelling' },

  // Respiratory
  { keywords: ['cough', 'coughing'], title: 'Cough' },
  { keywords: ['cold', 'runny nose', 'stuffy nose', 'congestion'], title: 'Cold symptoms' },
  { keywords: ['sore throat', 'throat pain', 'strep'], title: 'Sore throat' },
  { keywords: ['breathing', 'breathless', 'short of breath', 'asthma'], title: 'Breathing difficulty' },
  { keywords: ['chest pain', 'chest tight'], title: 'Chest discomfort' },

  // Fever & General
  { keywords: ['fever', 'temperature', 'chills'], title: 'Fever' },
  { keywords: ['flu', 'body ache', 'fatigue', 'tired', 'weak'], title: 'Flu-like symptoms' },

  // Digestive
  { keywords: ['stomach', 'belly', 'abdominal'], title: 'Stomach pain' },
  { keywords: ['nausea', 'vomiting', 'throwing up'], title: 'Nausea / Vomiting' },
  { keywords: ['diarrhea', 'loose stool', 'bowel'], title: 'Digestive issue' },
  { keywords: ['constipation', 'bloating', 'gas'], title: 'Digestive discomfort' },
  { keywords: ['heartburn', 'acid reflux', 'indigestion'], title: 'Heartburn / Reflux' },

  // Head & Neurological
  { keywords: ['headache', 'head pain', 'migraine'], title: 'Headache' },
  { keywords: ['dizzy', 'dizziness', 'vertigo', 'lightheaded'], title: 'Dizziness' },

  // Eyes, Ears, Nose
  { keywords: ['eye', 'vision', 'blurry'], title: 'Eye concern' },
  { keywords: ['ear', 'hearing', 'earache'], title: 'Ear pain' },
  { keywords: ['allergy', 'allergic', 'sneezing'], title: 'Allergy symptoms' },

  // Musculoskeletal
  { keywords: ['back pain', 'lower back', 'spine'], title: 'Back pain' },
  { keywords: ['neck pain', 'stiff neck'], title: 'Neck pain' },
  { keywords: ['knee', 'joint', 'arthritis'], title: 'Joint pain' },
  { keywords: ['muscle', 'cramp', 'sprain', 'strain'], title: 'Muscle pain' },
  { keywords: ['ankle', 'foot', 'toe'], title: 'Foot / Ankle issue' },
  { keywords: ['arm', 'shoulder', 'elbow', 'wrist', 'hand'], title: 'Arm / Hand pain' },

  // Mental Health
  { keywords: ['anxiety', 'anxious', 'panic', 'nervous'], title: 'Anxiety' },
  { keywords: ['stress', 'stressed', 'overwhelmed'], title: 'Stress' },
  { keywords: ['sleep', 'insomnia', 'cant sleep'], title: 'Sleep issues' },
  { keywords: ['depress', 'sad', 'down', 'mood'], title: 'Mood concern' },

  // Urinary
  { keywords: ['urin', 'pee', 'bladder', 'uti'], title: 'Urinary concern' },

  // Other specific
  { keywords: ['blood pressure', 'bp', 'hypertension'], title: 'Blood pressure' },
  { keywords: ['diabetes', 'blood sugar', 'glucose'], title: 'Blood sugar' },
  { keywords: ['tooth', 'dental', 'gum'], title: 'Dental issue' },
  { keywords: ['period', 'menstrual', 'cramp'], title: 'Menstrual concern' },
  { keywords: ['pregnant', 'pregnancy'], title: 'Pregnancy question' },

  // Generic pain
  { keywords: ['pain', 'ache', 'hurt', 'sore'], title: 'Pain' },
];

/**
 * Generate episode title from symptom text
 */
export function generateEpisodeTitle(
  symptomText: string,
  forWhom: ForWhom,
  ageGroup?: AgeGroup,
  relationship?: string
): string {
  const lowerText = symptomText.toLowerCase();

  // Find matching pattern
  let baseTitle = 'Health concern';
  for (const pattern of TITLE_PATTERNS) {
    const hasMatch = pattern.keywords.some((keyword) => lowerText.includes(keyword));
    if (hasMatch) {
      baseTitle = pattern.title;
      break;
    }
  }

  // Add prefix for family members
  if (forWhom === 'family') {
    const prefix = getAgePrefix(ageGroup, relationship);
    if (prefix) {
      return `${prefix}: ${baseTitle}`;
    }
  }

  return baseTitle;
}

/**
 * Get prefix based on age group or relationship
 */
function getAgePrefix(ageGroup?: AgeGroup, relationship?: string): string | null {
  // Check age group first
  if (ageGroup === 'child') {
    return 'Child';
  }
  if (ageGroup === 'senior') {
    return 'Senior';
  }

  // Fall back to relationship
  if (relationship) {
    const lower = relationship.toLowerCase();
    if (lower === 'child' || lower === 'son' || lower === 'daughter') {
      return 'Child';
    }
    if (lower === 'father' || lower === 'mother' || lower === 'parent') {
      return 'Parent';
    }
    if (lower === 'spouse' || lower === 'partner') {
      return 'Spouse';
    }
    // Capitalize first letter
    return relationship.charAt(0).toUpperCase() + relationship.slice(1);
  }

  return null;
}

/**
 * Determine age group from age number
 */
export function getAgeGroupFromAge(age: number | string | undefined): AgeGroup | undefined {
  if (!age) return undefined;

  const numAge = typeof age === 'string' ? parseInt(age, 10) : age;
  if (isNaN(numAge)) return undefined;

  if (numAge < 18) return 'child';
  if (numAge >= 60) return 'senior';
  return 'adult';
}
