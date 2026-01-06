/**
 * Ask CareBow Follow-Up Questions
 * Doctor-grade dynamic question generation based on health context
 *
 * Features:
 * - OPQRST pain assessment template (clinical standard)
 * - Symptom-specific question flows (GI, headache, fever, respiratory)
 * - Age-appropriate questioning
 * - Context-aware question selection
 */

import {
  FollowUpQuestion,
  FollowUpQuestionType,
  HealthContext,
  QuickOption,
  Duration,
  Severity,
  Frequency,
  AgeGroup,
  durationLabels,
  frequencyLabels,
} from '@/types/askCarebow';

// ============================================
// SYMPTOM CATEGORY DETECTION
// ============================================

export type SymptomCategory =
  | 'pain'           // Any pain complaint
  | 'gi'             // Gastrointestinal
  | 'headache'       // Headache-specific
  | 'fever'          // Fever/infection
  | 'respiratory'    // Breathing/cough
  | 'skin'           // Rash, itching
  | 'musculoskeletal' // Joint/muscle
  | 'neurological'   // Dizziness, numbness
  | 'general';       // Default

/**
 * Detects the symptom category from primary symptom text
 */
export function detectSymptomCategory(primarySymptom: string): SymptomCategory {
  const symptom = primarySymptom.toLowerCase();

  // Headache is specific enough to have its own flow
  if (/headache|head\s*(pain|ache)|migraine/.test(symptom)) {
    return 'headache';
  }

  // GI symptoms
  if (/stomach|abdominal|abdomen|belly|nausea|vomit|diarrhea|constipat|indigestion|heartburn|bloat/.test(symptom)) {
    return 'gi';
  }

  // Fever/infection
  if (/fever|temperature|chills|flu|cold|infection/.test(symptom)) {
    return 'fever';
  }

  // Respiratory
  if (/cough|breath|wheez|congest|sinus|throat|chest\s*(tight|congest)/.test(symptom)) {
    return 'respiratory';
  }

  // Skin
  if (/rash|itch|hive|skin|bump|swelling|bite/.test(symptom)) {
    return 'skin';
  }

  // Musculoskeletal
  if (/back|neck|joint|muscle|knee|shoulder|hip|ankle|wrist|sprain|strain/.test(symptom)) {
    return 'musculoskeletal';
  }

  // Neurological
  if (/dizz|vertigo|numb|tingl|weak|faint|balance/.test(symptom)) {
    return 'neurological';
  }

  // Any pain mentioned
  if (/pain|ache|hurt|sore|throb|sharp|stab|cramp/.test(symptom)) {
    return 'pain';
  }

  return 'general';
}

// ============================================
// OPQRST PAIN ASSESSMENT
// ============================================

/**
 * OPQRST is the clinical standard for pain assessment:
 * O - Onset: When did it start? Sudden or gradual?
 * P - Provocation/Palliation: What makes it better/worse?
 * Q - Quality: Sharp, dull, burning, cramping, throbbing?
 * R - Radiation: Does it spread anywhere?
 * S - Severity: 0-10 scale
 * T - Time/Timing: Constant, intermittent, worse at certain times?
 */

export type OPQRSTQuestion =
  | 'onset'
  | 'provocation'
  | 'palliation'
  | 'quality'
  | 'radiation'
  | 'severity'
  | 'timing';

export const OPQRST_QUESTIONS: Record<OPQRSTQuestion, {
  question: string;
  explanation: string;
  quickOptions?: QuickOption[];
}> = {
  onset: {
    question: 'When did this pain start? Was it sudden or did it come on gradually?',
    explanation: 'Understanding the onset helps identify the cause',
    quickOptions: [
      { id: 'sudden', label: 'Sudden', value: 'sudden onset' },
      { id: 'gradual', label: 'Gradual', value: 'gradual onset' },
      { id: 'woke_up', label: 'Woke up with it', value: 'woke up with pain' },
      { id: 'after_activity', label: 'After activity', value: 'started after activity' },
    ],
  },
  provocation: {
    question: 'What makes the pain worse?',
    explanation: 'Knowing triggers helps narrow down the cause',
    quickOptions: [
      { id: 'movement', label: 'Movement', value: 'worse with movement' },
      { id: 'pressure', label: 'Pressure/touch', value: 'worse with pressure' },
      { id: 'breathing', label: 'Deep breathing', value: 'worse with breathing' },
      { id: 'eating', label: 'Eating', value: 'worse after eating' },
      { id: 'nothing', label: 'Nothing specific', value: 'no specific trigger' },
    ],
  },
  palliation: {
    question: 'What makes the pain better, if anything?',
    explanation: 'Relief patterns help with recommendations',
    quickOptions: [
      { id: 'rest', label: 'Rest', value: 'better with rest' },
      { id: 'medication', label: 'Medication', value: 'better with medication' },
      { id: 'position', label: 'Certain position', value: 'better in certain position' },
      { id: 'heat_cold', label: 'Heat/cold', value: 'better with heat or cold' },
      { id: 'nothing', label: 'Nothing helps', value: 'nothing provides relief' },
    ],
  },
  quality: {
    question: 'How would you describe the pain?',
    explanation: 'The type of pain gives important clues',
    quickOptions: [
      { id: 'sharp', label: 'Sharp/stabbing', value: 'sharp stabbing pain' },
      { id: 'dull', label: 'Dull/aching', value: 'dull aching pain' },
      { id: 'burning', label: 'Burning', value: 'burning pain' },
      { id: 'throbbing', label: 'Throbbing/pulsing', value: 'throbbing pain' },
      { id: 'cramping', label: 'Cramping', value: 'cramping pain' },
      { id: 'pressure', label: 'Pressure/squeezing', value: 'pressure or squeezing' },
    ],
  },
  radiation: {
    question: 'Does the pain spread or radiate to other areas?',
    explanation: 'Radiation patterns are diagnostically important',
    quickOptions: [
      { id: 'no', label: 'Stays in one place', value: 'localized pain' },
      { id: 'nearby', label: 'Spreads nearby', value: 'radiates to nearby area' },
      { id: 'down_limb', label: 'Down arm/leg', value: 'radiates down limb' },
      { id: 'back', label: 'To the back', value: 'radiates to back' },
    ],
  },
  severity: {
    question: 'On a scale of 0-10, how severe is the pain right now? (0 = no pain, 10 = worst imaginable)',
    explanation: 'This helps assess urgency',
    quickOptions: [
      { id: 'mild', label: '1-3 (Mild)', value: '3' },
      { id: 'moderate', label: '4-6 (Moderate)', value: '5' },
      { id: 'severe', label: '7-8 (Severe)', value: '8' },
      { id: 'very_severe', label: '9-10 (Very severe)', value: '10' },
    ],
  },
  timing: {
    question: 'Is the pain constant, or does it come and go?',
    explanation: 'Pain pattern helps identify the cause',
    quickOptions: [
      { id: 'constant', label: 'Constant', value: 'constant pain' },
      { id: 'comes_goes', label: 'Comes and goes', value: 'intermittent pain' },
      { id: 'worse_time', label: 'Worse at certain times', value: 'worse at certain times' },
      { id: 'worsening', label: 'Getting worse', value: 'progressively worsening' },
    ],
  },
};

// ============================================
// SYMPTOM-SPECIFIC QUESTION TEMPLATES
// ============================================

export type SymptomSpecificQuestion = {
  id: string;
  question: string;
  explanation?: string;
  quickOptions?: QuickOption[];
  contextKey: keyof HealthContext;
  isRequired?: boolean;
  condition?: (context: HealthContext) => boolean;
};

/**
 * GI (Gastrointestinal) symptom questions
 */
export const GI_QUESTIONS: SymptomSpecificQuestion[] = [
  {
    id: 'gi_vomiting',
    question: 'Are you experiencing any vomiting?',
    quickOptions: [
      { id: 'no', label: 'No vomiting', value: 'no vomiting' },
      { id: 'once', label: 'Once or twice', value: 'vomited once or twice' },
      { id: 'multiple', label: 'Multiple times', value: 'vomiting multiple times' },
      { id: 'blood', label: 'Vomiting blood', value: 'vomiting blood' },
    ],
    contextKey: 'associatedSymptoms',
    isRequired: true,
  },
  {
    id: 'gi_diarrhea',
    question: 'Any diarrhea or changes in bowel movements?',
    quickOptions: [
      { id: 'no', label: 'No changes', value: 'normal bowel movements' },
      { id: 'diarrhea', label: 'Diarrhea', value: 'diarrhea' },
      { id: 'constipation', label: 'Constipation', value: 'constipation' },
      { id: 'blood', label: 'Blood in stool', value: 'blood in stool' },
    ],
    contextKey: 'associatedSymptoms',
    isRequired: true,
  },
  {
    id: 'gi_last_bm',
    question: 'When was your last bowel movement?',
    quickOptions: [
      { id: 'today', label: 'Today', value: 'bowel movement today' },
      { id: 'yesterday', label: 'Yesterday', value: 'bowel movement yesterday' },
      { id: '2_3_days', label: '2-3 days ago', value: 'no bowel movement 2-3 days' },
      { id: 'longer', label: 'More than 3 days', value: 'no bowel movement 3+ days' },
    ],
    contextKey: 'additionalNotes',
  },
  {
    id: 'gi_food_exposure',
    question: 'Have you eaten anything unusual or possibly spoiled recently?',
    quickOptions: [
      { id: 'no', label: 'No', value: 'no unusual food' },
      { id: 'restaurant', label: 'Restaurant food', value: 'ate at restaurant' },
      { id: 'questionable', label: 'Possibly spoiled food', value: 'possibly spoiled food' },
      { id: 'new_food', label: 'New food', value: 'tried new food' },
    ],
    contextKey: 'recentEvents',
  },
  {
    id: 'gi_hydration',
    question: 'Are you able to keep fluids down?',
    explanation: 'Dehydration is a concern with GI symptoms',
    quickOptions: [
      { id: 'yes', label: 'Yes, drinking okay', value: 'keeping fluids down' },
      { id: 'some', label: 'Some fluids', value: 'keeping some fluids down' },
      { id: 'no', label: 'No, can\'t keep anything down', value: 'cannot keep fluids down' },
    ],
    contextKey: 'additionalNotes',
    isRequired: true,
  },
];

/**
 * Headache-specific questions
 */
export const HEADACHE_QUESTIONS: SymptomSpecificQuestion[] = [
  {
    id: 'headache_worst',
    question: 'Is this the worst headache of your life?',
    explanation: 'A "thunderclap" headache requires immediate attention',
    quickOptions: [
      { id: 'no', label: 'No', value: 'not worst headache' },
      { id: 'severe_but_not_worst', label: 'Severe, but not the worst', value: 'severe but not worst headache' },
      { id: 'yes', label: 'Yes, worst ever', value: 'worst headache of life' },
    ],
    contextKey: 'additionalNotes',
    isRequired: true,
  },
  {
    id: 'headache_neuro',
    question: 'Do you have any vision changes, weakness, or difficulty speaking?',
    explanation: 'Neurological symptoms need urgent evaluation',
    quickOptions: [
      { id: 'no', label: 'No', value: 'no neurological symptoms' },
      { id: 'vision', label: 'Vision changes', value: 'vision changes' },
      { id: 'weakness', label: 'Weakness', value: 'weakness' },
      { id: 'speech', label: 'Speech difficulty', value: 'speech difficulty' },
    ],
    contextKey: 'associatedSymptoms',
    isRequired: true,
  },
  {
    id: 'headache_neck',
    question: 'Do you have a stiff neck or fever along with the headache?',
    explanation: 'This combination can indicate serious infection',
    quickOptions: [
      { id: 'neither', label: 'Neither', value: 'no stiff neck or fever' },
      { id: 'fever', label: 'Fever only', value: 'fever with headache' },
      { id: 'neck', label: 'Stiff neck', value: 'stiff neck with headache' },
      { id: 'both', label: 'Both', value: 'stiff neck and fever with headache' },
    ],
    contextKey: 'associatedSymptoms',
    isRequired: true,
  },
  {
    id: 'headache_injury',
    question: 'Have you had any recent head injury or trauma?',
    quickOptions: [
      { id: 'no', label: 'No', value: 'no head injury' },
      { id: 'minor', label: 'Minor bump', value: 'minor head bump' },
      { id: 'fall', label: 'Fall', value: 'fell and hit head' },
      { id: 'accident', label: 'Accident/significant injury', value: 'significant head injury' },
    ],
    contextKey: 'recentEvents',
  },
  {
    id: 'headache_history',
    question: 'Do you have a history of migraines or frequent headaches?',
    quickOptions: [
      { id: 'no', label: 'No', value: 'no headache history' },
      { id: 'occasional', label: 'Occasional headaches', value: 'occasional headaches' },
      { id: 'migraines', label: 'Known migraines', value: 'history of migraines' },
      { id: 'frequent', label: 'Frequent headaches', value: 'frequent headaches' },
    ],
    contextKey: 'chronicConditions',
  },
  {
    id: 'headache_light_sound',
    question: 'Is the headache sensitive to light or sound?',
    quickOptions: [
      { id: 'no', label: 'No', value: 'no light or sound sensitivity' },
      { id: 'light', label: 'Light bothers me', value: 'light sensitivity' },
      { id: 'sound', label: 'Sound bothers me', value: 'sound sensitivity' },
      { id: 'both', label: 'Both', value: 'light and sound sensitivity' },
    ],
    contextKey: 'associatedSymptoms',
  },
];

/**
 * Fever-specific questions
 */
export const FEVER_QUESTIONS: SymptomSpecificQuestion[] = [
  {
    id: 'fever_temp',
    question: 'Do you know your temperature? If so, what is it?',
    quickOptions: [
      { id: 'unknown', label: 'Haven\'t checked', value: 'temperature not measured' },
      { id: 'low', label: 'Under 100.4°F (38°C)', value: 'low-grade fever under 100.4' },
      { id: 'moderate', label: '100.4-102°F (38-39°C)', value: 'fever 100.4-102' },
      { id: 'high', label: 'Over 102°F (39°C)', value: 'high fever over 102' },
      { id: 'very_high', label: 'Over 104°F (40°C)', value: 'very high fever over 104' },
    ],
    contextKey: 'additionalNotes',
    isRequired: true,
  },
  {
    id: 'fever_chills',
    question: 'Are you experiencing chills or sweating?',
    quickOptions: [
      { id: 'no', label: 'No', value: 'no chills or sweats' },
      { id: 'chills', label: 'Chills', value: 'having chills' },
      { id: 'sweats', label: 'Sweating', value: 'sweating' },
      { id: 'both', label: 'Both', value: 'chills and sweating' },
    ],
    contextKey: 'associatedSymptoms',
  },
  {
    id: 'fever_cough',
    question: 'Do you have a cough?',
    quickOptions: [
      { id: 'no', label: 'No cough', value: 'no cough' },
      { id: 'dry', label: 'Dry cough', value: 'dry cough' },
      { id: 'productive', label: 'Cough with mucus', value: 'productive cough' },
      { id: 'blood', label: 'Coughing blood', value: 'coughing blood' },
    ],
    contextKey: 'associatedSymptoms',
  },
  {
    id: 'fever_throat',
    question: 'Do you have a sore throat?',
    quickOptions: [
      { id: 'no', label: 'No', value: 'no sore throat' },
      { id: 'mild', label: 'Mild irritation', value: 'mild sore throat' },
      { id: 'moderate', label: 'Painful to swallow', value: 'painful sore throat' },
      { id: 'severe', label: 'Very painful', value: 'severe sore throat' },
    ],
    contextKey: 'associatedSymptoms',
  },
  {
    id: 'fever_body_aches',
    question: 'Are you experiencing body aches?',
    quickOptions: [
      { id: 'no', label: 'No', value: 'no body aches' },
      { id: 'mild', label: 'Mild aches', value: 'mild body aches' },
      { id: 'moderate', label: 'Moderate aches', value: 'moderate body aches' },
      { id: 'severe', label: 'Severe aches', value: 'severe body aches' },
    ],
    contextKey: 'associatedSymptoms',
  },
  {
    id: 'fever_exposure',
    question: 'Have you been around anyone who is sick?',
    quickOptions: [
      { id: 'no', label: 'No', value: 'no sick contacts' },
      { id: 'family', label: 'Family member', value: 'sick family member' },
      { id: 'work', label: 'Coworker', value: 'sick coworker' },
      { id: 'unknown', label: 'Not sure', value: 'possible sick exposure' },
    ],
    contextKey: 'recentEvents',
  },
];

/**
 * Pediatric-specific questions (for children/infants)
 */
export const PEDIATRIC_QUESTIONS: SymptomSpecificQuestion[] = [
  {
    id: 'peds_feeding',
    question: 'Is the child eating and drinking normally?',
    quickOptions: [
      { id: 'yes', label: 'Yes, normal', value: 'eating and drinking normally' },
      { id: 'less', label: 'Less than usual', value: 'eating less than usual' },
      { id: 'refusing', label: 'Refusing to eat/drink', value: 'refusing food and drink' },
    ],
    contextKey: 'additionalNotes',
    isRequired: true,
  },
  {
    id: 'peds_wet_diapers',
    question: 'How many wet diapers in the last 24 hours?',
    condition: (ctx) => ctx.ageGroup === 'infant',
    quickOptions: [
      { id: 'normal', label: '6+ (normal)', value: '6+ wet diapers normal' },
      { id: 'less', label: '3-5 (fewer than usual)', value: '3-5 wet diapers' },
      { id: 'very_few', label: 'Less than 3', value: 'less than 3 wet diapers' },
    ],
    contextKey: 'additionalNotes',
    isRequired: true,
  },
  {
    id: 'peds_activity',
    question: 'How is the child\'s activity level?',
    quickOptions: [
      { id: 'normal', label: 'Normal/playful', value: 'normal activity level' },
      { id: 'less', label: 'Less active than usual', value: 'less active than usual' },
      { id: 'lethargic', label: 'Very tired/hard to wake', value: 'lethargic hard to wake' },
    ],
    contextKey: 'additionalNotes',
    isRequired: true,
  },
  {
    id: 'peds_crying',
    question: 'Is the child\'s crying different than usual?',
    quickOptions: [
      { id: 'normal', label: 'Normal crying', value: 'normal crying' },
      { id: 'more', label: 'Crying more than usual', value: 'crying more than usual' },
      { id: 'inconsolable', label: 'Won\'t stop crying', value: 'inconsolable crying' },
      { id: 'high_pitched', label: 'High-pitched cry', value: 'high-pitched cry' },
    ],
    contextKey: 'additionalNotes',
  },
  {
    id: 'peds_rash',
    question: 'Does the child have any rash?',
    quickOptions: [
      { id: 'no', label: 'No rash', value: 'no rash' },
      { id: 'minor', label: 'Minor rash', value: 'minor rash' },
      { id: 'spreading', label: 'Spreading rash', value: 'spreading rash' },
      { id: 'purple', label: 'Purple/red spots', value: 'purple or red spots' },
    ],
    contextKey: 'associatedSymptoms',
  },
];

/**
 * Get appropriate question template based on symptom category
 */
export function getSymptomSpecificQuestions(
  category: SymptomCategory,
  context: HealthContext
): SymptomSpecificQuestion[] {
  const isPediatric = context.ageGroup === 'infant' || context.ageGroup === 'child';

  // Start with pediatric questions if applicable
  let questions: SymptomSpecificQuestion[] = [];
  if (isPediatric) {
    questions = PEDIATRIC_QUESTIONS.filter(q =>
      !q.condition || q.condition(context)
    );
  }

  // Add symptom-specific questions
  switch (category) {
    case 'gi':
      questions = [...questions, ...GI_QUESTIONS];
      break;
    case 'headache':
      questions = [...questions, ...HEADACHE_QUESTIONS];
      break;
    case 'fever':
      questions = [...questions, ...FEVER_QUESTIONS];
      break;
    case 'pain':
    case 'musculoskeletal':
      // Will use OPQRST flow instead
      break;
  }

  return questions;
}

/**
 * Get OPQRST questions for pain assessment
 */
export function getOPQRSTQuestions(
  questionsAsked: OPQRSTQuestion[]
): OPQRSTQuestion[] {
  const allQuestions: OPQRSTQuestion[] = [
    'onset',
    'quality',
    'severity',
    'radiation',
    'provocation',
    'palliation',
    'timing',
  ];

  // Required questions that must be asked
  const required: OPQRSTQuestion[] = ['onset', 'quality', 'severity'];

  // Filter out already asked questions
  const remaining = allQuestions.filter(q => !questionsAsked.includes(q));

  // Prioritize required questions
  const sortedRemaining = remaining.sort((a, b) => {
    const aRequired = required.includes(a);
    const bRequired = required.includes(b);
    if (aRequired && !bRequired) return -1;
    if (!aRequired && bRequired) return 1;
    return 0;
  });

  return sortedRemaining;
}

// ============================================
// QUESTION TEMPLATES
// ============================================

const questionTemplates: Record<FollowUpQuestionType, {
  getQuestion: (context: HealthContext) => string;
  quickOptions?: QuickOption[];
  contextKey: keyof HealthContext;
}> = {
  duration: {
    getQuestion: (context) =>
      `How long have you been experiencing ${context.primarySymptom.toLowerCase() || 'this'}?`,
    quickOptions: [
      { id: 'just_now', label: 'Just started', value: 'just_now' },
      { id: 'today', label: 'Today', value: 'today' },
      { id: '1_2_days', label: '1-2 days', value: '1_2_days' },
      { id: '3_7_days', label: '3-7 days', value: '3_7_days' },
      { id: '1_2_weeks', label: '1-2 weeks', value: '1_2_weeks' },
      { id: 'more', label: 'Longer', value: 'more_than_2_weeks' },
    ],
    contextKey: 'duration',
  },

  severity: {
    getQuestion: (context) =>
      `On a scale of 1 to 10, how would you rate the severity? (1 being very mild, 10 being the worst you can imagine)`,
    quickOptions: [
      { id: 'mild', label: '1-3 (Mild)', value: '3' },
      { id: 'moderate', label: '4-6 (Moderate)', value: '5' },
      { id: 'severe', label: '7-8 (Severe)', value: '8' },
      { id: 'very_severe', label: '9-10 (Very severe)', value: '10' },
    ],
    contextKey: 'severity',
  },

  frequency: {
    getQuestion: (context) =>
      `Is ${context.primarySymptom.toLowerCase() || 'this'} constant, or does it come and go?`,
    quickOptions: [
      { id: 'constant', label: 'Constant', value: 'constant' },
      { id: 'intermittent', label: 'Comes and goes', value: 'intermittent' },
      { id: 'occasional', label: 'Occasional', value: 'occasional' },
      { id: 'first_time', label: 'First time', value: 'first_time' },
    ],
    contextKey: 'frequency',
  },

  associated_symptoms: {
    getQuestion: (context) => {
      const suggestions = getAssociatedSymptomSuggestions(context.primarySymptom);
      if (suggestions.length > 0) {
        return `Are you experiencing any other symptoms along with ${context.primarySymptom.toLowerCase()}? For example: ${suggestions.join(', ')}?`;
      }
      return `Are you experiencing any other symptoms along with ${context.primarySymptom.toLowerCase()}?`;
    },
    quickOptions: [
      { id: 'none', label: 'No other symptoms', value: 'none' },
      { id: 'fever', label: 'Fever', value: 'fever' },
      { id: 'fatigue', label: 'Fatigue', value: 'fatigue' },
      { id: 'nausea', label: 'Nausea', value: 'nausea' },
    ],
    contextKey: 'associatedSymptoms',
  },

  risk_factors: {
    getQuestion: () =>
      'Do you have any known health conditions or take any regular medications?',
    quickOptions: [
      { id: 'none', label: 'None', value: 'none' },
      { id: 'diabetes', label: 'Diabetes', value: 'diabetes' },
      { id: 'heart', label: 'Heart condition', value: 'heart_condition' },
      { id: 'bp', label: 'High blood pressure', value: 'high_blood_pressure' },
    ],
    contextKey: 'riskFactors',
  },

  age: {
    getQuestion: () => 'What age group does this concern?',
    quickOptions: [
      { id: 'child', label: 'Child (under 12)', value: 'child' },
      { id: 'teen', label: 'Teen (13-17)', value: 'teen' },
      { id: 'adult', label: 'Adult (18-64)', value: 'adult' },
      { id: 'senior', label: 'Senior (65+)', value: 'senior' },
    ],
    contextKey: 'ageGroup',
  },

  chronic_conditions: {
    getQuestion: () =>
      'Do you have any chronic health conditions I should be aware of?',
    quickOptions: [
      { id: 'none', label: 'None', value: 'none' },
      { id: 'diabetes', label: 'Diabetes', value: 'diabetes' },
      { id: 'hypertension', label: 'Hypertension', value: 'hypertension' },
      { id: 'asthma', label: 'Asthma', value: 'asthma' },
    ],
    contextKey: 'chronicConditions',
  },

  recent_events: {
    getQuestion: (context) =>
      `Has anything happened recently that might be related? Such as an injury, travel, new food, or unusual activity?`,
    quickOptions: [
      { id: 'nothing', label: 'Nothing specific', value: 'nothing' },
      { id: 'injury', label: 'Recent injury', value: 'injury' },
      { id: 'travel', label: 'Recent travel', value: 'travel' },
      { id: 'food', label: 'New food', value: 'food' },
    ],
    contextKey: 'recentEvents',
  },

  medications: {
    getQuestion: () =>
      'Are you currently taking any medications?',
    quickOptions: [
      { id: 'none', label: 'None', value: 'none' },
      { id: 'otc', label: 'Over-the-counter only', value: 'otc' },
      { id: 'prescription', label: 'Prescription meds', value: 'prescription' },
    ],
    contextKey: 'medications',
  },

  location: {
    getQuestion: (context) =>
      `Where exactly are you feeling ${context.primarySymptom.toLowerCase()}?`,
    contextKey: 'additionalNotes',
  },

  triggers: {
    getQuestion: (context) =>
      `Have you noticed anything that makes ${context.primarySymptom.toLowerCase()} better or worse?`,
    quickOptions: [
      { id: 'movement', label: 'Movement', value: 'movement' },
      { id: 'rest', label: 'Rest', value: 'rest' },
      { id: 'food', label: 'Eating', value: 'food' },
      { id: 'unknown', label: 'Not sure', value: 'unknown' },
    ],
    contextKey: 'additionalNotes',
  },

  relief_attempts: {
    getQuestion: () =>
      'Have you tried anything to relieve the symptoms? If so, did it help?',
    quickOptions: [
      { id: 'none', label: 'Haven\'t tried anything', value: 'none' },
      { id: 'rest', label: 'Rest', value: 'rest' },
      { id: 'medication', label: 'Over-the-counter meds', value: 'medication' },
      { id: 'other', label: 'Other remedies', value: 'other' },
    ],
    contextKey: 'additionalNotes',
  },
};

// ============================================
// MAIN FUNCTIONS
// ============================================

export function getFollowUpQuestion(
  type: FollowUpQuestionType,
  context: HealthContext
): FollowUpQuestion {
  const template = questionTemplates[type];

  return {
    type,
    question: template.getQuestion(context),
    quickOptions: template.quickOptions,
    required: type === 'duration' || type === 'severity',
    contextKey: template.contextKey,
  };
}

export function shouldAskMoreQuestions(
  context: HealthContext,
  questionsAsked: FollowUpQuestionType[]
): boolean {
  // Minimum questions before we can provide guidance
  const minQuestions = 2;

  if (questionsAsked.length < minQuestions) {
    return true;
  }

  // Must have duration and severity
  if (!context.duration || !context.severity) {
    return true;
  }

  // If severity is high, gather more info
  if (context.severity >= 7 && questionsAsked.length < 4) {
    return true;
  }

  // If duration is long, we might need more context
  if (
    (context.duration === 'more_than_2_weeks' || context.duration === '1_2_weeks') &&
    questionsAsked.length < 3
  ) {
    return true;
  }

  // Maximum questions to avoid overwhelming the user
  if (questionsAsked.length >= 4) {
    return false;
  }

  return false;
}

export function parseUserResponse(
  text: string,
  questionType: FollowUpQuestionType
): Partial<HealthContext> {
  const normalizedText = text.toLowerCase().trim();
  const result: Partial<HealthContext> = {};

  switch (questionType) {
    case 'duration':
      result.duration = parseDuration(normalizedText);
      break;

    case 'severity':
      result.severity = parseSeverity(normalizedText);
      break;

    case 'frequency':
      result.frequency = parseFrequency(normalizedText);
      break;

    case 'associated_symptoms':
      const symptoms = parseAssociatedSymptoms(normalizedText);
      if (symptoms.length > 0) {
        result.associatedSymptoms = symptoms;
      }
      break;

    case 'recent_events':
      const events = parseRecentEvents(normalizedText);
      if (events.length > 0) {
        result.recentEvents = events;
      }
      break;

    case 'chronic_conditions':
      const conditions = parseChronicConditions(normalizedText);
      if (conditions.length > 0) {
        result.chronicConditions = conditions;
      }
      break;

    case 'risk_factors':
      const factors = parseRiskFactors(normalizedText);
      if (factors.length > 0) {
        result.riskFactors = factors;
      }
      break;

    case 'age':
      result.ageGroup = parseAgeGroup(normalizedText);
      break;

    default:
      // Store as additional notes
      result.additionalNotes = text;
      break;
  }

  return result;
}

// ============================================
// PARSING HELPERS
// ============================================

function parseDuration(text: string): Duration {
  if (text.includes('just') || text.includes('right now') || text.includes('few minutes')) {
    return 'just_now';
  }
  if (text.includes('hour') || text.includes('few hours')) {
    return 'few_hours';
  }
  if (text.includes('today') || text.includes('this morning') || text.includes('tonight')) {
    return 'today';
  }
  if (text.includes('yesterday') || text.includes('1 day') || text.includes('2 day') || text.includes('1-2')) {
    return '1_2_days';
  }
  if (text.includes('3') || text.includes('4') || text.includes('5') || text.includes('6') || text.includes('7') || text.includes('week') || text.includes('3-7')) {
    return '3_7_days';
  }
  if (text.includes('1-2 week') || text.includes('couple week')) {
    return '1_2_weeks';
  }
  if (text.includes('month') || text.includes('long time') || text.includes('longer') || text.includes('more than')) {
    return 'more_than_2_weeks';
  }
  if (text.includes('chronic') || text.includes('always') || text.includes('ongoing')) {
    return 'chronic';
  }

  // Default based on quick options
  if (text === 'just_now' || text === 'today' || text === '1_2_days' ||
      text === '3_7_days' || text === '1_2_weeks' || text === 'more_than_2_weeks') {
    return text as Duration;
  }

  return '1_2_days'; // Default
}

function parseSeverity(text: string): Severity {
  // Check for numeric values
  const numericMatch = text.match(/\d+/);
  if (numericMatch) {
    const num = parseInt(numericMatch[0]);
    if (num >= 1 && num <= 10) {
      return num as Severity;
    }
  }

  // Check for descriptive values
  if (text.includes('mild') || text.includes('slight') || text.includes('1-3')) {
    return 3;
  }
  if (text.includes('moderate') || text.includes('4-6')) {
    return 5;
  }
  if (text.includes('severe') || text.includes('bad') || text.includes('7-8')) {
    return 8;
  }
  if (text.includes('very severe') || text.includes('worst') || text.includes('9-10') || text.includes('unbearable')) {
    return 10;
  }

  return 5; // Default to moderate
}

function parseFrequency(text: string): Frequency {
  if (text.includes('constant') || text.includes('all the time') || text.includes('continuous')) {
    return 'constant';
  }
  if (text.includes('come') || text.includes('go') || text.includes('intermittent') || text.includes('on and off')) {
    return 'intermittent';
  }
  if (text.includes('occasional') || text.includes('sometimes') || text.includes('once in a while')) {
    return 'occasional';
  }
  if (text.includes('first') || text.includes('never before') || text.includes('new')) {
    return 'first_time';
  }

  return 'intermittent'; // Default
}

function parseAssociatedSymptoms(text: string): string[] {
  const symptoms: string[] = [];

  const symptomKeywords = [
    'fever', 'headache', 'nausea', 'vomiting', 'dizziness', 'fatigue',
    'weakness', 'pain', 'swelling', 'rash', 'cough', 'sore throat',
    'congestion', 'runny nose', 'chills', 'sweating', 'loss of appetite',
    'diarrhea', 'constipation', 'bloating',
  ];

  for (const symptom of symptomKeywords) {
    if (text.includes(symptom)) {
      symptoms.push(symptom);
    }
  }

  // Check for "none"
  if (text.includes('none') || text.includes('no other') || text.includes('just')) {
    return [];
  }

  return symptoms;
}

function parseRecentEvents(text: string): string[] {
  const events: string[] = [];

  if (text.includes('injur') || text.includes('fall') || text.includes('accident')) {
    events.push('recent injury');
  }
  if (text.includes('travel')) {
    events.push('recent travel');
  }
  if (text.includes('food') || text.includes('ate') || text.includes('eaten')) {
    events.push('dietary change');
  }
  if (text.includes('stress') || text.includes('anxiety')) {
    events.push('stress');
  }
  if (text.includes('surgery') || text.includes('operation')) {
    events.push('recent surgery');
  }
  if (text.includes('exercise') || text.includes('workout') || text.includes('gym')) {
    events.push('physical activity');
  }

  return events;
}

function parseChronicConditions(text: string): string[] {
  const conditions: string[] = [];

  if (text.includes('diabetes') || text.includes('diabetic')) {
    conditions.push('diabetes');
  }
  if (text.includes('hypertension') || text.includes('blood pressure') || text.includes('bp')) {
    conditions.push('hypertension');
  }
  if (text.includes('asthma')) {
    conditions.push('asthma');
  }
  if (text.includes('heart') || text.includes('cardiac')) {
    conditions.push('heart condition');
  }
  if (text.includes('thyroid')) {
    conditions.push('thyroid condition');
  }
  if (text.includes('arthritis')) {
    conditions.push('arthritis');
  }

  return conditions;
}

function parseRiskFactors(text: string): string[] {
  // Similar to chronic conditions
  return parseChronicConditions(text);
}

function parseAgeGroup(text: string): HealthContext['ageGroup'] {
  if (text.includes('infant') || text.includes('baby')) {
    return 'infant';
  }
  if (text.includes('child') || text.includes('kid') || text.includes('under 12')) {
    return 'child';
  }
  if (text.includes('teen') || text.includes('13') || text.includes('17')) {
    return 'teen';
  }
  if (text.includes('senior') || text.includes('elderly') || text.includes('65') || text.includes('old')) {
    return 'senior';
  }

  return 'adult'; // Default
}

function getAssociatedSymptomSuggestions(primarySymptom: string): string[] {
  const symptom = primarySymptom.toLowerCase();

  if (symptom.includes('headache') || symptom.includes('head')) {
    return ['nausea', 'sensitivity to light', 'neck stiffness'];
  }
  if (symptom.includes('stomach') || symptom.includes('abdominal')) {
    return ['nausea', 'vomiting', 'fever', 'diarrhea'];
  }
  if (symptom.includes('chest')) {
    return ['shortness of breath', 'arm pain', 'sweating'];
  }
  if (symptom.includes('fever') || symptom.includes('cold') || symptom.includes('flu')) {
    return ['body aches', 'fatigue', 'sore throat', 'cough'];
  }
  if (symptom.includes('cough')) {
    return ['fever', 'sore throat', 'congestion', 'fatigue'];
  }
  if (symptom.includes('back') || symptom.includes('muscle')) {
    return ['stiffness', 'weakness', 'numbness', 'tingling'];
  }

  return ['fever', 'fatigue', 'nausea'];
}

// ============================================
// INTELLIGENT QUESTION FLOW CONTROLLER
// ============================================

export type QuestionFlowState = {
  symptomCategory: SymptomCategory;
  useOPQRST: boolean;
  opqrstQuestionsAsked: OPQRSTQuestion[];
  symptomQuestionsAsked: string[];
  generalQuestionsAsked: FollowUpQuestionType[];
};

/**
 * Creates initial question flow state based on symptom
 */
export function initializeQuestionFlow(primarySymptom: string): QuestionFlowState {
  const category = detectSymptomCategory(primarySymptom);
  const useOPQRST = category === 'pain' || category === 'musculoskeletal';

  return {
    symptomCategory: category,
    useOPQRST,
    opqrstQuestionsAsked: [],
    symptomQuestionsAsked: [],
    generalQuestionsAsked: [],
  };
}

/**
 * Gets the next best question to ask based on context and flow state
 */
export function getNextQuestion(
  context: HealthContext,
  flowState: QuestionFlowState
): {
  question: string;
  explanation?: string;
  quickOptions?: QuickOption[];
  questionId: string;
  flowType: 'opqrst' | 'symptom' | 'general';
} | null {
  // First, check if we need OPQRST questions for pain
  if (flowState.useOPQRST) {
    const remainingOPQRST = getOPQRSTQuestions(flowState.opqrstQuestionsAsked);
    if (remainingOPQRST.length > 0 && flowState.opqrstQuestionsAsked.length < 4) {
      const nextQ = remainingOPQRST[0];
      const template = OPQRST_QUESTIONS[nextQ];
      return {
        question: template.question,
        explanation: template.explanation,
        quickOptions: template.quickOptions,
        questionId: `opqrst_${nextQ}`,
        flowType: 'opqrst',
      };
    }
  }

  // Next, check for symptom-specific questions
  const symptomQuestions = getSymptomSpecificQuestions(
    flowState.symptomCategory,
    context
  );

  const unansweredSymptomQs = symptomQuestions.filter(
    q => !flowState.symptomQuestionsAsked.includes(q.id)
  );

  // Prioritize required questions
  const requiredUnanswered = unansweredSymptomQs.filter(q => q.isRequired);
  if (requiredUnanswered.length > 0) {
    const nextQ = requiredUnanswered[0];
    return {
      question: nextQ.question,
      explanation: nextQ.explanation,
      quickOptions: nextQ.quickOptions,
      questionId: nextQ.id,
      flowType: 'symptom',
    };
  }

  // Then optional symptom questions (limit to 2 more)
  const optionalAsked = flowState.symptomQuestionsAsked.filter(
    id => !symptomQuestions.find(q => q.id === id && q.isRequired)
  ).length;

  if (optionalAsked < 2 && unansweredSymptomQs.length > 0) {
    const nextQ = unansweredSymptomQs[0];
    return {
      question: nextQ.question,
      explanation: nextQ.explanation,
      quickOptions: nextQ.quickOptions,
      questionId: nextQ.id,
      flowType: 'symptom',
    };
  }

  // Finally, fall back to general questions if needed
  const generalQuestionOrder: FollowUpQuestionType[] = [
    'duration',
    'severity',
    'associated_symptoms',
    'chronic_conditions',
    'medications',
  ];

  // Only ask general questions that haven't been covered
  const neededGeneral = generalQuestionOrder.filter(type => {
    // Skip if already asked
    if (flowState.generalQuestionsAsked.includes(type)) return false;

    // Skip severity if OPQRST was used (it includes severity)
    if (type === 'severity' && flowState.useOPQRST && flowState.opqrstQuestionsAsked.includes('severity')) {
      return false;
    }

    // Skip if context already has the info
    if (type === 'duration' && context.duration) return false;
    if (type === 'severity' && context.severity) return false;

    return true;
  });

  if (neededGeneral.length > 0 && flowState.generalQuestionsAsked.length < 3) {
    const type = neededGeneral[0];
    const template = questionTemplates[type];
    return {
      question: template.getQuestion(context),
      quickOptions: template.quickOptions,
      questionId: `general_${type}`,
      flowType: 'general',
    };
  }

  // No more questions needed
  return null;
}

/**
 * Updates flow state after a question is answered
 */
export function updateFlowState(
  flowState: QuestionFlowState,
  questionId: string,
  flowType: 'opqrst' | 'symptom' | 'general'
): QuestionFlowState {
  const newState = { ...flowState };

  switch (flowType) {
    case 'opqrst':
      const opqrstType = questionId.replace('opqrst_', '') as OPQRSTQuestion;
      newState.opqrstQuestionsAsked = [...flowState.opqrstQuestionsAsked, opqrstType];
      break;
    case 'symptom':
      newState.symptomQuestionsAsked = [...flowState.symptomQuestionsAsked, questionId];
      break;
    case 'general':
      const generalType = questionId.replace('general_', '') as FollowUpQuestionType;
      newState.generalQuestionsAsked = [...flowState.generalQuestionsAsked, generalType];
      break;
  }

  return newState;
}

/**
 * Determines if we have enough information to provide guidance
 */
export function hasEnoughInformation(
  context: HealthContext,
  flowState: QuestionFlowState
): boolean {
  // Minimum requirements
  const hasBasicInfo = context.duration || context.severity;
  const totalQuestionsAsked =
    flowState.opqrstQuestionsAsked.length +
    flowState.symptomQuestionsAsked.length +
    flowState.generalQuestionsAsked.length;

  // For pain, we need at least onset, quality, and severity from OPQRST
  if (flowState.useOPQRST) {
    const hasOPQRSTBasics =
      flowState.opqrstQuestionsAsked.includes('onset') &&
      flowState.opqrstQuestionsAsked.includes('quality') &&
      flowState.opqrstQuestionsAsked.includes('severity');

    if (hasOPQRSTBasics && totalQuestionsAsked >= 3) {
      return true;
    }
  }

  // For other symptoms, we need at least 3 questions answered
  // and any required symptom questions answered
  const symptomQuestions = getSymptomSpecificQuestions(
    flowState.symptomCategory,
    context
  );
  const requiredQuestions = symptomQuestions.filter(q => q.isRequired);
  const allRequiredAnswered = requiredQuestions.every(
    q => flowState.symptomQuestionsAsked.includes(q.id)
  );

  if (allRequiredAnswered && totalQuestionsAsked >= 3) {
    return true;
  }

  // Maximum questions reached
  if (totalQuestionsAsked >= 6) {
    return true;
  }

  // Emergency situations - provide guidance sooner
  if (context.severity && context.severity >= 8) {
    return totalQuestionsAsked >= 2;
  }

  return false;
}
