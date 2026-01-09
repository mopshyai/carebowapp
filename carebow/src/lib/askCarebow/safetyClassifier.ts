/**
 * Safety Classifier for Ask CareBow
 * Doctor-grade emergency detection and urgency assessment
 *
 * This module implements clinical-grade red flag detection including:
 * - Standard emergency patterns (cardiac, respiratory, neurological)
 * - Pediatric-specific red flags (infant fever, dehydration, etc.)
 * - Pregnancy-specific red flags (preeclampsia, bleeding, etc.)
 * - Age-based urgency modifiers
 */

import {
  HealthContext,
  UrgencyLevel,
  RED_FLAG_SYMPTOMS,
  Duration,
  Severity,
  AgeGroup,
} from '@/types/askCarebow';

// ============================================
// TYPES
// ============================================

export type RedFlagCategory =
  | 'cardiac'
  | 'respiratory'
  | 'neurological'
  | 'bleeding'
  | 'mental_health'
  | 'allergic'
  | 'trauma'
  | 'pediatric'
  | 'pregnancy'
  | 'infection'
  | 'dehydration';

export type RedFlagRule = {
  id: string;
  pattern: RegExp;
  category: RedFlagCategory;
  urgencyBoost: number;
  ageRestriction?: { min?: number; max?: number };
  requiresContext?: ('pregnancy' | 'infant' | 'child' | 'senior')[];
  immediateAction: string;
  description: string;
};

export type EmergencyCheckResult = {
  isEmergency: boolean;
  detectedSymptoms: string[];
  confidence: number;
  matchedRules: RedFlagRule[];
};

export type SafetyAssessment = {
  urgency: UrgencyLevel;
  reasoning: string[];
  redFlagsDetected: string[];
  riskFactors: string[];
  recommendSeeProfessional: boolean;
  ageModifierApplied: number;
  matchedRedFlagRules: RedFlagRule[];
};

// ============================================
// AGE-BASED URGENCY MODIFIERS
// ============================================

export const AGE_URGENCY_MODIFIERS: Record<AgeGroup, { score: number; reason: string }> = {
  infant: { score: 15, reason: 'Infants require heightened vigilance' },
  child: { score: 8, reason: 'Children may not accurately describe symptoms' },
  teen: { score: 0, reason: '' },
  adult: { score: 0, reason: '' },
  senior: { score: 12, reason: 'Seniors may have atypical symptom presentation' },
};

// Helper to calculate age from birthdate or direct age
export function getAgeGroupFromAge(age: number): AgeGroup {
  if (age < 1) return 'infant';
  if (age <= 12) return 'child';
  if (age <= 17) return 'teen';
  if (age <= 64) return 'adult';
  return 'senior';
}

// ============================================
// RED FLAG RULES - COMPREHENSIVE
// ============================================

export const RED_FLAG_RULES: RedFlagRule[] = [
  // ============================================
  // CARDIAC
  // ============================================
  {
    id: 'cardiac_chest_pain',
    pattern: /chest\s*(pain|tightness|pressure|discomfort)/i,
    category: 'cardiac',
    urgencyBoost: 50,
    immediateAction: 'Call emergency services immediately',
    description: 'Chest pain or tightness',
  },
  {
    id: 'cardiac_heart_attack',
    pattern: /heart\s*(attack|racing|pounding|palpitation)/i,
    category: 'cardiac',
    urgencyBoost: 50,
    immediateAction: 'Call emergency services immediately',
    description: 'Heart attack symptoms or severe palpitations',
  },
  {
    id: 'cardiac_arm_pain',
    pattern: /arm\s*(pain|numbness).*(left|chest)|left\s*arm.*(pain|numb)/i,
    category: 'cardiac',
    urgencyBoost: 45,
    immediateAction: 'Call emergency services immediately',
    description: 'Left arm pain or numbness (cardiac warning)',
  },

  // ============================================
  // RESPIRATORY
  // ============================================
  {
    id: 'respiratory_cant_breathe',
    pattern: /can('?t| not)\s*breathe|cannot\s*breathe/i,
    category: 'respiratory',
    urgencyBoost: 50,
    immediateAction: 'Call emergency services immediately',
    description: 'Unable to breathe',
  },
  {
    id: 'respiratory_severe_sob',
    pattern: /(severe|sudden|extreme)\s*shortness\s*of\s*breath/i,
    category: 'respiratory',
    urgencyBoost: 45,
    immediateAction: 'Seek immediate medical attention',
    description: 'Severe shortness of breath',
  },
  {
    id: 'respiratory_difficulty',
    pattern: /breathing\s*(very\s*)?(hard|difficult)|difficulty\s*breathing/i,
    category: 'respiratory',
    urgencyBoost: 40,
    immediateAction: 'Seek urgent medical attention',
    description: 'Difficulty breathing',
  },
  {
    id: 'respiratory_blue_lips',
    pattern: /(blue|purple|gray)\s*(lips|fingernails|skin)|cyanosis/i,
    category: 'respiratory',
    urgencyBoost: 50,
    immediateAction: 'Call emergency services immediately',
    description: 'Blue discoloration (oxygen deprivation)',
  },

  // ============================================
  // NEUROLOGICAL
  // ============================================
  {
    id: 'neuro_thunderclap_headache',
    pattern: /worst\s*headache|thunderclap\s*headache|sudden\s*severe\s*headache/i,
    category: 'neurological',
    urgencyBoost: 50,
    immediateAction: 'Call emergency services immediately',
    description: 'Worst headache of life (possible aneurysm)',
  },
  {
    id: 'neuro_stroke_signs',
    pattern: /face\s*(droop|drooping|numb)|slurred?\s*speech|speech\s*slur/i,
    category: 'neurological',
    urgencyBoost: 50,
    immediateAction: 'Call emergency services immediately - possible stroke',
    description: 'Stroke warning signs (FAST)',
  },
  {
    id: 'neuro_sudden_weakness',
    pattern: /sudden\s*(confusion|weakness|numbness|paralysis)/i,
    category: 'neurological',
    urgencyBoost: 50,
    immediateAction: 'Call emergency services immediately',
    description: 'Sudden neurological changes',
  },
  {
    id: 'neuro_loss_consciousness',
    pattern: /loss\s*of\s*(vision|consciousness)|passed\s*out|fainted|unconscious/i,
    category: 'neurological',
    urgencyBoost: 45,
    immediateAction: 'Seek immediate medical attention',
    description: 'Loss of consciousness or vision',
  },
  {
    id: 'neuro_seizure',
    pattern: /seizure|convulsion|fitting/i,
    category: 'neurological',
    urgencyBoost: 45,
    immediateAction: 'Ensure safety, call emergency services',
    description: 'Seizure activity',
  },
  {
    id: 'neuro_neck_stiffness_fever',
    pattern: /(stiff\s*neck|neck\s*stiff).*(fever|headache)|(fever|headache).*(stiff\s*neck|neck\s*stiff)/i,
    category: 'neurological',
    urgencyBoost: 50,
    immediateAction: 'Call emergency services - possible meningitis',
    description: 'Stiff neck with fever (meningitis warning)',
  },

  // ============================================
  // BLEEDING
  // ============================================
  {
    id: 'bleeding_severe',
    pattern: /(severe|heavy|uncontrolled|profuse)\s*bleeding/i,
    category: 'bleeding',
    urgencyBoost: 50,
    immediateAction: 'Apply direct pressure, call emergency services',
    description: 'Severe or uncontrolled bleeding',
  },
  {
    id: 'bleeding_blood_vomit',
    pattern: /blood\s*(in|from)\s*(vomit|stomach)|vomit(ing)?\s*blood|hematemesis/i,
    category: 'bleeding',
    urgencyBoost: 45,
    immediateAction: 'Seek immediate medical attention',
    description: 'Vomiting blood',
  },
  {
    id: 'bleeding_blood_stool',
    pattern: /blood\s*(in|from)\s*(stool|bowel)|bloody\s*(stool|diarrhea)|melena/i,
    category: 'bleeding',
    urgencyBoost: 40,
    immediateAction: 'Seek urgent medical attention',
    description: 'Blood in stool',
  },
  {
    id: 'bleeding_coughing_blood',
    pattern: /coughing\s*(up\s*)?blood|hemoptysis/i,
    category: 'bleeding',
    urgencyBoost: 45,
    immediateAction: 'Seek immediate medical attention',
    description: 'Coughing up blood',
  },

  // ============================================
  // MENTAL HEALTH
  // ============================================
  {
    id: 'mental_suicidal',
    pattern: /(want|going|plan(ning)?)\s*to\s*(kill|hurt|end)\s*(myself|my\s*life|self)|suicid(e|al)/i,
    category: 'mental_health',
    urgencyBoost: 50,
    immediateAction: 'Please call or text 988 (Suicide & Crisis Lifeline) now, or go to your nearest emergency room. You are not alone, and help is available 24/7.',
    description: 'Suicidal ideation',
  },
  {
    id: 'mental_self_harm',
    pattern: /self[- ]harm|cutting\s*(myself|self)|hurt(ing)?\s*myself/i,
    category: 'mental_health',
    urgencyBoost: 45,
    immediateAction: 'Please call or text 988 (Suicide & Crisis Lifeline) now. You deserve support, and trained counselors are available 24/7 to help.',
    description: 'Self-harm',
  },
  {
    id: 'mental_overdose',
    pattern: /overdos(e|ed|ing)|took\s*too\s*many\s*(pills|medication)/i,
    category: 'mental_health',
    urgencyBoost: 50,
    immediateAction: 'Call 911 or Poison Control (1-800-222-1222) immediately. If this was intentional, also call or text 988 (Suicide & Crisis Lifeline). Do not wait — help is available now.',
    description: 'Overdose',
  },

  // ============================================
  // ALLERGIC REACTION
  // ============================================
  {
    id: 'allergic_throat',
    pattern: /throat\s*(closing|swelling|tight|swollen)|swollen\s*throat/i,
    category: 'allergic',
    urgencyBoost: 50,
    immediateAction: 'Use epinephrine if available, call emergency services',
    description: 'Throat swelling (anaphylaxis)',
  },
  {
    id: 'allergic_cant_swallow',
    pattern: /can('?t| not)\s*swallow|cannot\s*swallow/i,
    category: 'allergic',
    urgencyBoost: 50,
    immediateAction: 'Call emergency services immediately',
    description: 'Unable to swallow',
  },
  {
    id: 'allergic_anaphylaxis',
    pattern: /anaphyla(xis|ctic)|severe\s*allergic\s*reaction/i,
    category: 'allergic',
    urgencyBoost: 50,
    immediateAction: 'Use epinephrine if available, call emergency services',
    description: 'Anaphylaxis',
  },

  // ============================================
  // TRAUMA
  // ============================================
  {
    id: 'trauma_head_severe',
    pattern: /(severe|serious)\s*head\s*(injury|trauma)|head\s*(injury|trauma)/i,
    category: 'trauma',
    urgencyBoost: 45,
    immediateAction: 'Seek immediate medical attention',
    description: 'Head injury',
  },
  {
    id: 'trauma_hit_head',
    pattern: /hit\s*(my\s*)?head\s*(hard|badly)|fell\s*(on|and\s*hit)\s*(my\s*)?head/i,
    category: 'trauma',
    urgencyBoost: 35,
    immediateAction: 'Monitor for concussion symptoms, seek medical evaluation',
    description: 'Hit head',
  },
  {
    id: 'trauma_major',
    pattern: /major\s*(accident|injury|trauma)|serious\s*accident/i,
    category: 'trauma',
    urgencyBoost: 45,
    immediateAction: 'Call emergency services',
    description: 'Major accident or injury',
  },

  // ============================================
  // PEDIATRIC - INFANT SPECIFIC (age < 1)
  // ============================================
  {
    id: 'peds_infant_fever_any',
    pattern: /fever|temperature|hot/i,
    category: 'pediatric',
    urgencyBoost: 50,
    requiresContext: ['infant'],
    ageRestriction: { max: 0.25 }, // Under 3 months
    immediateAction: 'Any fever in infant under 3 months requires immediate medical attention',
    description: 'Fever in infant under 3 months',
  },
  {
    id: 'peds_infant_fever_high',
    pattern: /fever\s*(over|above|greater\s*than)?\s*(104|105|106)|high\s*fever|104\s*f|40\s*c/i,
    category: 'pediatric',
    urgencyBoost: 45,
    requiresContext: ['infant', 'child'],
    immediateAction: 'High fever in child requires urgent medical attention',
    description: 'High fever (over 104°F) in child',
  },
  {
    id: 'peds_not_feeding',
    pattern: /(not|won'?t|refuse|refusing)\s*(eat|feed|drink|nursing|bottle)|not\s*feed(ing)?/i,
    category: 'pediatric',
    urgencyBoost: 40,
    requiresContext: ['infant', 'child'],
    immediateAction: 'Refusing food/drink may indicate serious illness',
    description: 'Not eating or drinking',
  },
  {
    id: 'peds_wet_diapers',
    pattern: /(no|few(er)?|less)\s*(wet\s*)?(diaper|nappy)|dry\s*diaper|not\s*(wet|urinating)/i,
    category: 'dehydration',
    urgencyBoost: 45,
    requiresContext: ['infant', 'child'],
    immediateAction: 'Fewer than 3 wet diapers in 24 hours indicates dehydration',
    description: 'Decreased wet diapers (dehydration)',
  },
  {
    id: 'peds_inconsolable',
    pattern: /inconsolable|won'?t\s*stop\s*crying|constant\s*crying|screaming|high[- ]pitch(ed)?\s*cry/i,
    category: 'pediatric',
    urgencyBoost: 40,
    requiresContext: ['infant', 'child'],
    immediateAction: 'Inconsolable crying may indicate pain or serious illness',
    description: 'Inconsolable crying',
  },
  {
    id: 'peds_lethargy',
    pattern: /lethargi(c|y)|difficult\s*to\s*wake|hard\s*to\s*arouse|limp|floppy|unresponsive/i,
    category: 'pediatric',
    urgencyBoost: 50,
    requiresContext: ['infant', 'child'],
    immediateAction: 'Lethargy in child requires immediate medical attention',
    description: 'Lethargy or difficult to wake',
  },
  {
    id: 'peds_blue_baby',
    pattern: /(blue|purple|gray)\s*(lips|fingernails|skin|around\s*mouth)/i,
    category: 'pediatric',
    urgencyBoost: 50,
    requiresContext: ['infant', 'child'],
    immediateAction: 'Blue discoloration indicates oxygen deprivation - call emergency',
    description: 'Blue discoloration in child',
  },
  {
    id: 'peds_fontanelle',
    pattern: /(bulg|sunk)(ing|en)?\s*(soft\s*spot|fontanel)/i,
    category: 'pediatric',
    urgencyBoost: 50,
    requiresContext: ['infant'],
    immediateAction: 'Bulging fontanelle may indicate increased brain pressure',
    description: 'Bulging or sunken fontanelle',
  },
  {
    id: 'peds_rash_fever',
    pattern: /rash.*(fever|petechial)|fever.*rash|purple\s*(spot|rash)|petechial/i,
    category: 'pediatric',
    urgencyBoost: 50,
    requiresContext: ['infant', 'child'],
    immediateAction: 'Rash with fever may indicate serious infection - seek immediate care',
    description: 'Rash with fever in child',
  },
  {
    id: 'peds_breathing_fast',
    pattern: /(rapid|fast|quick)\s*breath(ing)?|breath(ing)?\s*(fast|rapid)/i,
    category: 'pediatric',
    urgencyBoost: 40,
    requiresContext: ['infant', 'child'],
    immediateAction: 'Rapid breathing in child requires medical evaluation',
    description: 'Rapid breathing in child',
  },
  {
    id: 'peds_rib_retractions',
    pattern: /rib\s*retraction|chest\s*(retraction|indraw|caving)|sucking\s*in\s*(chest|ribs)/i,
    category: 'pediatric',
    urgencyBoost: 45,
    requiresContext: ['infant', 'child'],
    immediateAction: 'Chest retractions indicate breathing difficulty - seek immediate care',
    description: 'Chest/rib retractions (breathing difficulty)',
  },

  // ============================================
  // PREGNANCY SPECIFIC
  // ============================================
  {
    id: 'preg_vaginal_bleeding',
    pattern: /vaginal\s*bleed(ing)?|bleed(ing)?\s*(from\s*)?vagina|spotting.*pregnan/i,
    category: 'pregnancy',
    urgencyBoost: 50,
    requiresContext: ['pregnancy'],
    immediateAction: 'Vaginal bleeding during pregnancy requires immediate evaluation',
    description: 'Vaginal bleeding in pregnancy',
  },
  {
    id: 'preg_preeclampsia',
    pattern: /(severe\s*)?headache.*(vision|swelling|pregnant)|vision\s*change.*(pregnant|headache)|preeclampsia/i,
    category: 'pregnancy',
    urgencyBoost: 50,
    requiresContext: ['pregnancy'],
    immediateAction: 'Signs of preeclampsia - seek immediate medical attention',
    description: 'Preeclampsia warning signs',
  },
  {
    id: 'preg_decreased_movement',
    pattern: /(decreas|less|no|reduced)\s*(fetal\s*)?movement|baby\s*(not|stop)\s*moving/i,
    category: 'pregnancy',
    urgencyBoost: 45,
    requiresContext: ['pregnancy'],
    immediateAction: 'Decreased fetal movement requires urgent evaluation',
    description: 'Decreased fetal movement',
  },
  {
    id: 'preg_leaking_fluid',
    pattern: /(leaking|gush)\s*(amniotic\s*)?fluid|water\s*(broke|breaking|leak)/i,
    category: 'pregnancy',
    urgencyBoost: 40,
    requiresContext: ['pregnancy'],
    immediateAction: 'Possible rupture of membranes - contact healthcare provider',
    description: 'Leaking fluid in pregnancy',
  },
  {
    id: 'preg_severe_swelling',
    pattern: /severe\s*swelling|sudden\s*swelling|face\s*swelling.*pregnant/i,
    category: 'pregnancy',
    urgencyBoost: 45,
    requiresContext: ['pregnancy'],
    immediateAction: 'Sudden or severe swelling may indicate preeclampsia',
    description: 'Severe swelling in pregnancy',
  },
  {
    id: 'preg_abdominal_pain',
    pattern: /severe\s*(abdominal|stomach|belly)\s*pain.*pregnan|pregnan.*severe\s*(abdominal|stomach|belly)\s*pain/i,
    category: 'pregnancy',
    urgencyBoost: 50,
    requiresContext: ['pregnancy'],
    immediateAction: 'Severe abdominal pain in pregnancy requires immediate evaluation',
    description: 'Severe abdominal pain in pregnancy',
  },
  {
    id: 'preg_contractions_early',
    pattern: /(preterm|early)\s*contraction|contraction.*before\s*(37|due)/i,
    category: 'pregnancy',
    urgencyBoost: 45,
    requiresContext: ['pregnancy'],
    immediateAction: 'Preterm contractions require immediate evaluation',
    description: 'Preterm contractions',
  },

  // ============================================
  // SENIOR SPECIFIC
  // ============================================
  {
    id: 'senior_fall',
    pattern: /fall|fell\s*down/i,
    category: 'trauma',
    urgencyBoost: 35,
    requiresContext: ['senior'],
    immediateAction: 'Falls in seniors require evaluation for fractures and head injury',
    description: 'Fall in elderly person',
  },
  {
    id: 'senior_confusion_sudden',
    pattern: /sudden\s*confusion|acute\s*confusion|delirium|not\s*making\s*sense/i,
    category: 'neurological',
    urgencyBoost: 45,
    requiresContext: ['senior'],
    immediateAction: 'Sudden confusion in elderly may indicate stroke, infection, or other emergency',
    description: 'Sudden confusion in elderly',
  },

  // ============================================
  // INFECTION
  // ============================================
  {
    id: 'infection_sepsis',
    pattern: /sepsis|septic|blood\s*poisoning/i,
    category: 'infection',
    urgencyBoost: 50,
    immediateAction: 'Sepsis is life-threatening - call emergency services',
    description: 'Sepsis',
  },
  {
    id: 'infection_high_fever_adult',
    pattern: /fever\s*(over|above)?\s*(103|104|105)|103\s*(degree|f)/i,
    category: 'infection',
    urgencyBoost: 35,
    immediateAction: 'High fever requires medical evaluation',
    description: 'High fever (over 103°F)',
  },
];

// Legacy pattern array for backwards compatibility
const RED_FLAG_PATTERNS = RED_FLAG_RULES.filter(r => !r.requiresContext).map(r => ({
  pattern: r.pattern,
  category: r.category,
}));

// ============================================
// HIGH RISK CONDITIONS
// ============================================

const HIGH_RISK_CONDITIONS = [
  'diabetes',
  'heart disease',
  'heart condition',
  'high blood pressure',
  'hypertension',
  'asthma',
  'copd',
  'cancer',
  'immunocompromised',
  'hiv',
  'aids',
  'kidney disease',
  'liver disease',
  'pregnancy',
  'pregnant',
];

// ============================================
// CONTEXT DETECTION HELPERS
// ============================================

type PatientContext = {
  isPregnant: boolean;
  isInfant: boolean;
  isChild: boolean;
  isSenior: boolean;
  ageInYears?: number;
};

/**
 * Extracts patient context from health context for rule matching
 */
export function extractPatientContext(context: HealthContext): PatientContext {
  const isPregnant = context.chronicConditions.some(c =>
    /pregnan/i.test(c)
  ) || context.riskFactors.some(r => /pregnan/i.test(r));

  const ageGroup = context.ageGroup;

  return {
    isPregnant,
    isInfant: ageGroup === 'infant',
    isChild: ageGroup === 'child',
    isSenior: ageGroup === 'senior',
  };
}

/**
 * Checks if a rule should be applied based on patient context
 */
function shouldApplyRule(rule: RedFlagRule, patientContext: PatientContext): boolean {
  // If rule has no context requirements, it applies to everyone
  if (!rule.requiresContext || rule.requiresContext.length === 0) {
    return true;
  }

  // Rule requires specific context - check if ANY required context matches
  return rule.requiresContext.some(ctx => {
    switch (ctx) {
      case 'pregnancy':
        return patientContext.isPregnant;
      case 'infant':
        return patientContext.isInfant;
      case 'child':
        return patientContext.isChild || patientContext.isInfant;
      case 'senior':
        return patientContext.isSenior;
      default:
        return false;
    }
  });
}

// ============================================
// EMERGENCY DETECTION
// ============================================

/**
 * Basic emergency detection without patient context
 * Use detectEmergencyWithContext for full accuracy
 */
export function detectEmergency(text: string): EmergencyCheckResult {
  return detectEmergencyWithContext(text, {
    isPregnant: false,
    isInfant: false,
    isChild: false,
    isSenior: false,
  });
}

/**
 * Enhanced emergency detection with patient context
 * This enables pediatric, pregnancy, and senior-specific red flags
 */
export function detectEmergencyWithContext(
  text: string,
  patientContext: PatientContext
): EmergencyCheckResult {
  const normalizedText = text.toLowerCase();
  const detectedSymptoms: string[] = [];
  const matchedRules: RedFlagRule[] = [];

  // Check against RED_FLAG_SYMPTOMS array (legacy)
  for (const symptom of RED_FLAG_SYMPTOMS) {
    if (normalizedText.includes(symptom.toLowerCase())) {
      if (!detectedSymptoms.includes(symptom)) {
        detectedSymptoms.push(symptom);
      }
    }
  }

  // Check against enhanced RED_FLAG_RULES with context awareness
  for (const rule of RED_FLAG_RULES) {
    // Skip rules that don't apply to this patient's context
    if (!shouldApplyRule(rule, patientContext)) {
      continue;
    }

    if (rule.pattern.test(normalizedText)) {
      const match = normalizedText.match(rule.pattern);
      if (match) {
        const symptomDesc = rule.description;
        if (!detectedSymptoms.includes(symptomDesc)) {
          detectedSymptoms.push(symptomDesc);
        }
        if (!matchedRules.find(r => r.id === rule.id)) {
          matchedRules.push(rule);
        }
      }
    }
  }

  // Calculate confidence based on number, type, and severity of matches
  let confidence = 0;
  if (matchedRules.length > 0) {
    // Weight by urgency boost of matched rules
    const maxUrgency = Math.max(...matchedRules.map(r => r.urgencyBoost));
    const urgencyWeight = maxUrgency / 50; // Normalize to 0-1
    confidence = Math.min(0.5 + (matchedRules.length * 0.15) + (urgencyWeight * 0.3), 1.0);
  } else if (detectedSymptoms.length > 0) {
    confidence = Math.min(detectedSymptoms.length * 0.3 + 0.5, 1.0);
  }

  return {
    isEmergency: detectedSymptoms.length > 0 || matchedRules.length > 0,
    detectedSymptoms,
    confidence,
    matchedRules,
  };
}

// ============================================
// URGENCY ASSESSMENT
// ============================================

/**
 * Comprehensive urgency assessment with:
 * - Context-aware red flag detection (pediatric, pregnancy, senior)
 * - Age-based urgency modifiers
 * - Severity and duration factoring
 * - Risk factor analysis
 */
export function assessUrgency(context: HealthContext): SafetyAssessment {
  const reasoning: string[] = [];
  const redFlagsDetected: string[] = [];
  const riskFactors: string[] = [];
  const matchedRedFlagRules: RedFlagRule[] = [];

  let urgencyScore = 0;
  let ageModifierApplied = 0;

  // Extract patient context for context-aware detection
  const patientContext = extractPatientContext(context);

  // Combine all symptom text for comprehensive checking
  const allSymptomText = [
    context.primarySymptom,
    ...context.associatedSymptoms,
    context.additionalNotes,
  ].join(' ');

  // Check primary symptom for red flags (with context awareness)
  const emergencyCheck = detectEmergencyWithContext(
    context.primarySymptom,
    patientContext
  );
  if (emergencyCheck.isEmergency) {
    redFlagsDetected.push(...emergencyCheck.detectedSymptoms);
    matchedRedFlagRules.push(...emergencyCheck.matchedRules);

    // Use the highest urgency boost from matched rules
    const maxBoost = emergencyCheck.matchedRules.length > 0
      ? Math.max(...emergencyCheck.matchedRules.map(r => r.urgencyBoost))
      : 50;
    urgencyScore += maxBoost;
    reasoning.push('Primary symptom contains concerning indicators');
  }

  // Check associated symptoms
  for (const symptom of context.associatedSymptoms) {
    const check = detectEmergencyWithContext(symptom, patientContext);
    if (check.isEmergency) {
      // Add only new symptoms
      for (const s of check.detectedSymptoms) {
        if (!redFlagsDetected.includes(s)) {
          redFlagsDetected.push(s);
        }
      }
      // Add only new rules
      for (const r of check.matchedRules) {
        if (!matchedRedFlagRules.find(mr => mr.id === r.id)) {
          matchedRedFlagRules.push(r);
        }
      }
      urgencyScore += 30;
      reasoning.push(`Associated symptom "${symptom}" is concerning`);
    }
  }

  // Check additional notes for red flags
  if (context.additionalNotes) {
    const notesCheck = detectEmergencyWithContext(context.additionalNotes, patientContext);
    if (notesCheck.isEmergency) {
      for (const s of notesCheck.detectedSymptoms) {
        if (!redFlagsDetected.includes(s)) {
          redFlagsDetected.push(s);
        }
      }
      for (const r of notesCheck.matchedRules) {
        if (!matchedRedFlagRules.find(mr => mr.id === r.id)) {
          matchedRedFlagRules.push(r);
        }
      }
      urgencyScore += 20;
      reasoning.push('Additional notes contain concerning indicators');
    }
  }

  // ============================================
  // AGE-BASED URGENCY MODIFIERS (NEW)
  // ============================================
  if (context.ageGroup) {
    const ageModifier = AGE_URGENCY_MODIFIERS[context.ageGroup];
    if (ageModifier.score > 0) {
      ageModifierApplied = ageModifier.score;
      urgencyScore += ageModifier.score;
      riskFactors.push(`Age group: ${context.ageGroup}`);
      reasoning.push(ageModifier.reason);
    }
  }

  // ============================================
  // PREGNANCY MODIFIER
  // ============================================
  if (patientContext.isPregnant) {
    // Pregnancy always elevates urgency
    urgencyScore += 15;
    riskFactors.push('Pregnancy');
    reasoning.push('Pregnancy requires heightened caution with symptoms');
  }

  // Factor in severity
  if (context.severity) {
    if (context.severity >= 9) {
      urgencyScore += 25;
      reasoning.push('Severity rated as very high (9-10)');
    } else if (context.severity >= 7) {
      urgencyScore += 15;
      reasoning.push('Severity rated as high (7-8)');
    } else if (context.severity >= 5) {
      urgencyScore += 8;
      reasoning.push('Severity rated as moderate (5-6)');
    }
  }

  // Factor in duration
  if (context.duration) {
    const durationUrgency = getDurationUrgencyModifier(context.duration, context.severity);
    urgencyScore += durationUrgency.score;
    if (durationUrgency.reason) {
      reasoning.push(durationUrgency.reason);
    }
  }

  // Factor in frequency
  if (context.frequency === 'constant') {
    urgencyScore += 10;
    reasoning.push('Symptoms are constant');
  }

  // Factor in chronic conditions (beyond pregnancy which is handled above)
  for (const condition of context.chronicConditions) {
    const normalizedCondition = condition.toLowerCase();
    // Skip pregnancy as it's already handled
    if (/pregnan/i.test(normalizedCondition)) continue;

    for (const highRisk of HIGH_RISK_CONDITIONS) {
      if (normalizedCondition.includes(highRisk)) {
        riskFactors.push(condition);
        urgencyScore += 10;
        reasoning.push(`Pre-existing condition: ${condition}`);
        break;
      }
    }
  }

  // Determine urgency level
  const urgency = calculateUrgencyLevel(urgencyScore, redFlagsDetected.length);

  return {
    urgency,
    reasoning,
    redFlagsDetected: [...new Set(redFlagsDetected)], // Remove duplicates
    riskFactors,
    recommendSeeProfessional: urgencyScore >= 20,
    ageModifierApplied,
    matchedRedFlagRules,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function getDurationUrgencyModifier(
  duration: Duration,
  severity?: Severity
): { score: number; reason?: string } {
  // Acute onset with high severity is more urgent
  if (duration === 'just_now' && severity && severity >= 7) {
    return {
      score: 15,
      reason: 'Sudden onset with high severity',
    };
  }

  // Chronic with sudden worsening
  if (duration === 'chronic' && severity && severity >= 7) {
    return {
      score: 12,
      reason: 'Chronic condition with sudden worsening',
    };
  }

  // Very recent symptoms
  if (duration === 'just_now' || duration === 'few_hours') {
    return { score: 5 };
  }

  // Persistent symptoms over time
  if (duration === '1_2_weeks' || duration === 'more_than_2_weeks') {
    return {
      score: 8,
      reason: 'Symptoms persisting for an extended period',
    };
  }

  return { score: 0 };
}

function calculateUrgencyLevel(score: number, redFlagCount: number): UrgencyLevel {
  // Any red flag detection = at minimum urgent
  if (redFlagCount > 0) {
    if (score >= 50) return 'emergency';
    return 'urgent';
  }

  // Score-based assessment
  if (score >= 50) return 'emergency';
  if (score >= 40) return 'urgent';
  if (score >= 30) return 'soon';
  if (score >= 20) return 'non_urgent';
  if (score >= 10) return 'monitor';
  return 'self_care';
}

// ============================================
// SYMPTOM CONTEXT ANALYZER
// ============================================

// ============================================
// CRISIS RESOURCES (P0-1 FIX)
// ============================================

/**
 * Crisis resource text for self-harm, suicide, and overdose situations.
 * These MUST appear in assistant responses, not just metadata.
 */
export const CRISIS_RESOURCES = {
  suicide_crisis: `If you're in the U.S., call or text 988 (Suicide & Crisis Lifeline). You are not alone, and trained counselors are available 24/7.`,
  self_harm: `If you're in the U.S., call or text 988 (Suicide & Crisis Lifeline). You deserve support, and help is available.`,
  overdose: `Call 911 immediately. If in the U.S., you can also call Poison Control at 1-800-222-1222. If this was intentional, also call or text 988 (Suicide & Crisis Lifeline).`,
  immediate_danger: `If you or someone else is in immediate danger, please call 911 now.`,
} as const;

export type CrisisType = 'suicide' | 'self_harm' | 'overdose' | 'none';

/**
 * Detects if text contains crisis indicators (self-harm, suicide, overdose)
 * Returns the type of crisis detected for appropriate resource matching
 */
export function detectCrisisType(text: string): CrisisType {
  const normalizedText = text.toLowerCase();

  // Check for suicide ideation
  if (/(want|going|plan(ning)?)\s*to\s*(kill|hurt|end)\s*(myself|my\s*life|self)|suicid(e|al)/i.test(normalizedText)) {
    return 'suicide';
  }

  // Check for self-harm
  if (/self[- ]harm|cutting\s*(myself|self)|hurt(ing)?\s*myself/i.test(normalizedText)) {
    return 'self_harm';
  }

  // Check for overdose
  if (/overdos(e|ed|ing)|took\s*too\s*many\s*(pills|medication)/i.test(normalizedText)) {
    return 'overdose';
  }

  return 'none';
}

/**
 * Formats crisis resources for inclusion in assistant response.
 * This is the TEXT that should appear in the assistant's message.
 */
export function formatCrisisResponse(crisisType: CrisisType, includeImmediateDanger: boolean = false): string {
  if (crisisType === 'none') return '';

  let response = '';

  // Add immediate danger instruction if needed
  if (includeImmediateDanger) {
    response += CRISIS_RESOURCES.immediate_danger + '\n\n';
  }

  // Add crisis-specific resources
  switch (crisisType) {
    case 'suicide':
      response += CRISIS_RESOURCES.suicide_crisis;
      break;
    case 'self_harm':
      response += CRISIS_RESOURCES.self_harm;
      break;
    case 'overdose':
      response += CRISIS_RESOURCES.overdose;
      break;
  }

  return response;
}

// ============================================
// SYMPTOM CONTEXT ANALYZER
// ============================================

export function analyzeSymptomContext(
  primarySymptom: string,
  associatedSymptoms: string[]
): {
  possibleCategories: string[];
  severityIndicators: string[];
  suggestedQuestions: string[];
} {
  const allSymptoms = [primarySymptom, ...associatedSymptoms].join(' ').toLowerCase();
  const possibleCategories: string[] = [];
  const severityIndicators: string[] = [];
  const suggestedQuestions: string[] = [];

  // Categorize symptoms
  if (/head|migraine|dizzy|vertigo/.test(allSymptoms)) {
    possibleCategories.push('neurological');
    suggestedQuestions.push('Do you have any vision changes or light sensitivity?');
  }

  if (/stomach|nausea|vomit|diarrhea|abdomen|belly/.test(allSymptoms)) {
    possibleCategories.push('gastrointestinal');
    suggestedQuestions.push('Have you noticed any changes in your appetite?');
  }

  if (/cough|cold|flu|fever|throat|sinus/.test(allSymptoms)) {
    possibleCategories.push('respiratory/infectious');
    suggestedQuestions.push('Have you been around anyone who was sick recently?');
  }

  if (/skin|rash|itch|bump|swelling/.test(allSymptoms)) {
    possibleCategories.push('dermatological');
    suggestedQuestions.push('Has the affected area changed in size or appearance?');
  }

  if (/joint|muscle|back|knee|shoulder|pain/.test(allSymptoms)) {
    possibleCategories.push('musculoskeletal');
    suggestedQuestions.push('Did this start after any physical activity or injury?');
  }

  // Detect severity indicators
  const severityWords = [
    'severe', 'intense', 'unbearable', 'worst', 'extreme',
    'terrible', 'excruciating', 'sharp', 'stabbing'
  ];

  for (const word of severityWords) {
    if (allSymptoms.includes(word)) {
      severityIndicators.push(word);
    }
  }

  return {
    possibleCategories,
    severityIndicators,
    suggestedQuestions,
  };
}
