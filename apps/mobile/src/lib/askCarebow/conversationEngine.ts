/**
 * Ask CareBow Conversation Engine
 * Core logic for processing user input and generating responses
 */

import {
  Message,
  HealthContext,
  ConversationPhase,
  UrgencyLevel,
  GuidanceResponse,
  ServiceRecommendation,
  FollowUpQuestionType,
} from '@/types/askCarebow';
import {
  detectEmergency,
  assessUrgency,
  SafetyAssessment,
  detectCrisisType,
  formatCrisisResponse,
} from './safetyClassifier';
import {
  getFollowUpQuestion,
  shouldAskMoreQuestions,
  parseUserResponse,
} from './followUpQuestions';
import { getServiceRecommendations } from './serviceRouter';
import { buildGuidanceResponse } from './guidanceBuilder';
import { classifyIntent, ConversationIntent } from './intentClassifier';

// ============================================
// TYPES
// ============================================

export type ConversationResponse = {
  messages: Omit<Message, 'id' | 'timestamp'>[];
  phaseUpdate?: ConversationPhase;
  healthContextUpdates?: Partial<HealthContext>;
  urgencyLevel?: UrgencyLevel;
  serviceRecommendations?: ServiceRecommendation[];
  isEmergency?: boolean;
  questionAsked?: FollowUpQuestionType;
  // Which branch this turn resolved to. 'emergency' is set here (rather than
  // living in ConversationIntent) because it's decided by detectEmergency
  // before classifyIntent ever runs — see STEP 1 in processUserInput.
  // ConversationScreen uses this to decide symptom-help turns should call the
  // orchestrator (E7) instead of the rewrite-only endpoint.
  intent?: ConversationIntent | 'emergency';
};

// ============================================
// MAIN PROCESSING FUNCTION
// ============================================

export async function processUserInput(
  userText: string,
  currentPhase: ConversationPhase,
  healthContext: HealthContext,
  questionsAsked: FollowUpQuestionType[]
): Promise<ConversationResponse> {
  // Clean and normalize input
  const normalizedText = userText.trim().toLowerCase();

  // STEP 1: Check for emergency/red flag symptoms
  const emergencyCheck = detectEmergency(normalizedText);
  if (emergencyCheck.isEmergency) {
    return generateEmergencyResponse(emergencyCheck.detectedSymptoms, userText);
  }

  // STEP 2: Route based on conversation phase
  switch (currentPhase) {
    case 'initial':
      return handleInitialInput(userText, normalizedText, healthContext);

    case 'gathering':
      return handleGatheringInput(userText, normalizedText, healthContext, questionsAsked);

    case 'guidance':
    case 'service_routing':
      return handlePostGuidanceInput(userText, normalizedText, healthContext);

    case 'talking':
      return handleTalkingInput(userText, normalizedText, healthContext);

    default:
      return handleInitialInput(userText, normalizedText, healthContext);
  }
}

// ============================================
// PHASE HANDLERS
// ============================================

function handleInitialInput(
  originalText: string,
  normalizedText: string,
  healthContext: HealthContext
): ConversationResponse {
  // Not every message is a symptom to triage — check what the patient
  // actually wants before defaulting into the onset/location/severity
  // question sequence below.
  const intent = classifyIntent(originalText);
  if (intent === 'talk') return handleTalkIntent();
  if (intent === 'want_doctor') return handleWantDoctorIntent();
  if (intent === 'want_test') return handleWantTestIntent();

  // Extract primary symptom from initial input
  const primarySymptom = extractPrimarySymptom(originalText);

  // Parse any additional context from the initial message
  const parsedContext = parseInitialInput(normalizedText);

  // Update health context
  const healthContextUpdates: Partial<HealthContext> = {
    primarySymptom,
    ...parsedContext,
  };

  // P1-1 FIX: Determine first question based on what's already known
  // P1-3 FIX: Use correct priority order (onset -> location -> severity -> pattern)
  let firstQuestionType: FollowUpQuestionType = 'duration'; // onset
  if (parsedContext.duration) {
    firstQuestionType = 'location';
  }

  const firstQuestion = getFollowUpQuestion(firstQuestionType, {
    ...healthContext,
    ...healthContextUpdates,
  });

  // P1-1 FIX: Build single formatted first response
  const formattedResponse = buildFirstResponse(
    primarySymptom,
    originalText,
    firstQuestion.question
  );

  const messages: Omit<Message, 'id' | 'timestamp'>[] = [
    {
      role: 'assistant',
      contentType: 'question',
      text: formattedResponse,
      quickOptions: firstQuestion.quickOptions,
    },
  ];

  return {
    messages,
    phaseUpdate: 'gathering',
    healthContextUpdates,
    questionAsked: firstQuestionType,
    intent: 'symptom_help',
  };
}

// ============================================
// INTENT BRANCHES (talk / want_doctor / want_test)
// ============================================

const TALK_OPENERS = [
  "I'm here to listen. What's on your mind?",
  "I'm listening — take your time and tell me what's going on.",
  "Okay, I'm here. What would you like to talk about?",
];

function handleTalkIntent(): ConversationResponse {
  const opener = TALK_OPENERS[Math.floor(Math.random() * TALK_OPENERS.length)];
  return {
    messages: [{ role: 'assistant', contentType: 'text', text: opener }],
    phaseUpdate: 'talking',
    intent: 'talk',
  };
}

/**
 * Stays in supportive-listening mode turn after turn, but keeps checking —
 * someone who started out just wanting to talk can still pivot to wanting
 * symptom help, a doctor, or a test mid-conversation, and this should not
 * trap them in listening mode once that happens.
 */
function handleTalkingInput(
  originalText: string,
  normalizedText: string,
  healthContext: HealthContext
): ConversationResponse {
  const intent = classifyIntent(originalText);
  if (intent === 'want_doctor') return handleWantDoctorIntent();
  if (intent === 'want_test') return handleWantTestIntent();
  if (intent === 'symptom_help')
    return handleInitialInput(originalText, normalizedText, healthContext);

  return {
    messages: [
      {
        role: 'assistant',
        contentType: 'text',
        text: "That sounds like a lot to carry. Go on, I'm listening — and if at any point you'd rather talk to a doctor or look into your symptoms, just say so.",
      },
    ],
    phaseUpdate: 'talking',
    intent: 'talk',
  };
}

function handleWantDoctorIntent(): ConversationResponse {
  const recommendation: ServiceRecommendation = {
    serviceId: 'video_consult',
    serviceTitle: 'Video Consultation',
    reason: 'You asked to speak with a doctor.',
    urgency: 'soon',
    prefilledNotes: '',
  };
  return {
    messages: [
      {
        role: 'assistant',
        contentType: 'service_recommendation',
        text: "Sure — let's get you connected with a doctor.",
        serviceRecommendation: recommendation,
      },
    ],
    phaseUpdate: 'service_routing',
    serviceRecommendations: [recommendation],
    intent: 'want_doctor',
  };
}

function handleWantTestIntent(): ConversationResponse {
  const recommendation: ServiceRecommendation = {
    serviceId: 'lab_test',
    serviceTitle: 'Lab Test',
    reason: 'You asked about getting tested.',
    urgency: 'non_urgent',
    prefilledNotes: '',
  };
  return {
    messages: [
      {
        role: 'assistant',
        contentType: 'service_recommendation',
        text: "Sure — let's find the right test for you.",
        serviceRecommendation: recommendation,
      },
    ],
    phaseUpdate: 'service_routing',
    serviceRecommendations: [recommendation],
    intent: 'want_test',
  };
}

function handleGatheringInput(
  originalText: string,
  normalizedText: string,
  healthContext: HealthContext,
  questionsAsked: FollowUpQuestionType[]
): ConversationResponse {
  // Parse the user's response to the current question
  const lastQuestion = questionsAsked[questionsAsked.length - 1];
  const parsedResponse = parseUserResponse(normalizedText, lastQuestion);

  // Update health context with parsed response
  const healthContextUpdates = { ...parsedResponse };

  // Check if we have enough information
  const updatedContext = { ...healthContext, ...healthContextUpdates };
  const shouldContinue = shouldAskMoreQuestions(updatedContext, questionsAsked);

  if (shouldContinue) {
    // Get next question
    const nextQuestionType = getNextQuestionType(questionsAsked, updatedContext);

    if (nextQuestionType) {
      const nextQuestion = getFollowUpQuestion(nextQuestionType, updatedContext);

      return {
        messages: [
          {
            role: 'assistant',
            contentType: 'question',
            text: nextQuestion.question,
            quickOptions: nextQuestion.quickOptions,
          },
        ],
        phaseUpdate: 'gathering',
        healthContextUpdates,
        questionAsked: nextQuestionType,
        intent: 'symptom_help',
      };
    }
  }

  // We have enough information - assess and provide guidance
  return generateAssessmentAndGuidance(updatedContext, healthContextUpdates);
}

function handlePostGuidanceInput(
  originalText: string,
  normalizedText: string,
  healthContext: HealthContext
): ConversationResponse {
  // A turn after guidance can be a new intent, not a follow-up about the same
  // complaint. Re-route it before falling back to symptom follow-up handling.
  const intent = classifyIntent(originalText);
  if (intent === 'want_doctor') return handleWantDoctorIntent();
  if (intent === 'want_test') return handleWantTestIntent();
  if (intent === 'talk') return handleTalkIntent();

  const metaAnswer = detectMetaQuestion(normalizedText);
  if (metaAnswer) {
    return {
      messages: [{ role: 'assistant', contentType: 'text', text: metaAnswer }],
      intent: 'symptom_help',
    };
  }

  // Genuine follow-up about the same complaint.
  const followUpResponse = generateFollowUpResponse(normalizedText, healthContext);

  return {
    messages: [
      {
        role: 'assistant',
        contentType: 'text',
        text: followUpResponse,
      },
    ],
    intent: 'symptom_help',
  };
}

function detectMetaQuestion(normalizedText: string): string | null {
  if (
    /\b(who|what)\s+are\s+you\b/.test(normalizedText) ||
    /\bare\s+you\s+(a\s+)?(bot|robot|human|real|a\s+person|an?\s+ai|a\s+doctor)\b/.test(
      normalizedText
    ) ||
    /\byour\s+name\b/.test(normalizedText)
  ) {
    return "I'm Ask CareBow — an AI health assistant, not a doctor. I can help you make sense of your symptoms and point you to the right care. What would you like help with?";
  }
  return null;
}

// ============================================
// EMERGENCY RESPONSE
// ============================================

function generateEmergencyResponse(
  detectedSymptoms: string[],
  userText: string = ''
): ConversationResponse {
  const symptomList = detectedSymptoms.join(', ');

  // P0-1: Check for crisis situations (self-harm, suicide, overdose)
  const crisisType = detectCrisisType(userText);
  const crisisResources = formatCrisisResponse(crisisType, true);

  // Build appropriate response based on crisis type
  let emergencyText = '';
  if (crisisType !== 'none') {
    // For mental health crises, use a calmer, more supportive tone
    emergencyText = `I hear you, and I want you to know that help is available right now.\n\n${crisisResources}`;
  } else {
    // Standard emergency response
    emergencyText =
      'Please take these steps immediately:\n\n1. If you or someone is in immediate danger, call emergency services (911 in the US)\n\n2. Do not drive yourself if you feel unwell - have someone else drive you or call an ambulance\n\n3. Stay calm and try to remain still until help arrives\n\n4. If possible, have someone stay with you';
  }

  return {
    messages: [
      {
        role: 'assistant',
        contentType: 'emergency_alert',
        text: `Based on what you've described (${symptomList}), this could be a serious situation that requires immediate attention.`,
        isEmergency: true,
      },
      {
        role: 'assistant',
        contentType: 'text',
        text: emergencyText,
      },
    ],
    phaseUpdate: 'completed',
    urgencyLevel: 'emergency',
    isEmergency: true,
    intent: 'emergency',
  };
}

// ============================================
// ASSESSMENT & GUIDANCE
// ============================================

function generateAssessmentAndGuidance(
  healthContext: HealthContext,
  healthContextUpdates: Partial<HealthContext>
): ConversationResponse {
  // Assess urgency
  const assessment = assessUrgency(healthContext);

  // Get service recommendations
  const serviceRecommendations = getServiceRecommendations(healthContext, assessment.urgency);

  // Build guidance response
  const guidance = buildGuidanceResponse(healthContext, assessment, serviceRecommendations);

  // Format the guidance message
  const guidanceText = formatGuidanceText(guidance, assessment);

  const messages: Omit<Message, 'id' | 'timestamp'>[] = [
    {
      role: 'assistant',
      contentType: 'guidance',
      text: guidanceText,
      guidance,
    },
  ];

  // Add service recommendations if any
  if (serviceRecommendations.length > 0) {
    const primaryRecommendation = serviceRecommendations[0];
    messages.push({
      role: 'assistant',
      contentType: 'service_recommendation',
      text: `Based on your symptoms, I recommend: ${primaryRecommendation.serviceTitle}`,
      serviceRecommendation: primaryRecommendation,
    });
  }

  // P1-2 FIX: Replace generic closer with specific next action
  // NO "Is there anything else..." or "Let me know..." - use specific action
  const nextActionText =
    serviceRecommendations.length > 0
      ? `Would you like me to help you book ${serviceRecommendations[0].serviceTitle}?`
      : assessment.urgency === 'emergency' || assessment.urgency === 'urgent'
        ? 'Please prioritize seeking medical care based on the guidance above.'
        : 'Monitor your symptoms over the next 24 hours and let me know if anything changes.';

  messages.push({
    role: 'assistant',
    contentType: 'text',
    text: nextActionText,
  });

  return {
    messages,
    phaseUpdate: 'guidance',
    healthContextUpdates,
    urgencyLevel: assessment.urgency,
    serviceRecommendations,
    intent: 'symptom_help',
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function extractPrimarySymptom(text: string): string {
  // Extract the main symptom from user's description
  // This is a simplified extraction - in production, use NLP
  const cleanText = text.trim();

  // Remove common prefixes
  const prefixPatterns = [
    /^i('m| am) (having|experiencing|feeling)/i,
    /^i('ve| have) (been having|got|had)/i,
    /^my .+ (is|are|has|have)/i,
    /^there('s| is) /i,
  ];

  let symptom = cleanText;
  for (const pattern of prefixPatterns) {
    symptom = symptom.replace(pattern, '').trim();
  }

  // Capitalize first letter
  return symptom.charAt(0).toUpperCase() + symptom.slice(1);
}

function parseInitialInput(text: string): Partial<HealthContext> {
  const context: Partial<HealthContext> = {};

  // Extract duration if mentioned
  if (text.includes('for a few days') || text.includes('past few days')) {
    context.duration = '3_7_days';
  } else if (text.includes('since yesterday') || text.includes('since last night')) {
    context.duration = '1_2_days';
  } else if (text.includes('just started') || text.includes('started today')) {
    context.duration = 'today';
  } else if (text.includes('for weeks') || text.includes('few weeks')) {
    context.duration = '1_2_weeks';
  }

  // Extract severity indicators
  if (text.includes('severe') || text.includes('really bad') || text.includes('unbearable')) {
    context.severity = 8;
  } else if (text.includes('mild') || text.includes('slight') || text.includes('a little')) {
    context.severity = 3;
  } else if (text.includes('moderate')) {
    context.severity = 5;
  }

  return context;
}

// ============================================
// P1-1 FIX: FIRST-RESPONSE FORMAT
// ============================================

/**
 * Extracts key points from user's initial message for bullet reflection.
 * Returns 1-2 brief bullet points summarizing what was understood.
 */
function extractUnderstandingBullets(symptom: string, text: string): string[] {
  const bullets: string[] = [];
  const lowerText = text.toLowerCase();

  // Primary symptom bullet
  bullets.push(`You're experiencing ${symptom.toLowerCase()}`);

  // Add context if detected
  if (
    lowerText.includes('worried') ||
    lowerText.includes('anxious') ||
    lowerText.includes('scared') ||
    lowerText.includes('concerned')
  ) {
    bullets.push(`You're feeling worried about this`);
  } else if (lowerText.includes('pain') || lowerText.includes('hurt')) {
    bullets.push(`This is causing you discomfort`);
  } else if (
    lowerText.includes('days') ||
    lowerText.includes('week') ||
    lowerText.includes('while')
  ) {
    bullets.push(`This has been going on for some time`);
  } else if (
    lowerText.includes('suddenly') ||
    lowerText.includes('just started') ||
    lowerText.includes('just now')
  ) {
    bullets.push(`This started recently`);
  }

  // Ensure max 2 bullets
  return bullets.slice(0, 2);
}

/**
 * P1-1 FIX: Builds a strictly formatted first response.
 * Format:
 * 1) ONE sentence emotional acknowledgment
 * 2) 1-2 bullets reflecting what was understood
 * 3) EXACTLY ONE follow-up question
 *
 * NO advice, NO possibilities, NO long disclaimers.
 */
function buildFirstResponse(
  symptom: string,
  originalText: string,
  followUpQuestion: string
): string {
  // 1) ONE sentence emotional acknowledgment (calm, empathetic)
  const acknowledgment = `I hear you, and I'm glad you reached out.`;

  // 2) 1-2 bullets reflecting what was understood
  const bullets = extractUnderstandingBullets(symptom, originalText);
  const bulletSection = `From what you shared:\n${bullets.map((b) => `• ${b}`).join('\n')}`;

  // 3) EXACTLY ONE follow-up question
  const question = followUpQuestion;

  return `${acknowledgment}\n\n${bulletSection}\n\n${question}`;
}

function getNextQuestionType(
  questionsAsked: FollowUpQuestionType[],
  context: HealthContext
): FollowUpQuestionType | null {
  // P1-3 FIX: Enforce priority order:
  // onset → location → severity → pattern → associated symptoms → risk factors
  // Max 2 questions per turn (handled by caller)
  const questionPriority: FollowUpQuestionType[] = [
    'duration', // onset
    'location', // location
    'severity', // severity
    'frequency', // pattern
    'associated_symptoms', // associated symptoms
    'risk_factors', // risk factors
    'chronic_conditions', // chronic conditions (secondary)
    'recent_events', // recent events (secondary)
  ];

  // Find the next question that hasn't been asked
  for (const questionType of questionPriority) {
    if (!questionsAsked.includes(questionType)) {
      // P1-3 FIX: Skip if already known (don't re-ask)
      if (questionType === 'duration' && context.duration) continue;
      if (questionType === 'severity' && context.severity) continue;
      if (questionType === 'frequency' && context.frequency) continue;
      if (questionType === 'location' && context.additionalNotes?.includes('location')) continue;
      if (questionType === 'associated_symptoms' && context.associatedSymptoms.length > 0) continue;
      if (questionType === 'risk_factors' && context.riskFactors.length > 0) continue;
      if (questionType === 'chronic_conditions' && context.chronicConditions.length > 0) continue;
      if (questionType === 'recent_events' && context.recentEvents.length > 0) continue;

      return questionType;
    }
  }

  return null;
}

function formatGuidanceText(guidance: GuidanceResponse, _assessment: SafetyAssessment): string {
  let text = '';

  // What this could be related to
  if (guidance.possibleCauses.length > 0) {
    text += 'What this may be related to:\n';
    guidance.possibleCauses.forEach((cause) => {
      text += `  - ${cause}\n`;
    });
    text += '\n';
  }

  // What you can do right now
  if (guidance.immediateActions.length > 0) {
    text += 'What you can do right now:\n';
    guidance.immediateActions.forEach((action) => {
      text += `  - ${action}\n`;
    });
    text += '\n';
  }

  // When to seek help
  if (guidance.whenToSeekHelp.length > 0) {
    text += 'When to seek medical help:\n';
    guidance.whenToSeekHelp.forEach((point) => {
      text += `  - ${point}\n`;
    });
  }

  return text.trim();
}

function generateFollowUpResponse(text: string, _healthContext: HealthContext): string {
  // Handle common follow-up questions
  // P1-2 FIX: All responses end with specific action or follow-up question
  if (text.includes('how long') || text.includes('when will')) {
    return 'Recovery time varies depending on the underlying cause. A healthcare provider can give you a more specific timeline based on your situation. Would you like to schedule a consultation?';
  }

  if (text.includes('worse') || text.includes('not getting better')) {
    return 'If your symptoms are getting worse or not improving, I recommend seeing a healthcare provider today. Would you like me to help you book a consultation now?';
  }

  if (text.includes('serious') || text.includes('worried')) {
    return "I understand your concern. Based on what you've shared, the situation doesn't appear to be immediately dangerous, but professional confirmation can give you peace of mind. Would you like to connect with a doctor?";
  }

  // Do not trap the user in the same fixed question on every unmatched reply.
  return "I've shared what I can for now. Would you like me to connect you with a doctor, suggest some home-care steps, or is there a specific worry I can help with?";
}
