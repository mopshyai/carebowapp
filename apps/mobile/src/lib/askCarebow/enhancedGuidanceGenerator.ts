/**
 * Enhanced Guidance Generator
 * Combines all databases to generate comprehensive health guidance
 *
 * This is the main entry point for generating guidance responses
 * that include home remedies, Ayurvedic recommendations, OTC suggestions,
 * seasonal advice, and service recommendations.
 */

import { HealthContext, UrgencyLevel, MemberProfile } from '@/types/askCarebow';
import { SafetyAssessment } from './safetyClassifier';

// Import databases
import {
  HOME_REMEDIES_DB,
  searchRemediesBySymptom,
  getTopRemedies,
  filterRemediesForProfile,
  HomeRemedy,
  ConditionRemedies,
} from './databases/homeRemedies';

import {
  AYURVEDIC_FORMULATIONS,
  SEASONAL_RECOMMENDATIONS,
  LIFESTYLE_RECOMMENDATIONS,
  getFormulationsForConcern,
  getCurrentSeason,
  getCurrentSeasonalRecommendations,
  filterFormulationsForProfile,
  AyurvedicFormulation,
  SeasonalRecommendation,
} from './databases/ayurvedicRemedies';

import {
  OTC_DATABASE,
  OTC_DISCLAIMER,
  ELDERLY_OTC_CONSIDERATIONS,
  getOTCForSymptom,
  filterOTCForProfile,
  getPriorityOTC,
  OTCCategory,
  OTCMedication,
} from './databases/otcSuggestions';

import {
  SERVICE_CATALOG,
  getCarePathway,
  getServiceById,
  urgencyToTriageLevel,
  CarePathwayResult,
  ServiceRecommendation,
  TriageLevel,
} from './databases/carePathwayRouting';

// ============================================
// TYPES
// ============================================

export interface EnhancedGuidanceResult {
  // Summary
  summary: {
    title: string;
    explanation: string;
    reassurance?: string;
  };

  // Triage
  triage: {
    level: TriageLevel;
    urgencyLevel: UrgencyLevel;
    displayTitle: string;
    displayDescription: string;
    displayColor: string;
    timeframe: string;
  };

  // Home Remedies
  homeRemedies: {
    condition: string;
    conditionHindi: string;
    remedies: HomeRemedy[];
    lifestyleAdvice: string[];
    warningSignsToWatch: string[];
  } | null;

  // Ayurvedic Recommendations
  ayurvedic: {
    formulations: AyurvedicFormulation[];
    seasonalRecommendations: SeasonalRecommendation;
    lifestyleTips: string[];
  } | null;

  // OTC Suggestions
  otc: {
    category: OTCCategory | null;
    medications: OTCMedication[];
    disclaimer: string;
    elderlyNote?: string;
  } | null;

  // Service Recommendations
  services: {
    primaryRecommendations: ServiceRecommendation[];
    secondaryRecommendations: ServiceRecommendation[];
    escalationNote?: string;
  };

  // Warning Signs
  warningSignsToWatch: string[];

  // Follow-up
  followUp: {
    checkInTime: string;
    message: string;
  };

  // Disclaimer
  disclaimer: string;
}

export interface GuidanceOptions {
  includeHomeRemedies?: boolean;
  includeAyurvedic?: boolean;
  includeOTC?: boolean;
  includeServices?: boolean;
  maxRemedies?: number;
  maxFormulations?: number;
  maxOTCMedications?: number;
}

const DEFAULT_OPTIONS: GuidanceOptions = {
  includeHomeRemedies: true,
  includeAyurvedic: true,
  includeOTC: true,
  includeServices: true,
  maxRemedies: 4,
  maxFormulations: 2,
  maxOTCMedications: 2,
};

// ============================================
// PROFILE EXTRACTION
// ============================================

interface ExtractedProfile {
  age?: number;
  isPregnant: boolean;
  isDiabetic: boolean;
  hasHeartCondition: boolean;
  hasKidneyDisease: boolean;
  hasLiverDisease: boolean;
  hasThyroid: boolean;
  hasAutoimmune: boolean;
  isOnBloodThinners: boolean;
  conditions: string[];
  allergies: string[];
}

function extractProfile(memberProfile?: MemberProfile, healthContext?: HealthContext): ExtractedProfile {
  const conditions = [
    ...(memberProfile?.conditions || []),
    ...(healthContext?.chronicConditions || []),
  ].map(c => c.toLowerCase());

  const allergies = [
    ...(memberProfile?.allergies || []),
    ...(healthContext?.allergies || []),
  ].map(a => a.toLowerCase());

  return {
    age: memberProfile?.age,
    isPregnant: conditions.some(c => c.includes('pregnant') || c.includes('pregnancy')),
    isDiabetic: conditions.some(c => c.includes('diabetes') || c.includes('diabetic')),
    hasHeartCondition: conditions.some(c =>
      c.includes('heart') || c.includes('cardiac') || c.includes('hypertension') || c.includes('bp')
    ),
    hasKidneyDisease: conditions.some(c => c.includes('kidney') || c.includes('renal')),
    hasLiverDisease: conditions.some(c => c.includes('liver') || c.includes('hepat')),
    hasThyroid: conditions.some(c => c.includes('thyroid')),
    hasAutoimmune: conditions.some(c =>
      c.includes('autoimmune') || c.includes('lupus') || c.includes('rheumatoid')
    ),
    isOnBloodThinners: conditions.some(c =>
      c.includes('blood thinner') || c.includes('warfarin') || c.includes('aspirin')
    ),
    conditions,
    allergies,
  };
}

// ============================================
// SUMMARY GENERATION
// ============================================

function generateSummary(
  healthContext: HealthContext,
  assessment: SafetyAssessment,
  triageLevel: TriageLevel
): EnhancedGuidanceResult['summary'] {
  const { primarySymptom, duration, severity } = healthContext;

  let title = '';
  let explanation = '';
  let reassurance: string | undefined;

  // Generate title based on what we can assess
  if (triageLevel === 'emergency') {
    title = 'Seek Emergency Care Immediately';
    explanation = `Based on what you've described, your symptoms require immediate medical attention.`;
  } else if (triageLevel === 'urgent') {
    title = 'Please See a Doctor Today';
    explanation = `Your symptoms indicate you should be evaluated by a healthcare professional soon.`;
  } else if (triageLevel === 'consult') {
    title = 'Doctor Consultation Recommended';
    explanation = `Based on ${primarySymptom ? `your ${primarySymptom.toLowerCase()}` : 'what you described'}${duration ? ` over ${formatDuration(duration)}` : ''}, it would be good to have this evaluated.`;
  } else if (triageLevel === 'monitor') {
    title = 'Monitor Your Symptoms';
    explanation = `This appears manageable with care, but please watch for any changes.`;
    reassurance = 'Most people with similar symptoms improve with rest and home care.';
  } else {
    title = 'Self-Care Recommended';
    explanation = `Based on what you've shared, this can likely be managed at home.`;
    reassurance = 'These symptoms are common and usually resolve with proper rest and care.';
  }

  return { title, explanation, reassurance };
}

function formatDuration(duration: string): string {
  const durationMap: Record<string, string> = {
    just_now: 'a short time',
    few_hours: 'a few hours',
    today: 'today',
    '1_2_days': '1-2 days',
    '3_7_days': 'about a week',
    '1_2_weeks': '1-2 weeks',
    more_than_2_weeks: 'more than 2 weeks',
    chronic: 'an extended period',
  };
  return durationMap[duration] || 'some time';
}

// ============================================
// HOME REMEDIES GENERATION
// ============================================

function generateHomeRemedies(
  healthContext: HealthContext,
  profile: ExtractedProfile,
  triageLevel: TriageLevel,
  maxRemedies: number
): EnhancedGuidanceResult['homeRemedies'] {
  // Don't show remedies for emergency/urgent
  if (triageLevel === 'emergency' || triageLevel === 'urgent') {
    return null;
  }

  const symptom = healthContext.primarySymptom.toLowerCase();
  const conditionMatches = searchRemediesBySymptom(symptom);

  if (conditionMatches.length === 0) {
    return null;
  }

  const primaryCondition = conditionMatches[0];
  let remedies = [...primaryCondition.remedies];

  // Filter based on profile
  remedies = filterRemediesForProfile(remedies, {
    age: profile.age,
    isPregnant: profile.isPregnant,
    isDiabetic: profile.isDiabetic,
    conditions: profile.conditions,
    allergies: profile.allergies,
  });

  // Sort by effectiveness and limit
  remedies.sort((a, b) => {
    const order: Record<string, number> = { high: 0, moderate: 1, low: 2 };
    return order[a.effectiveness] - order[b.effectiveness];
  });
  remedies = remedies.slice(0, maxRemedies);

  // Collect warning signs from all matched conditions
  const warningSignsSet = new Set<string>();
  conditionMatches.forEach(c => c.warningSignsToWatch.forEach(w => warningSignsSet.add(w)));

  return {
    condition: primaryCondition.name,
    conditionHindi: primaryCondition.hindiName,
    remedies,
    lifestyleAdvice: primaryCondition.lifestyleAdvice.slice(0, 5),
    warningSignsToWatch: Array.from(warningSignsSet).slice(0, 5),
  };
}

// ============================================
// AYURVEDIC RECOMMENDATIONS GENERATION
// ============================================

function generateAyurvedicRecommendations(
  healthContext: HealthContext,
  profile: ExtractedProfile,
  triageLevel: TriageLevel,
  maxFormulations: number
): EnhancedGuidanceResult['ayurvedic'] {
  // Don't show for emergency/urgent
  if (triageLevel === 'emergency' || triageLevel === 'urgent') {
    return null;
  }

  const symptom = healthContext.primarySymptom.toLowerCase();

  // Get relevant formulations
  let formulations = getFormulationsForConcern(symptom);

  // Filter based on profile
  formulations = filterFormulationsForProfile(formulations, {
    isPregnant: profile.isPregnant,
    hasThyroid: profile.hasThyroid,
    hasAutoimmune: profile.hasAutoimmune,
    hasHeartCondition: profile.hasHeartCondition,
    conditions: profile.conditions,
  });

  // Prioritize research-supported formulations
  formulations.sort((a, b) => {
    if (a.researchSupported && !b.researchSupported) return -1;
    if (!a.researchSupported && b.researchSupported) return 1;
    return 0;
  });

  formulations = formulations.slice(0, maxFormulations);

  // Get seasonal recommendations
  const seasonalRecommendations = getCurrentSeasonalRecommendations();

  // Get relevant lifestyle tips
  const lifestyleTips: string[] = [];
  const eatingRec = LIFESTYLE_RECOMMENDATIONS.find(r => r.category === 'eating');
  if (eatingRec) {
    lifestyleTips.push(...eatingRec.practices.slice(0, 3));
  }

  // Add season-specific tips
  lifestyleTips.push(...seasonalRecommendations.recommendations.slice(0, 2));

  return {
    formulations,
    seasonalRecommendations,
    lifestyleTips: lifestyleTips.slice(0, 5),
  };
}

// ============================================
// OTC SUGGESTIONS GENERATION
// ============================================

function generateOTCSuggestions(
  healthContext: HealthContext,
  profile: ExtractedProfile,
  triageLevel: TriageLevel,
  maxMedications: number
): EnhancedGuidanceResult['otc'] {
  // Don't show OTC for emergency
  if (triageLevel === 'emergency') {
    return null;
  }

  const symptom = healthContext.primarySymptom.toLowerCase();
  const category = getOTCForSymptom(symptom);

  if (!category) {
    return null;
  }

  // Filter medications based on profile
  let medications = filterOTCForProfile(category.medications, {
    age: profile.age,
    isPregnant: profile.isPregnant,
    hasHeartDisease: profile.hasHeartCondition,
    hasKidneyDisease: profile.hasKidneyDisease,
    hasLiverDisease: profile.hasLiverDisease,
    isOnBloodThinners: profile.isOnBloodThinners,
  });

  medications = medications.slice(0, maxMedications);

  // Add elderly note if applicable
  let elderlyNote: string | undefined;
  if (profile.age && profile.age >= 60) {
    elderlyNote = ELDERLY_OTC_CONSIDERATIONS.note + ' ' + ELDERLY_OTC_CONSIDERATIONS.points.slice(0, 2).join('. ');
  }

  return {
    category,
    medications,
    disclaimer: OTC_DISCLAIMER,
    elderlyNote,
  };
}

// ============================================
// SERVICES GENERATION
// ============================================

function generateServices(
  healthContext: HealthContext,
  assessment: SafetyAssessment,
  profile: ExtractedProfile
): EnhancedGuidanceResult['services'] {
  const symptom = healthContext.primarySymptom;
  const carePathway = getCarePathway(
    symptom,
    assessment.urgency,
    profile.age,
    profile.conditions.length > 0
  );

  return {
    primaryRecommendations: carePathway.primaryRecommendations,
    secondaryRecommendations: carePathway.secondaryRecommendations,
    escalationNote: carePathway.escalationNote,
  };
}

// ============================================
// WARNING SIGNS COMPILATION
// ============================================

function compileWarningSigns(
  assessment: SafetyAssessment,
  homeRemedies: EnhancedGuidanceResult['homeRemedies'],
  triageLevel: TriageLevel
): string[] {
  const warningSigns = new Set<string>();

  // Add from assessment
  assessment.redFlagsDetected.forEach(rf => warningSigns.add(rf));

  // Add from home remedies
  if (homeRemedies) {
    homeRemedies.warningSignsToWatch.forEach(ws => warningSigns.add(ws));
  }

  // Add generic warning signs based on triage level
  if (triageLevel === 'self_care' || triageLevel === 'monitor') {
    warningSigns.add('Symptoms significantly worsen or don\'t improve');
    warningSigns.add('New concerning symptoms develop');
    warningSigns.add('Difficulty breathing');
    warningSigns.add('High fever (above 103°F/39.5°C)');
  }

  return Array.from(warningSigns).slice(0, 6);
}

// ============================================
// FOLLOW-UP GENERATION
// ============================================

function generateFollowUp(triageLevel: TriageLevel): EnhancedGuidanceResult['followUp'] {
  switch (triageLevel) {
    case 'emergency':
      return {
        checkInTime: 'Immediately',
        message: 'Please seek emergency care now.',
      };
    case 'urgent':
      return {
        checkInTime: 'After seeing doctor',
        message: 'Let us know how your appointment goes.',
      };
    case 'consult':
      return {
        checkInTime: '24-48 hours',
        message: 'Check back with us if symptoms change or after your consultation.',
      };
    case 'monitor':
      return {
        checkInTime: '24 hours',
        message: 'Let\'s check how you\'re feeling tomorrow.',
      };
    case 'self_care':
    default:
      return {
        checkInTime: '2-3 days',
        message: 'If symptoms persist beyond 3 days, please check back.',
      };
  }
}

// ============================================
// MAIN GENERATOR FUNCTION
// ============================================

/**
 * Generate comprehensive guidance response
 */
export function generateEnhancedGuidance(
  healthContext: HealthContext,
  assessment: SafetyAssessment,
  memberProfile?: MemberProfile,
  options: GuidanceOptions = {}
): EnhancedGuidanceResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const profile = extractProfile(memberProfile, healthContext);
  const triageLevel = urgencyToTriageLevel(assessment.urgency);

  // Generate summary
  const summary = generateSummary(healthContext, assessment, triageLevel);

  // Generate triage info
  const carePathway = getCarePathway(
    healthContext.primarySymptom,
    assessment.urgency,
    profile.age,
    profile.conditions.length > 0
  );

  const triage = {
    level: triageLevel,
    urgencyLevel: assessment.urgency,
    displayTitle: carePathway.displayTitle,
    displayDescription: carePathway.displayDescription,
    displayColor: carePathway.displayColor,
    timeframe: carePathway.timeframe,
  };

  // Generate home remedies
  const homeRemedies = opts.includeHomeRemedies
    ? generateHomeRemedies(healthContext, profile, triageLevel, opts.maxRemedies!)
    : null;

  // Generate Ayurvedic recommendations
  const ayurvedic = opts.includeAyurvedic
    ? generateAyurvedicRecommendations(healthContext, profile, triageLevel, opts.maxFormulations!)
    : null;

  // Generate OTC suggestions
  const otc = opts.includeOTC
    ? generateOTCSuggestions(healthContext, profile, triageLevel, opts.maxOTCMedications!)
    : null;

  // Generate services
  const services = opts.includeServices
    ? generateServices(healthContext, assessment, profile)
    : { primaryRecommendations: [], secondaryRecommendations: [] };

  // Compile warning signs
  const warningSignsToWatch = compileWarningSigns(assessment, homeRemedies, triageLevel);

  // Generate follow-up
  const followUp = generateFollowUp(triageLevel);

  // Standard disclaimer
  const disclaimer = `This guidance is for informational purposes only and does not replace professional medical advice. Always consult a qualified healthcare provider for medical concerns.`;

  return {
    summary,
    triage,
    homeRemedies,
    ayurvedic,
    otc,
    services,
    warningSignsToWatch,
    followUp,
    disclaimer,
  };
}

// ============================================
// QUICK GUIDANCE (Simplified for chat)
// ============================================

export interface QuickGuidance {
  title: string;
  urgencyColor: string;
  topRemedies: Array<{ name: string; hindiName: string; howTo: string }>;
  lifestyleAdvice: string[];
  warningSignsToWatch: string[];
  servicesCTA: { label: string; serviceId: string } | null;
}

/**
 * Generate quick guidance for chat display
 */
export function generateQuickGuidance(
  symptom: string,
  urgencyLevel: UrgencyLevel,
  memberAge?: number
): QuickGuidance {
  const triageLevel = urgencyToTriageLevel(urgencyLevel);
  const conditionMatches = searchRemediesBySymptom(symptom);
  const carePathway = getCarePathway(symptom, urgencyLevel, memberAge);

  // Get top remedies
  const topRemedies: QuickGuidance['topRemedies'] = [];
  if (conditionMatches.length > 0 && triageLevel !== 'emergency' && triageLevel !== 'urgent') {
    const remedies = conditionMatches[0].remedies.slice(0, 2);
    remedies.forEach(r => {
      topRemedies.push({
        name: r.name,
        hindiName: r.hindiName,
        howTo: r.howTo,
      });
    });
  }

  // Get lifestyle advice
  const lifestyleAdvice = conditionMatches.length > 0
    ? conditionMatches[0].lifestyleAdvice.slice(0, 3)
    : ['Rest and stay hydrated', 'Monitor your symptoms', 'Get adequate sleep'];

  // Get warning signs
  const warningSignsToWatch = conditionMatches.length > 0
    ? conditionMatches[0].warningSignsToWatch.slice(0, 3)
    : ['Symptoms worsen significantly', 'New symptoms develop', 'High fever'];

  // Get primary service CTA
  let servicesCTA: QuickGuidance['servicesCTA'] = null;
  if (carePathway.primaryRecommendations.length > 0) {
    const primary = carePathway.primaryRecommendations[0];
    servicesCTA = {
      label: primary.service.cta,
      serviceId: primary.service.id,
    };
  }

  return {
    title: carePathway.displayTitle,
    urgencyColor: carePathway.displayColor,
    topRemedies,
    lifestyleAdvice,
    warningSignsToWatch,
    servicesCTA,
  };
}
