/**
 * Rule-Based Triage Engine (PRD V1 Spec)
 * Simple, deterministic triage logic - NOT AI-based
 *
 * Rules:
 * 1. Emergency keywords detected → EMERGENCY risk, Seek Emergency Care
 * 2. High severity + just_started → HIGH risk, Visit Urgent Care
 * 3. High severity + hours/days → HIGH risk, Schedule Doctor Visit soon
 * 4. Medium severity + just_started → MEDIUM risk, Monitor/Urgent Care
 * 5. Medium severity + ongoing → MEDIUM risk, Schedule Doctor Visit
 * 6. Low severity + any duration → LOW risk, Monitor at Home
 * 7. Ongoing high severity → HIGH risk, Schedule Doctor Visit urgently
 */

import {
  type SymptomDuration,
  type SymptomSeverity,
  type RiskLevel,
  type CareSuggestion,
  type TriageResult,
  EMERGENCY_KEYWORDS,
} from '../types/symptomEntry';

/**
 * Check if description contains any emergency keywords
 * Case-insensitive matching
 */
export function detectEmergencyKeywords(description: string): string[] {
  const lowerDescription = description.toLowerCase();
  const foundKeywords: string[] = [];

  for (const keyword of EMERGENCY_KEYWORDS) {
    if (lowerDescription.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
    }
  }

  return foundKeywords;
}

/**
 * Main triage function - rule-based, deterministic
 */
export function performTriage(
  description: string,
  duration: SymptomDuration,
  severity: SymptomSeverity
): TriageResult {
  // Step 1: Check for emergency keywords
  const emergencyKeywordsFound = detectEmergencyKeywords(description);

  if (emergencyKeywordsFound.length > 0) {
    return {
      riskLevel: 'emergency',
      careSuggestion: 'emergency',
      reason: `Emergency keywords detected: ${emergencyKeywordsFound.join(', ')}. Immediate medical attention may be required.`,
      emergencyKeywordsFound,
      isEmergency: true,
    };
  }

  // Step 2: Rule-based triage based on severity and duration
  let riskLevel: RiskLevel;
  let careSuggestion: CareSuggestion;
  let reason: string;

  // High severity cases
  if (severity === 'high') {
    if (duration === 'just_started') {
      riskLevel = 'high';
      careSuggestion = 'urgent_care';
      reason = 'Severe symptoms that just started warrant prompt medical evaluation to rule out serious conditions.';
    } else if (duration === 'hours' || duration === 'days') {
      riskLevel = 'high';
      careSuggestion = 'doctor_visit';
      reason = 'Severe symptoms persisting for hours to days should be evaluated by a healthcare provider soon.';
    } else {
      // weeks or ongoing
      riskLevel = 'high';
      careSuggestion = 'doctor_visit';
      reason = 'Severe symptoms that have persisted for an extended period require medical evaluation to identify the underlying cause.';
    }
  }
  // Medium severity cases
  else if (severity === 'medium') {
    if (duration === 'just_started') {
      riskLevel = 'medium';
      careSuggestion = 'monitor';
      reason = 'Moderate symptoms that just started can often be monitored at home. Seek care if symptoms worsen.';
    } else if (duration === 'hours') {
      riskLevel = 'medium';
      careSuggestion = 'monitor';
      reason = 'Moderate symptoms for a few hours may improve with rest and home care. Monitor for changes.';
    } else if (duration === 'days') {
      riskLevel = 'medium';
      careSuggestion = 'doctor_visit';
      reason = 'Moderate symptoms lasting several days warrant a doctor visit to ensure proper treatment.';
    } else {
      // weeks or ongoing
      riskLevel = 'medium';
      careSuggestion = 'doctor_visit';
      reason = 'Moderate symptoms that have persisted for weeks or longer should be evaluated by a healthcare provider.';
    }
  }
  // Low severity cases
  else {
    if (duration === 'ongoing') {
      riskLevel = 'low';
      careSuggestion = 'doctor_visit';
      reason = 'While symptoms are mild, their ongoing nature suggests a doctor visit may help identify any underlying causes.';
    } else if (duration === 'weeks') {
      riskLevel = 'low';
      careSuggestion = 'monitor';
      reason = 'Mild symptoms for over a week can usually be monitored. Consider a doctor visit if they persist or worsen.';
    } else {
      // just_started, hours, days
      riskLevel = 'low';
      careSuggestion = 'monitor';
      reason = 'Mild symptoms can typically be managed at home with rest and self-care. Monitor for any changes.';
    }
  }

  return {
    riskLevel,
    careSuggestion,
    reason,
    emergencyKeywordsFound: [],
    isEmergency: false,
  };
}

/**
 * Get urgency score for sorting (higher = more urgent)
 */
export function getUrgencyScore(riskLevel: RiskLevel): number {
  const scores: Record<RiskLevel, number> = {
    emergency: 4,
    high: 3,
    medium: 2,
    low: 1,
  };
  return scores[riskLevel];
}

/**
 * Get time-based urgency advice
 */
export function getUrgencyAdvice(careSuggestion: CareSuggestion): string {
  const advice: Record<CareSuggestion, string> = {
    emergency: 'Immediately - Do not wait',
    urgent_care: 'Within the next few hours',
    doctor_visit: 'Within the next 1-3 days',
    monitor: 'Reassess in 24-48 hours if no improvement',
  };
  return advice[careSuggestion];
}
