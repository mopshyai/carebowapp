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
  QuickOption,
  FollowUpQuestionType,
  Duration,
  Severity,
  Frequency,
  durationLabels,
  frequencyLabels,
} from '@/types/askCarebow';
import { detectEmergency, assessUrgency, SafetyAssessment } from './safetyClassifier';
import { getFollowUpQuestion, shouldAskMoreQuestions, parseUserResponse } from './followUpQuestions';
import { getServiceRecommendations } from './serviceRouter';
import { buildGuidanceResponse } from './guidanceBuilder';

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
    return generateEmergencyResponse(emergencyCheck.detectedSymptoms);
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
  // Extract primary symptom from initial input
  const primarySymptom = extractPrimarySymptom(originalText);

  // Parse any additional context from the initial message
  const parsedContext = parseInitialInput(normalizedText);

  // Update health context
  const healthContextUpdates: Partial<HealthContext> = {
    primarySymptom,
    ...parsedContext,
  };

  // Generate acknowledgment and first follow-up question
  const acknowledgment = generateAcknowledgment(primarySymptom);
  const firstQuestion = getFollowUpQuestion('duration', healthContext);

  const messages: Omit<Message, 'id' | 'timestamp'>[] = [
    {
      role: 'assistant',
      contentType: 'text',
      text: acknowledgment,
    },
    {
      role: 'assistant',
      contentType: 'question',
      text: firstQuestion.question,
      quickOptions: firstQuestion.quickOptions,
    },
  ];

  return {
    messages,
    phaseUpdate: 'gathering',
    healthContextUpdates,
    questionAsked: 'duration',
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
  // User is asking follow-up questions after guidance
  const followUpResponse = generateFollowUpResponse(normalizedText, healthContext);

  return {
    messages: [
      {
        role: 'assistant',
        contentType: 'text',
        text: followUpResponse,
      },
    ],
  };
}

// ============================================
// EMERGENCY RESPONSE
// ============================================

function generateEmergencyResponse(
  detectedSymptoms: string[]
): ConversationResponse {
  const symptomList = detectedSymptoms.join(', ');

  return {
    messages: [
      {
        role: 'assistant',
        contentType: 'emergency_alert',
        text: `Based on what you've described (${symptomList}), this could be a serious situation that requires immediate medical attention.`,
        isEmergency: true,
      },
      {
        role: 'assistant',
        contentType: 'text',
        text: 'Please take these steps immediately:\n\n1. If you or someone is in immediate danger, call emergency services (911 in the US)\n\n2. Do not drive yourself if you feel unwell - have someone else drive you or call an ambulance\n\n3. Stay calm and try to remain still until help arrives\n\n4. If possible, have someone stay with you',
      },
    ],
    phaseUpdate: 'completed',
    urgencyLevel: 'emergency',
    isEmergency: true,
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

  // Add helpful follow-up prompt
  messages.push({
    role: 'assistant',
    contentType: 'text',
    text: 'Is there anything else you\'d like to know about your symptoms, or would you like help booking a service?',
  });

  return {
    messages,
    phaseUpdate: 'guidance',
    healthContextUpdates,
    urgencyLevel: assessment.urgency,
    serviceRecommendations,
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

function generateAcknowledgment(symptom: string): string {
  const acknowledgments = [
    `I understand you're experiencing ${symptom.toLowerCase()}. Let me ask a few questions to better understand your situation.`,
    `Thank you for sharing. ${symptom} can have various causes, and I'd like to learn more to provide helpful guidance.`,
    `I hear you. To give you the most relevant guidance about ${symptom.toLowerCase()}, I need to understand a bit more.`,
  ];

  return acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
}

function getNextQuestionType(
  questionsAsked: FollowUpQuestionType[],
  context: HealthContext
): FollowUpQuestionType | null {
  const questionPriority: FollowUpQuestionType[] = [
    'duration',
    'severity',
    'frequency',
    'associated_symptoms',
    'recent_events',
    'chronic_conditions',
  ];

  // Find the next question that hasn't been asked
  for (const questionType of questionPriority) {
    if (!questionsAsked.includes(questionType)) {
      // Skip duration if already known
      if (questionType === 'duration' && context.duration) continue;
      // Skip severity if already known
      if (questionType === 'severity' && context.severity) continue;

      return questionType;
    }
  }

  return null;
}

function formatGuidanceText(
  guidance: GuidanceResponse,
  assessment: SafetyAssessment
): string {
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

function generateFollowUpResponse(
  text: string,
  healthContext: HealthContext
): string {
  // Handle common follow-up questions
  if (text.includes('how long') || text.includes('when will')) {
    return 'Recovery time varies depending on the underlying cause. If you\'ve booked a consultation, your healthcare provider can give you a more specific timeline based on your situation.';
  }

  if (text.includes('worse') || text.includes('not getting better')) {
    return 'If your symptoms are getting worse or not improving, I recommend seeing a healthcare provider. Would you like me to help you book a consultation?';
  }

  if (text.includes('serious') || text.includes('worried')) {
    return 'I understand your concern. Based on what you\'ve shared, the situation doesn\'t appear to be immediately dangerous, but it\'s always good to get professional confirmation. A quick consultation can give you peace of mind.';
  }

  // Default response
  return 'Is there something specific about your symptoms you\'d like to know more about? I\'m here to help guide you.';
}
