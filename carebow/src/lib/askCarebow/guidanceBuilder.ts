/**
 * Guidance Builder for Ask CareBow
 * Builds personalized health guidance based on assessment
 */

import {
  HealthContext,
  GuidanceResponse,
  ServiceRecommendation,
  UrgencyLevel,
  SuggestedAction,
  ActionType,
  MemberProfile,
  COPY_RULES,
} from '@/types/askCarebow';
import { SafetyAssessment } from './safetyClassifier';

// ============================================
// SYMPTOM GUIDANCE DATABASE
// ============================================

type SymptomGuidance = {
  keywords: string[];
  possibleCauses: string[];
  immediateActions: string[];
  whenToSeekHelp: string[];
};

const SYMPTOM_GUIDANCE_DATABASE: SymptomGuidance[] = [
  {
    keywords: ['headache', 'head pain', 'migraine'],
    possibleCauses: [
      'Tension or stress',
      'Dehydration',
      'Eye strain',
      'Sinus congestion',
      'Lack of sleep',
    ],
    immediateActions: [
      'Rest in a quiet, dark room',
      'Stay hydrated - drink water',
      'Apply a cold or warm compress',
      'Take over-the-counter pain relief if appropriate',
      'Reduce screen time',
    ],
    whenToSeekHelp: [
      'Headache is sudden and severe (worst of your life)',
      'Accompanied by fever, stiff neck, or confusion',
      'Following a head injury',
      'Getting progressively worse over days',
      'Accompanied by vision changes or numbness',
    ],
  },
  {
    keywords: ['stomach', 'abdominal', 'belly', 'nausea', 'vomit', 'diarrhea'],
    possibleCauses: [
      'Food-related issues (spoiled food, overeating)',
      'Viral gastroenteritis (stomach flu)',
      'Stress or anxiety',
      'Indigestion or acid reflux',
      'Food intolerance',
    ],
    immediateActions: [
      'Stay hydrated with clear fluids (water, broth)',
      'Rest and avoid solid foods temporarily',
      'Eat bland foods when ready (BRAT diet: bananas, rice, applesauce, toast)',
      'Avoid dairy, caffeine, and fatty foods',
      'Try ginger tea for nausea',
    ],
    whenToSeekHelp: [
      'Blood in vomit or stool',
      'Severe abdominal pain that doesn\'t improve',
      'Signs of dehydration (dark urine, dizziness)',
      'Fever above 101.3F (38.5C)',
      'Symptoms lasting more than 3 days',
    ],
  },
  {
    keywords: ['cough', 'cold', 'flu', 'sore throat', 'congestion', 'runny nose'],
    possibleCauses: [
      'Common cold (viral infection)',
      'Seasonal allergies',
      'Flu (influenza)',
      'Sinus infection',
      'Post-nasal drip',
    ],
    immediateActions: [
      'Rest and get plenty of sleep',
      'Stay hydrated with warm fluids',
      'Use a humidifier to ease congestion',
      'Gargle with warm salt water for sore throat',
      'Take over-the-counter cold medicine if appropriate',
    ],
    whenToSeekHelp: [
      'Difficulty breathing or shortness of breath',
      'High fever lasting more than 3 days',
      'Severe sore throat with difficulty swallowing',
      'Symptoms worsening after initial improvement',
      'Colored mucus (green/yellow) with facial pain',
    ],
  },
  {
    keywords: ['back pain', 'lower back', 'spine', 'backache'],
    possibleCauses: [
      'Muscle strain or overuse',
      'Poor posture',
      'Prolonged sitting or standing',
      'Lifting heavy objects incorrectly',
      'Stress and tension',
    ],
    immediateActions: [
      'Apply ice for first 48-72 hours, then switch to heat',
      'Take gentle walks to prevent stiffness',
      'Practice gentle stretching exercises',
      'Maintain good posture when sitting',
      'Use proper lifting techniques',
    ],
    whenToSeekHelp: [
      'Pain radiating down your leg (sciatica)',
      'Numbness or tingling in legs',
      'Loss of bladder or bowel control',
      'Pain after a fall or injury',
      'Pain not improving after 2 weeks of self-care',
    ],
  },
  {
    keywords: ['rash', 'skin', 'itch', 'hives', 'bumps'],
    possibleCauses: [
      'Allergic reaction (contact dermatitis)',
      'Eczema or dry skin',
      'Insect bites',
      'Heat rash',
      'Viral infection',
    ],
    immediateActions: [
      'Avoid scratching the affected area',
      'Apply cool compresses',
      'Use mild, fragrance-free moisturizer',
      'Take an antihistamine for itching if appropriate',
      'Identify and avoid potential triggers',
    ],
    whenToSeekHelp: [
      'Rash spreading rapidly',
      'Accompanied by fever or difficulty breathing',
      'Signs of infection (warmth, pus, red streaks)',
      'Blisters or open sores',
      'Rash not improving after a week',
    ],
  },
  {
    keywords: ['fever', 'temperature', 'chills', 'hot'],
    possibleCauses: [
      'Viral infection (cold, flu)',
      'Bacterial infection',
      'Body\'s immune response',
      'Recent vaccination',
      'Heat exhaustion',
    ],
    immediateActions: [
      'Rest and stay home',
      'Stay hydrated with plenty of fluids',
      'Dress in light clothing',
      'Take fever-reducing medication if appropriate',
      'Monitor your temperature regularly',
    ],
    whenToSeekHelp: [
      'Temperature above 103F (39.4C)',
      'Fever lasting more than 3 days',
      'Accompanied by severe headache or stiff neck',
      'Difficulty breathing',
      'Confusion or unusual behavior',
    ],
  },
  {
    keywords: ['fatigue', 'tired', 'exhausted', 'weak', 'no energy'],
    possibleCauses: [
      'Lack of sleep or poor sleep quality',
      'Stress or overwork',
      'Dehydration',
      'Poor nutrition',
      'Fighting off an infection',
    ],
    immediateActions: [
      'Prioritize getting 7-9 hours of sleep',
      'Stay hydrated throughout the day',
      'Eat balanced meals with protein and complex carbs',
      'Take short breaks during work',
      'Limit caffeine, especially after noon',
    ],
    whenToSeekHelp: [
      'Fatigue lasting more than 2 weeks',
      'Accompanied by unexplained weight loss',
      'With shortness of breath or chest pain',
      'Affecting daily activities significantly',
      'With depression or mood changes',
    ],
  },
  {
    keywords: ['anxiety', 'stress', 'worry', 'panic', 'nervous'],
    possibleCauses: [
      'Work or life stress',
      'Major life changes',
      'Caffeine or stimulant use',
      'Lack of sleep',
      'Underlying health concerns',
    ],
    immediateActions: [
      'Practice deep breathing exercises',
      'Try the 5-4-3-2-1 grounding technique',
      'Take a short walk outside',
      'Limit caffeine and alcohol',
      'Talk to someone you trust',
    ],
    whenToSeekHelp: [
      'Symptoms interfering with daily life',
      'Panic attacks or severe anxiety episodes',
      'Thoughts of self-harm',
      'Avoiding situations due to anxiety',
      'Physical symptoms like rapid heartbeat persisting',
    ],
  },
];

// ============================================
// GUIDANCE BUILDER
// ============================================

/**
 * Build structured guidance response following clinical output format:
 * 1. Understanding (brief)
 * 2. Guidance (calm, neutral)
 * 3. What to watch for
 * 4. Recommended next step (actionable)
 * 5. Disclaimer (soft)
 */
export function buildGuidanceResponse(
  context: HealthContext,
  assessment: SafetyAssessment,
  recommendations: ServiceRecommendation[],
  memberProfile?: MemberProfile
): GuidanceResponse {
  const symptomText = [
    context.primarySymptom,
    ...context.associatedSymptoms,
  ].join(' ').toLowerCase();

  // Find matching guidance
  const matchingGuidance = findMatchingGuidance(symptomText);

  // Build understanding statement
  const understanding = buildUnderstandingStatement(context, assessment);

  // Build response based on matches and assessment
  const possibleCauses = buildPossibleCauses(matchingGuidance, context, assessment);
  const immediateActions = buildImmediateActions(matchingGuidance, context, assessment, memberProfile);
  const whenToSeekHelp = buildWhenToSeekHelp(matchingGuidance, assessment);

  // Build suggested actions with pre-filled data
  const suggestedActions = buildSuggestedActions(assessment, context, memberProfile);

  // Determine risk level
  const riskLevel = determineRiskLevel(assessment);

  // Collect detected symptoms
  const detectedSymptoms = collectDetectedSymptoms(context, assessment);

  return {
    understanding,
    possibleCauses,
    immediateActions,
    whenToSeekHelp,
    suggestedActions,
    recommendedServices: recommendations,
    riskLevel,
    detectedSymptoms,
  };
}

/**
 * Build understanding statement using approved copy rules
 */
function buildUnderstandingStatement(
  context: HealthContext,
  assessment: SafetyAssessment
): string {
  const parts: string[] = [];

  // Start with the preferred phrase
  parts.push(COPY_RULES.preferred.understanding);

  // Add symptom summary
  if (context.primarySymptom) {
    parts.push(`you're experiencing ${context.primarySymptom.toLowerCase()}`);
  }

  // Add duration context
  if (context.duration) {
    const durationText = getDurationText(context.duration);
    parts.push(`for ${durationText}`);
  }

  // Add severity context
  if (context.severity && context.severity >= 7) {
    parts.push('with significant discomfort');
  }

  return parts.join(', ') + '.';
}

function getDurationText(duration: string): string {
  const durationMap: Record<string, string> = {
    just_now: 'a very short time',
    few_hours: 'a few hours',
    today: 'since earlier today',
    '1_2_days': '1-2 days',
    '3_7_days': 'about a week',
    '1_2_weeks': '1-2 weeks',
    more_than_2_weeks: 'more than 2 weeks',
    chronic: 'an extended period',
  };
  return durationMap[duration] || 'some time';
}

/**
 * Determine risk level from assessment
 */
function determineRiskLevel(
  assessment: SafetyAssessment
): 'low' | 'moderate' | 'high' | 'critical' {
  if (assessment.urgency === 'emergency') return 'critical';
  if (assessment.urgency === 'urgent') return 'high';
  if (assessment.urgency === 'soon' || assessment.urgency === 'non_urgent') return 'moderate';
  return 'low';
}

/**
 * Collect all detected symptoms from context and assessment
 */
function collectDetectedSymptoms(
  context: HealthContext,
  assessment: SafetyAssessment
): string[] {
  const symptoms: string[] = [];

  if (context.primarySymptom) {
    symptoms.push(context.primarySymptom);
  }

  symptoms.push(...context.associatedSymptoms);
  symptoms.push(...assessment.redFlagsDetected);

  return [...new Set(symptoms)];
}

/**
 * Build suggested actions with actionable buttons
 */
function buildSuggestedActions(
  assessment: SafetyAssessment,
  context: HealthContext,
  memberProfile?: MemberProfile
): SuggestedAction[] {
  const actions: SuggestedAction[] = [];
  const memberId = memberProfile?.id || '';

  // Build notes from conversation
  const notes = buildConversationNotes(context);

  switch (assessment.urgency) {
    case 'emergency':
      actions.push({
        type: 'call_emergency',
        label: 'Call Emergency Services',
        description: 'Call 911 for immediate medical attention',
        urgency: 'emergency',
      });
      break;

    case 'urgent':
      actions.push({
        type: 'book_doctor',
        label: 'See Doctor Today',
        description: 'Book an urgent doctor visit',
        serviceId: 'doctor-home-visit',
        urgency: 'urgent',
        prefilledData: {
          memberId,
          suggestedDate: new Date().toISOString().split('T')[0],
          notes,
        },
      });
      actions.push({
        type: 'video_consult',
        label: 'Video Consultation',
        description: 'Speak with a doctor online now',
        serviceId: 'video-consultation',
        urgency: 'urgent',
        prefilledData: { memberId, notes },
      });
      break;

    case 'soon':
      actions.push({
        type: 'book_doctor',
        label: 'Book Doctor Visit',
        description: 'Schedule within 1-2 days',
        serviceId: 'doctor-home-visit',
        urgency: 'soon',
        prefilledData: { memberId, notes },
      });
      actions.push({
        type: 'video_consult',
        label: 'Video Consultation',
        description: 'Talk to a doctor online',
        serviceId: 'video-consultation',
        urgency: 'soon',
        prefilledData: { memberId, notes },
      });
      break;

    case 'non_urgent':
      actions.push({
        type: 'video_consult',
        label: 'Consult a Doctor',
        description: 'Get professional advice',
        serviceId: 'video-consultation',
        urgency: 'non_urgent',
        prefilledData: { memberId, notes },
      });
      actions.push({
        type: 'monitor_at_home',
        label: 'Monitor at Home',
        description: 'Track your symptoms',
        urgency: 'non_urgent',
      });
      break;

    case 'monitor':
    case 'self_care':
    default:
      actions.push({
        type: 'monitor_at_home',
        label: 'Monitor at Home',
        description: 'Continue self-care and track symptoms',
        urgency: 'self_care',
      });
      actions.push({
        type: 'no_action_needed',
        label: 'No Action Needed Now',
        description: 'Revisit if symptoms change',
        urgency: 'self_care',
      });
      break;
  }

  return actions;
}

/**
 * Build conversation notes for pre-filling service bookings
 */
function buildConversationNotes(context: HealthContext): string {
  const parts: string[] = [];

  if (context.primarySymptom) {
    parts.push(`Chief complaint: ${context.primarySymptom}`);
  }

  if (context.duration) {
    parts.push(`Duration: ${getDurationText(context.duration)}`);
  }

  if (context.severity) {
    parts.push(`Severity: ${context.severity}/10`);
  }

  if (context.associatedSymptoms.length > 0) {
    parts.push(`Associated symptoms: ${context.associatedSymptoms.join(', ')}`);
  }

  return parts.join('\n');
}

function findMatchingGuidance(symptomText: string): SymptomGuidance[] {
  const matches: SymptomGuidance[] = [];

  for (const guidance of SYMPTOM_GUIDANCE_DATABASE) {
    for (const keyword of guidance.keywords) {
      if (symptomText.includes(keyword)) {
        matches.push(guidance);
        break;
      }
    }
  }

  return matches;
}

function buildPossibleCauses(
  matchingGuidance: SymptomGuidance[],
  context: HealthContext,
  assessment: SafetyAssessment
): string[] {
  const causes: string[] = [];

  // Add causes from matching guidance (limit to prevent overwhelming)
  for (const guidance of matchingGuidance.slice(0, 2)) {
    causes.push(...guidance.possibleCauses.slice(0, 3));
  }

  // If no specific matches, provide generic guidance
  if (causes.length === 0) {
    causes.push(
      'Various factors could be contributing to your symptoms',
      'Your body may be responding to stress or environmental factors',
      'This could be related to recent changes in routine or diet'
    );
  }

  // Add disclaimer
  causes.push('Note: These are general possibilities and not a diagnosis');

  // Remove duplicates and return
  return [...new Set(causes)];
}

function buildImmediateActions(
  matchingGuidance: SymptomGuidance[],
  context: HealthContext,
  assessment: SafetyAssessment,
  memberProfile?: MemberProfile
): string[] {
  const actions: string[] = [];

  // Add actions based on urgency level
  if (assessment.urgency === 'emergency' || assessment.urgency === 'urgent') {
    actions.push('Seek medical attention as soon as possible');
  }

  // Add specific actions from matching guidance
  for (const guidance of matchingGuidance.slice(0, 2)) {
    actions.push(...guidance.immediateActions.slice(0, 3));
  }

  // Add general self-care if appropriate
  if (assessment.urgency === 'self_care' || assessment.urgency === 'monitor') {
    if (!actions.some(a => a.toLowerCase().includes('rest'))) {
      actions.push('Get adequate rest and sleep');
    }
    if (!actions.some(a => a.toLowerCase().includes('hydrat'))) {
      actions.push('Stay hydrated');
    }
  }

  // If no specific matches, provide generic guidance
  if (actions.length === 0) {
    actions.push(
      'Rest and monitor your symptoms',
      'Stay hydrated',
      'Note any changes or new symptoms'
    );
  }

  // Remove duplicates and return
  return [...new Set(actions)].slice(0, 5);
}

function buildWhenToSeekHelp(
  matchingGuidance: SymptomGuidance[],
  assessment: SafetyAssessment
): string[] {
  const whenToSeek: string[] = [];

  // Add specific guidance from matches
  for (const guidance of matchingGuidance.slice(0, 2)) {
    whenToSeek.push(...guidance.whenToSeekHelp.slice(0, 2));
  }

  // Add based on risk factors detected
  if (assessment.redFlagsDetected.length > 0) {
    whenToSeek.unshift('Your symptoms include concerning signs - please monitor closely');
  }

  // Add general guidelines
  whenToSeek.push('Symptoms significantly worsen or don\'t improve');
  whenToSeek.push('You develop new concerning symptoms');

  // Remove duplicates and return
  return [...new Set(whenToSeek)].slice(0, 5);
}

// ============================================
// DIFFERENTIAL POSSIBILITIES LOGIC
// ============================================

/**
 * Differential possibility structure
 * Based on symptom combinations and clinical patterns
 */
export type DifferentialPossibility = {
  name: string;
  description: string;
  likelihood: 'high' | 'moderate' | 'low';
  supportingFactors: string[];
  typicalPresentation: string;
};

/**
 * Pattern-based differential diagnosis database
 * Maps symptom combinations to possible conditions
 */
type DifferentialPattern = {
  requiredSymptoms: string[];
  optionalSymptoms: string[];
  excludingSymptoms: string[];
  possibilities: DifferentialPossibility[];
  ageModifiers?: {
    pediatric?: DifferentialPossibility[];
    senior?: DifferentialPossibility[];
  };
};

const DIFFERENTIAL_PATTERNS: DifferentialPattern[] = [
  // Headache patterns
  {
    requiredSymptoms: ['headache'],
    optionalSymptoms: ['nausea', 'light', 'sound', 'aura', 'throbbing'],
    excludingSymptoms: ['worst headache', 'sudden severe', 'stiff neck'],
    possibilities: [
      {
        name: 'Migraine',
        description: 'A neurological condition with moderate to severe headache',
        likelihood: 'high',
        supportingFactors: ['Throbbing quality', 'Light/sound sensitivity', 'Nausea', 'History of similar'],
        typicalPresentation: 'One-sided pulsating headache with nausea and light sensitivity',
      },
      {
        name: 'Tension-type headache',
        description: 'Most common type of headache caused by muscle tension',
        likelihood: 'moderate',
        supportingFactors: ['Band-like pressure', 'Both sides affected', 'No nausea', 'Stress related'],
        typicalPresentation: 'Mild to moderate pressing/tightening sensation on both sides',
      },
      {
        name: 'Sinus headache',
        description: 'Pain caused by sinus congestion or infection',
        likelihood: 'low',
        supportingFactors: ['Facial pressure', 'Congestion', 'Worse when bending', 'Recent cold'],
        typicalPresentation: 'Facial pain and pressure with nasal symptoms',
      },
    ],
  },
  // Abdominal pain patterns
  {
    requiredSymptoms: ['stomach', 'abdominal', 'belly'],
    optionalSymptoms: ['nausea', 'vomit', 'diarrhea', 'cramp', 'bloat'],
    excludingSymptoms: ['blood in stool', 'severe', 'chest pain'],
    possibilities: [
      {
        name: 'Gastroenteritis (Stomach flu)',
        description: 'Viral or bacterial infection of the digestive tract',
        likelihood: 'high',
        supportingFactors: ['Diarrhea', 'Vomiting', 'Low-grade fever', 'Recent exposure'],
        typicalPresentation: 'Nausea, vomiting, diarrhea, and abdominal cramps',
      },
      {
        name: 'Indigestion / Dyspepsia',
        description: 'Discomfort in the upper abdomen related to eating',
        likelihood: 'moderate',
        supportingFactors: ['After eating', 'Bloating', 'Burning sensation', 'No fever'],
        typicalPresentation: 'Upper abdominal discomfort, bloating, or burning after meals',
      },
      {
        name: 'Food intolerance',
        description: 'Digestive difficulty with certain foods',
        likelihood: 'low',
        supportingFactors: ['Specific food trigger', 'Bloating', 'Gas', 'Pattern with foods'],
        typicalPresentation: 'Symptoms appearing after consuming specific foods',
      },
    ],
    ageModifiers: {
      pediatric: [
        {
          name: 'Viral gastroenteritis',
          description: 'Common stomach bug in children',
          likelihood: 'high',
          supportingFactors: ['Daycare/school exposure', 'Other sick children', 'Sudden onset'],
          typicalPresentation: 'Vomiting and diarrhea with possible low fever',
        },
      ],
    },
  },
  // Fever patterns
  {
    requiredSymptoms: ['fever', 'temperature', 'chills'],
    optionalSymptoms: ['cough', 'throat', 'ache', 'fatigue', 'congestion'],
    excludingSymptoms: ['stiff neck', 'rash', 'confusion'],
    possibilities: [
      {
        name: 'Viral upper respiratory infection',
        description: 'Common cold or similar viral infection',
        likelihood: 'high',
        supportingFactors: ['Cough', 'Congestion', 'Sore throat', 'Recent exposure'],
        typicalPresentation: 'Low-grade fever with cold symptoms',
      },
      {
        name: 'Influenza (Flu)',
        description: 'Viral respiratory illness',
        likelihood: 'moderate',
        supportingFactors: ['High fever', 'Body aches', 'Sudden onset', 'Flu season'],
        typicalPresentation: 'High fever, severe body aches, fatigue with respiratory symptoms',
      },
      {
        name: 'Bacterial infection',
        description: 'Infection requiring possible antibiotic treatment',
        likelihood: 'low',
        supportingFactors: ['Prolonged fever', 'Getting worse', 'Localized symptoms'],
        typicalPresentation: 'Fever not improving with symptoms localizing to one area',
      },
    ],
    ageModifiers: {
      pediatric: [
        {
          name: 'Ear infection (Otitis media)',
          description: 'Common childhood ear infection',
          likelihood: 'moderate',
          supportingFactors: ['Ear pulling', 'Irritability', 'Recent cold', 'Night crying'],
          typicalPresentation: 'Fever with ear pain or tugging, often after a cold',
        },
      ],
      senior: [
        {
          name: 'Urinary tract infection',
          description: 'UTI can present atypically in elderly',
          likelihood: 'moderate',
          supportingFactors: ['Confusion', 'Urinary symptoms', 'Low-grade fever'],
          typicalPresentation: 'May present with confusion or falls without typical UTI symptoms',
        },
      ],
    },
  },
  // Respiratory patterns
  {
    requiredSymptoms: ['cough'],
    optionalSymptoms: ['congestion', 'throat', 'wheeze', 'phlegm', 'fever'],
    excludingSymptoms: ['blood', 'chest pain', 'shortness of breath'],
    possibilities: [
      {
        name: 'Common cold',
        description: 'Viral upper respiratory infection',
        likelihood: 'high',
        supportingFactors: ['Runny nose', 'Mild symptoms', 'Gradual onset', 'No high fever'],
        typicalPresentation: 'Nasal congestion, runny nose, sore throat, and mild cough',
      },
      {
        name: 'Acute bronchitis',
        description: 'Inflammation of the bronchial tubes',
        likelihood: 'moderate',
        supportingFactors: ['Productive cough', 'Chest congestion', 'Following cold', 'Cough worsening'],
        typicalPresentation: 'Persistent cough with mucus production after a cold',
      },
      {
        name: 'Allergic rhinitis',
        description: 'Allergic response affecting the upper airway',
        likelihood: 'low',
        supportingFactors: ['Seasonal pattern', 'Itchy eyes', 'No fever', 'Clear discharge'],
        typicalPresentation: 'Sneezing, itchy eyes, clear runny nose without fever',
      },
    ],
  },
  // Back pain patterns
  {
    requiredSymptoms: ['back', 'spine'],
    optionalSymptoms: ['stiff', 'muscle', 'ache', 'sharp'],
    excludingSymptoms: ['numbness', 'weakness', 'bladder', 'bowel'],
    possibilities: [
      {
        name: 'Muscle strain',
        description: 'Overuse or injury to back muscles',
        likelihood: 'high',
        supportingFactors: ['Recent activity', 'Lifting', 'Localized pain', 'Improves with rest'],
        typicalPresentation: 'Localized pain that worsens with movement and improves with rest',
      },
      {
        name: 'Postural back pain',
        description: 'Pain related to posture and positioning',
        likelihood: 'moderate',
        supportingFactors: ['Desk work', 'Prolonged sitting', 'End of day worse', 'Improves with stretching'],
        typicalPresentation: 'Dull ache that develops through the day with sedentary work',
      },
      {
        name: 'Degenerative changes',
        description: 'Age-related changes in the spine',
        likelihood: 'low',
        supportingFactors: ['Age over 40', 'Chronic pattern', 'Morning stiffness', 'Gradual onset'],
        typicalPresentation: 'Chronic intermittent pain with morning stiffness',
      },
    ],
  },
];

/**
 * Generate differential possibilities based on health context
 */
export function generateDifferentialPossibilities(
  context: HealthContext,
  assessment: SafetyAssessment
): DifferentialPossibility[] {
  const allSymptomText = [
    context.primarySymptom,
    ...context.associatedSymptoms,
    context.additionalNotes,
  ].join(' ').toLowerCase();

  const possibilities: DifferentialPossibility[] = [];

  // Find matching patterns
  for (const pattern of DIFFERENTIAL_PATTERNS) {
    // Check if required symptoms are present
    const hasRequired = pattern.requiredSymptoms.some(symptom =>
      allSymptomText.includes(symptom)
    );

    if (!hasRequired) continue;

    // Check for excluding symptoms (skip if present)
    const hasExcluding = pattern.excludingSymptoms.some(symptom =>
      allSymptomText.includes(symptom)
    );

    if (hasExcluding) continue;

    // Count optional symptom matches for likelihood adjustment
    const optionalMatches = pattern.optionalSymptoms.filter(symptom =>
      allSymptomText.includes(symptom)
    ).length;

    // Add possibilities with adjusted likelihood based on matches
    for (const possibility of pattern.possibilities) {
      const adjustedPossibility = { ...possibility };

      // Adjust likelihood based on optional symptom matches
      if (optionalMatches >= 2 && possibility.likelihood !== 'high') {
        // Upgrade likelihood if multiple optional symptoms match
        adjustedPossibility.likelihood = possibility.likelihood === 'low' ? 'moderate' : 'high';
      }

      possibilities.push(adjustedPossibility);
    }

    // Add age-specific modifiers
    if (pattern.ageModifiers) {
      if (context.ageGroup === 'infant' || context.ageGroup === 'child') {
        if (pattern.ageModifiers.pediatric) {
          possibilities.push(...pattern.ageModifiers.pediatric);
        }
      }
      if (context.ageGroup === 'senior') {
        if (pattern.ageModifiers.senior) {
          possibilities.push(...pattern.ageModifiers.senior);
        }
      }
    }
  }

  // Sort by likelihood (high first)
  const likelihoodOrder = { high: 0, moderate: 1, low: 2 };
  possibilities.sort((a, b) => likelihoodOrder[a.likelihood] - likelihoodOrder[b.likelihood]);

  // Return top 3 unique possibilities
  const uniquePossibilities: DifferentialPossibility[] = [];
  const seenNames = new Set<string>();

  for (const p of possibilities) {
    if (!seenNames.has(p.name) && uniquePossibilities.length < 3) {
      uniquePossibilities.push(p);
      seenNames.add(p.name);
    }
  }

  // If no specific matches, provide generic possibilities
  if (uniquePossibilities.length === 0) {
    uniquePossibilities.push({
      name: 'Various factors',
      description: 'Multiple factors could be contributing to your symptoms',
      likelihood: 'moderate',
      supportingFactors: ['Symptom pattern requires professional evaluation'],
      typicalPresentation: 'Symptoms may have multiple possible explanations',
    });
  }

  return uniquePossibilities;
}

/**
 * Build structured differential response for TriageResultCard
 */
export function buildDifferentialResponse(
  context: HealthContext,
  assessment: SafetyAssessment
): {
  primary: string;
  description: string;
  secondary?: { name: string; description: string }[];
} {
  const possibilities = generateDifferentialPossibilities(context, assessment);

  if (possibilities.length === 0) {
    return {
      primary: 'Further evaluation needed',
      description: 'Your symptoms require professional evaluation for accurate assessment',
    };
  }

  const primary = possibilities[0];
  const secondary = possibilities.slice(1).map(p => ({
    name: p.name,
    description: p.description,
  }));

  return {
    primary: primary.name,
    description: primary.description,
    secondary: secondary.length > 0 ? secondary : undefined,
  };
}

// ============================================
// URGENCY-SPECIFIC MESSAGES
// ============================================

export function getUrgencyMessage(urgency: UrgencyLevel): {
  title: string;
  message: string;
  actionLabel: string;
} {
  const messages: Record<UrgencyLevel, { title: string; message: string; actionLabel: string }> = {
    emergency: {
      title: 'Seek Emergency Care',
      message: 'Your symptoms require immediate medical attention. Please call 911 or go to the nearest emergency room.',
      actionLabel: 'Call Emergency Services',
    },
    urgent: {
      title: 'See a Doctor Today',
      message: 'Your symptoms should be evaluated by a healthcare provider today.',
      actionLabel: 'Find Urgent Care',
    },
    soon: {
      title: 'Schedule an Appointment',
      message: 'We recommend seeing a healthcare provider within the next 1-2 days.',
      actionLabel: 'Book Appointment',
    },
    non_urgent: {
      title: 'Consider a Check-up',
      message: 'While not urgent, a healthcare visit may be helpful when convenient.',
      actionLabel: 'Schedule When Ready',
    },
    monitor: {
      title: 'Monitor Your Symptoms',
      message: 'Keep track of your symptoms and watch for any changes.',
      actionLabel: 'Track Symptoms',
    },
    self_care: {
      title: 'Self-Care Recommended',
      message: 'Your symptoms can likely be managed at home with proper care.',
      actionLabel: 'View Self-Care Tips',
    },
  };

  return messages[urgency];
}

// ============================================
// DISCLAIMER
// ============================================

export function getDisclaimer(): string {
  return `Important: This guidance is for informational purposes only and is not a medical diagnosis. It does not replace professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition. If you think you may have a medical emergency, call your doctor, go to the emergency department, or call 911 immediately.`;
}

export function getShortDisclaimer(): string {
  return 'This is general guidance only, not a diagnosis. Please consult a healthcare provider for medical advice.';
}
