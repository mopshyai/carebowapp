import type {
  ConversationPhase,
  Duration,
  HealthContext,
  Message,
  Severity,
  ServiceRecommendation,
  UrgencyLevel,
} from '@/types/askCarebow';

import {
  processUserInput as processLegacyUserInput,
  type ConversationResponse,
} from './conversationEngine';
import { classifyIntent } from './intentClassifier';
import { detectEmergency, assessUrgency } from './safetyClassifier';
import { getFollowUpQuestion } from './followUpQuestions';
import { getServiceRecommendations } from './serviceRouter';
import { buildGuidanceResponse } from './guidanceBuilder';
import { ageFromDateOfBirth, ageToAgeGroup } from './patientContext';
import { useAskCarebowStore } from '@/store/askCarebowStore';
import { useProfileStore } from '@/store/useProfileStore';

const VAGUE_SICK_PATTERN =
  /\b(i\s*(?:am|'m)?\s*(?:feeling\s*)?(?:sick|ill|unwell|bad)|not feeling well|feel(?:ing)? off|something(?:'s| is) wrong)\b/i;

const SPECIFIC_SYMPTOM_PATTERN =
  /\b(pain|ache|fever|temperature|cough|cold|congestion|sore throat|runny nose|sneez|chill|fatigue|fatigued|tired|exhausted|nausea|nauseous|vomit|diarr|constipat|appetite|not eating|dizz|vertigo|headache|migraine|rash|itch|breath|chest|stomach|abdomen|abdominal|back|knee|joint|weak|numb|tingl|swell|bleed|urine|urinary|confus|faint|palpitat|heart|blood pressure|sugar|glucose|sleep|insomnia|anxious|anxiety|depress|fall|fell|injur|wound)\b/i;

type BoundPatient = {
  context: HealthContext;
  confirmation: string;
};

function listNames(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map(item => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object' && 'name' in item) {
        return String((item as { name?: unknown }).name ?? '').trim();
      }
      return '';
    })
    .filter(Boolean);
}

function getBoundPatientContext(context: HealthContext): BoundPatient | null {
  const sessionMemberId = useAskCarebowStore.getState().currentSession?.memberId?.trim();
  if (!sessionMemberId) return null;

  const members = useProfileStore.getState().members as any[];
  const member = members.find(
    candidate => candidate?.id === sessionMemberId || candidate?.backendId === sessionMemberId
  );
  if (!member?.dateOfBirth || !member?.gender) return null;

  const age = ageFromDateOfBirth(member.dateOfBirth);
  const ageGroup = age === undefined ? undefined : ageToAgeGroup(age);
  if (age === undefined || !ageGroup) return null;

  const conditions = listNames(member.healthInfo?.conditions);
  const medications = listNames(member.healthInfo?.medications);
  const allergies = listNames(member.healthInfo?.allergies);
  const name =
    [member.firstName, member.lastName].filter(Boolean).join(' ').trim() ||
    String(member.name ?? '').trim() ||
    'the selected patient';
  const gender = String(member.gender).replaceAll('_', ' ').toLowerCase();
  const conditionText = conditions.length > 0 ? ` Relevant saved conditions: ${conditions.join(', ')}.` : '';

  return {
    context: {
      ...context,
      ageGroup,
      chronicConditions: conditions,
      medications,
      allergies,
    },
    confirmation: `I'm checking this for ${name} (age ${age}, ${gender}).${conditionText}`,
  };
}

function isVagueSymptom(text: string): boolean {
  const value = text.trim();
  if (!value) return true;
  if (SPECIFIC_SYMPTOM_PATTERN.test(value)) return false;
  return VAGUE_SICK_PATTERN.test(value) || value.split(/\s+/).length <= 2;
}

function cleanPrimarySymptom(text: string): string {
  return text
    .trim()
    .replace(/^i(?:'m| am)\s+(?:having|experiencing|feeling)\s+/i, '')
    .replace(/^i(?:'ve| have)\s+(?:been having|got|had)\s+/i, '')
    .slice(0, 240);
}

function parseDurationSafely(text: string): Duration | undefined {
  const value = text.toLowerCase().trim();
  if (!value) return undefined;

  if (/\b(just now|just started|few minutes?|minutes? ago)\b/.test(value)) return 'just_now';
  if (/\b(?:\d+|a|one|two|few)\s*hours?\b|\bfew hours?\b/.test(value)) return 'few_hours';
  if (/\b(today|this morning|this afternoon|this evening|tonight)\b/.test(value)) return 'today';
  if (/\b(yesterday|1\s*day|2\s*days?|one day|two days|1-2 days?)\b/.test(value)) {
    return '1_2_days';
  }
  if (/\b(3|4|5|6|7)\s*days?\b|\b3-7 days?\b|\bfew days?\b/.test(value)) {
    return '3_7_days';
  }
  if (/\b1-2 weeks?\b|\b(?:one|two|couple of|couple)\s*weeks?\b/.test(value)) {
    return '1_2_weeks';
  }
  if (/\b(?:3|4|5|6|7|8|9|10)\s*weeks?\b|\bmonths?\b|\bmore than 2 weeks?\b/.test(value)) {
    return 'more_than_2_weeks';
  }
  if (/\b(chronic|ongoing for a long time|always)\b/.test(value)) return 'chronic';

  if (
    value === 'just_now' ||
    value === 'today' ||
    value === '1_2_days' ||
    value === '3_7_days' ||
    value === '1_2_weeks' ||
    value === 'more_than_2_weeks' ||
    value === 'chronic'
  ) {
    return value as Duration;
  }

  return undefined;
}

function parseSeveritySafely(text: string): Severity | undefined {
  const value = text.toLowerCase().trim();

  // A bare 1-10 answer is valid because this parser is also used directly on
  // replies to the severity question. In a longer first symptom sentence, a
  // number only counts as severity when the user explicitly writes x/10 or
  // "x out of 10". This prevents "headache for 2 days" becoming severity 2.
  const bareNumeric = value.match(/^(10|[1-9])$/);
  if (bareNumeric) return Number(bareNumeric[1]) as Severity;
  const ratedNumeric = value.match(/\b(10|[1-9])\s*(?:\/|out of)\s*10\b/);
  if (ratedNumeric) return Number(ratedNumeric[1]) as Severity;

  if (/\b(mild|slight)\b/.test(value)) return 3;
  if (/\bmoderate\b/.test(value)) return 5;
  if (/\b(severe|really bad|very bad)\b/.test(value)) return 8;
  if (/\b(worst|unbearable|very severe)\b/.test(value)) return 10;
  return undefined;
}

function parseAssociatedSymptomsSafely(text: string): string[] {
  const value = text.trim();
  if (/\b(none|no other|nothing else|just that|only that)\b/i.test(value)) return [];
  return value ? [value.slice(0, 300)] : [];
}

function questionResponse(
  type: 'duration' | 'severity' | 'associated_symptoms',
  context: HealthContext,
  prefix?: string
): ConversationResponse {
  const question = getFollowUpQuestion(type, context);
  return {
    messages: [
      {
        role: 'assistant',
        contentType: 'question',
        text: prefix ? `${prefix}\n\n${question.question}` : question.question,
        quickOptions: question.quickOptions,
      },
    ],
    phaseUpdate: 'gathering',
    questionAsked: type,
    intent: 'symptom_help',
  };
}

function mainSymptomQuestion(
  updates: Partial<HealthContext> = {},
  prefix?: string
): ConversationResponse {
  return {
    messages: [
      {
        role: 'assistant',
        contentType: 'question',
        text: prefix
          ? `${prefix}\n\nWhat is the main symptom bothering you most right now?`
          : 'What is the main symptom bothering you most right now?',
      },
    ],
    phaseUpdate: 'gathering',
    healthContextUpdates: updates,
    intent: 'symptom_help',
  };
}

function profileRequiredResponse(): ConversationResponse {
  return {
    messages: [
      {
        role: 'assistant',
        contentType: 'text',
        text: 'For a health assessment, I need a saved patient profile with an exact date of birth and sex so I can use the right safety context. Please go back and add or select that person first. I will not guess those details or give symptom guidance without them.',
      },
    ],
    phaseUpdate: 'completed',
    intent: 'symptom_help',
  };
}

function monitoringInstruction(urgency: UrgencyLevel): string {
  switch (urgency) {
    case 'urgent':
      return 'Do not use home monitoring instead of care today. While arranging care, note whether symptoms worsen or any new warning sign appears.';
    case 'soon':
      return 'Track whether the main symptom is improving or worsening and note any new symptoms until you are assessed within the recommended 24-48 hour window.';
    case 'non_urgent':
      return 'Track symptom severity and any new symptoms over the next 1-2 days; arrange routine care if it is not improving.';
    case 'monitor':
    case 'self_care':
      return 'Track whether the symptom is improving or worsening over the next 24 hours and note any new symptoms.';
    case 'emergency':
      return 'Do not delay emergency care to monitor at home.';
  }
}

function formatClinicalGuidance(
  urgency: UrgencyLevel,
  recommendations: ServiceRecommendation[],
  guidance: ReturnType<typeof buildGuidanceResponse>
): string {
  const urgencyLabel: Record<UrgencyLevel, string> = {
    self_care: 'Self-care / monitor',
    monitor: 'Monitor closely',
    non_urgent: 'Non-urgent medical review',
    soon: 'See a doctor within 24-48 hours',
    urgent: 'Urgent - see a doctor today',
    emergency: 'Emergency',
  };

  const sections: string[] = [`Urgency: ${urgencyLabel[urgency]}`];

  if (guidance.possibleCauses.length > 0) {
    sections.push(
      `Possible explanations (not a diagnosis):\n${guidance.possibleCauses
        .slice(0, 3)
        .map(item => `- ${item}`)
        .join('\n')}`
    );
  } else {
    sections.push('Possible explanations: I cannot safely narrow the cause from the information available.');
  }

  const immediate = guidance.immediateActions.slice(0, 2);
  if (immediate.length > 0) {
    sections.push(`What to do now:\n${immediate.map(item => `- ${item}`).join('\n')}`);
  }

  if (!['urgent', 'emergency'].includes(urgency)) {
    const homeCare = guidance.immediateActions.slice(2, 5);
    if (homeCare.length > 0) {
      sections.push(`Safe home care:\n${homeCare.map(item => `- ${item}`).join('\n')}`);
    }
  }

  sections.push(`Monitor:\n- ${monitoringInstruction(urgency)}`);

  if (guidance.whenToSeekHelp.length > 0) {
    sections.push(
      `Get urgent help if:\n${guidance.whenToSeekHelp
        .slice(0, 5)
        .map(item => `- ${item}`)
        .join('\n')}`
    );
  }

  const nextStep = recommendations[0]
    ? `I can help you continue to ${recommendations[0].serviceTitle} in CareBow.`
    : urgency === 'self_care' || urgency === 'monitor'
      ? 'If this is not improving or you are worried, I can help you connect with a doctor or CareBow service.'
      : 'I can help you connect with an appropriate doctor or CareBow service.';
  sections.push(`CareBow next step:\n- ${nextStep}`);

  return sections.join('\n\n');
}

function assessmentResponse(context: HealthContext): ConversationResponse {
  const assessment = assessUrgency(context);
  const recommendations = getServiceRecommendations(context, assessment.urgency);
  const guidance = buildGuidanceResponse(context, assessment, recommendations);
  const text = formatClinicalGuidance(assessment.urgency, recommendations, guidance);

  const message: Omit<Message, 'id' | 'timestamp'> = {
    role: 'assistant',
    contentType: 'guidance',
    text,
    guidance,
  };

  return {
    messages: [message],
    phaseUpdate: 'guidance',
    urgencyLevel: assessment.urgency,
    serviceRecommendations: recommendations,
    intent: 'symptom_help',
  };
}

/**
 * Conservative on-device path used when the server orchestrator is shadowed
 * or unavailable. It does not get to skip the same clinical fields the server
 * now requires, and it never defaults an unparseable duration/severity to a
 * fabricated value.
 */
export async function processSafeFallbackUserInput(
  userText: string,
  currentPhase: ConversationPhase,
  healthContext: HealthContext,
  questionsAsked: string[]
): Promise<ConversationResponse> {
  const normalized = userText.trim();

  // Emergency detection stays available even when patient context is missing.
  if (detectEmergency(normalized.toLowerCase()).isEmergency) {
    return processLegacyUserInput(userText, currentPhase, healthContext, questionsAsked as any);
  }

  const boundPatient = getBoundPatientContext(healthContext);
  if (!boundPatient) return profileRequiredResponse();
  const clinicalContext = boundPatient.context;

  const intent = classifyIntent(userText);
  if (intent !== 'symptom_help' || !['initial', 'gathering'].includes(currentPhase)) {
    return processLegacyUserInput(userText, currentPhase, clinicalContext, questionsAsked as any);
  }

  if (currentPhase === 'initial') {
    const duration = parseDurationSafely(normalized);
    const severity = parseSeveritySafely(normalized);
    const profileUpdates: Partial<HealthContext> = {
      ageGroup: clinicalContext.ageGroup,
      chronicConditions: clinicalContext.chronicConditions,
      medications: clinicalContext.medications,
      allergies: clinicalContext.allergies,
    };

    if (isVagueSymptom(normalized)) {
      return mainSymptomQuestion(
        {
          ...profileUpdates,
          ...(duration ? { duration } : {}),
          ...(severity ? { severity } : {}),
        },
        boundPatient.confirmation
      );
    }

    const primarySymptom = cleanPrimarySymptom(normalized);
    const updated: HealthContext = {
      ...clinicalContext,
      primarySymptom,
      ...(duration ? { duration } : {}),
      ...(severity ? { severity } : {}),
    };
    const updates: Partial<HealthContext> = {
      ...profileUpdates,
      primarySymptom,
      ...(duration ? { duration } : {}),
      ...(severity ? { severity } : {}),
    };

    if (!updated.duration) {
      return {
        ...questionResponse('duration', updated, boundPatient.confirmation),
        healthContextUpdates: updates,
      };
    }
    if (!updated.severity) {
      return {
        ...questionResponse('severity', updated, boundPatient.confirmation),
        healthContextUpdates: updates,
      };
    }
    return {
      ...questionResponse('associated_symptoms', updated, boundPatient.confirmation),
      healthContextUpdates: updates,
    };
  }

  if (!clinicalContext.primarySymptom) {
    if (isVagueSymptom(normalized)) {
      return mainSymptomQuestion({}, boundPatient.confirmation);
    }
    const primarySymptom = cleanPrimarySymptom(normalized);
    const updated = { ...clinicalContext, primarySymptom };
    const next = !updated.duration ? 'duration' : !updated.severity ? 'severity' : 'associated_symptoms';
    return {
      ...questionResponse(next, updated),
      healthContextUpdates: {
        primarySymptom,
        ageGroup: clinicalContext.ageGroup,
        chronicConditions: clinicalContext.chronicConditions,
        medications: clinicalContext.medications,
        allergies: clinicalContext.allergies,
      },
    };
  }

  const lastQuestion = questionsAsked[questionsAsked.length - 1];
  const updates: Partial<HealthContext> = {};

  if (lastQuestion === 'duration') {
    const duration = parseDurationSafely(normalized);
    if (!duration) {
      return questionResponse(
        'duration',
        clinicalContext,
        'I need a rough timeframe before I can assess this safely. An estimate is okay.'
      );
    }
    updates.duration = duration;
  } else if (lastQuestion === 'severity') {
    const severity = parseSeveritySafely(normalized);
    if (!severity) {
      return questionResponse(
        'severity',
        clinicalContext,
        'I need a 1-10 severity estimate before I can assess this safely.'
      );
    }
    updates.severity = severity;
  } else if (lastQuestion === 'associated_symptoms') {
    updates.associatedSymptoms = parseAssociatedSymptomsSafely(normalized);
  }

  const updated: HealthContext = { ...clinicalContext, ...updates };

  if (!updated.duration) {
    return { ...questionResponse('duration', updated), healthContextUpdates: updates };
  }
  if (!updated.severity) {
    return { ...questionResponse('severity', updated), healthContextUpdates: updates };
  }
  if (lastQuestion !== 'associated_symptoms' && !questionsAsked.includes('associated_symptoms')) {
    return {
      ...questionResponse('associated_symptoms', updated),
      healthContextUpdates: updates,
    };
  }

  return { ...assessmentResponse(updated), healthContextUpdates: updates };
}
