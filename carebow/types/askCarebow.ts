/**
 * Ask CareBow Types
 * Data models for the AI Health Assistant
 *
 * This is the intelligence layer that:
 * - Understands user + selected family member
 * - Uses health profile data responsibly
 * - Asks smart follow-up questions like a clinician
 * - Produces clear guidance + next actions
 * - Converts guidance into Orders/ServiceRequests
 */

// ============================================
// ENTRY POINT CONTEXT
// ============================================

export type EntryPointType =
  | 'tab'                    // Bottom tab navigation
  | 'today_cta'              // "AI Health Assistant" CTA on Today screen
  | 'service_context'        // "Ask about this service"
  | 'symptom_context'        // "Ask about symptoms"
  | 'pre_booking'            // "Ask before booking"
  | 'order_followup';        // Follow-up on existing order

export type EntryPointContext = {
  type: EntryPointType;
  serviceId?: string;        // If entering from a service
  serviceName?: string;
  orderId?: string;          // If following up on an order
  prefilledSymptom?: string; // Pre-filled symptom text
};

// ============================================
// USER/MEMBER CONTEXT (PRELOADED)
// ============================================

export type Gender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export type MobilityStatus =
  | 'fully_mobile'
  | 'needs_assistance'
  | 'wheelchair_bound'
  | 'bedridden';

export type CarePreference =
  | 'home_care'
  | 'clinic_visit'
  | 'video_consult'
  | 'no_preference';

export type MemberProfile = {
  id: string;
  name: string;
  relationship: string;
  age: number;
  gender?: Gender;
  conditions: string[];       // Chronic conditions
  medications: string[];      // Current medications
  allergies: string[];        // Known allergies
  mobilityStatus?: MobilityStatus;
  carePreferences?: CarePreference[];
  profileCompleteness: number; // 0-100%
};

export type RecentOrder = {
  id: string;
  serviceTitle: string;
  date: string;
  status: string;
};

export type RecentRequest = {
  id: string;
  serviceTitle: string;
  date: string;
  status: string;
};

export type ActiveSubscription = {
  planId: string;
  planName: string;
  expiresAt: string;
};

/**
 * Context preloaded when Ask CareBow opens
 * This MUST be loaded before conversation starts
 */
export type AskCareBowContext = {
  userId: string;
  selectedMemberId: string;
  memberProfile: MemberProfile;
  lastOrders: RecentOrder[];
  lastRequests: RecentRequest[];
  activeSubscriptions: ActiveSubscription[];
  entryPoint: EntryPointContext;
  hasAskCareBowPlan: boolean;
  conversationsThisMonth: number;
  maxFreeConversations: number;
};

// ============================================
// SUGGESTED ACTIONS (ACTIONABLE OUTCOMES)
// ============================================

export type ActionType =
  | 'book_doctor'
  | 'request_nurse'
  | 'rent_equipment'
  | 'book_lab_test'
  | 'video_consult'
  | 'call_emergency'
  | 'monitor_at_home'
  | 'no_action_needed';

export type SuggestedAction = {
  type: ActionType;
  label: string;
  description: string;
  serviceId?: string;
  urgency: UrgencyLevel;
  prefilledData?: {
    memberId: string;
    suggestedDate?: string;
    suggestedDuration?: string;
    notes: string;
  };
};

// ============================================
// URGENCY LEVELS
// ============================================

export type UrgencyLevel =
  | 'self_care'        // Can manage at home
  | 'monitor'          // Watch and wait
  | 'non_urgent'       // See doctor when convenient
  | 'soon'             // See doctor within 24-48 hours
  | 'urgent'           // See doctor today
  | 'emergency';       // Seek immediate care

export const urgencyConfig: Record<UrgencyLevel, {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  action: string;
}> = {
  self_care: {
    label: 'Self-Care',
    description: 'This can likely be managed at home with rest and care.',
    color: '#16A34A',
    bgColor: '#DCFCE7',
    action: 'Continue monitoring',
  },
  monitor: {
    label: 'Monitor',
    description: 'Keep an eye on symptoms and note any changes.',
    color: '#0D9488',
    bgColor: '#CCFBF1',
    action: 'Watch for changes',
  },
  non_urgent: {
    label: 'Non-Urgent',
    description: 'Consider seeing a doctor when convenient.',
    color: '#2563EB',
    bgColor: '#DBEAFE',
    action: 'Schedule visit',
  },
  soon: {
    label: 'See Doctor Soon',
    description: 'We recommend seeing a doctor within 1-2 days.',
    color: '#D97706',
    bgColor: '#FEF3C7',
    action: 'Book appointment',
  },
  urgent: {
    label: 'Urgent',
    description: 'Please see a doctor today.',
    color: '#EA580C',
    bgColor: '#FFEDD5',
    action: 'Seek care today',
  },
  emergency: {
    label: 'Emergency',
    description: 'Please seek immediate medical attention.',
    color: '#DC2626',
    bgColor: '#FEE2E2',
    action: 'Call emergency services',
  },
};

// ============================================
// HEALTH CONTEXT (Structured Data)
// ============================================

export type Severity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type Duration =
  | 'just_now'
  | 'few_hours'
  | 'today'
  | '1_2_days'
  | '3_7_days'
  | '1_2_weeks'
  | 'more_than_2_weeks'
  | 'chronic';

export type Frequency =
  | 'constant'
  | 'intermittent'
  | 'occasional'
  | 'first_time';

export type AgeGroup =
  | 'infant'      // 0-1
  | 'child'       // 2-12
  | 'teen'        // 13-17
  | 'adult'       // 18-64
  | 'senior';     // 65+

export type HealthContext = {
  primarySymptom: string;
  duration?: Duration;
  severity?: Severity;
  frequency?: Frequency;
  associatedSymptoms: string[];
  riskFactors: string[];
  ageGroup?: AgeGroup;
  chronicConditions: string[];
  recentEvents: string[]; // injury, travel, surgery, etc.
  medications: string[];
  allergies: string[];
  additionalNotes: string;
};

export const createEmptyHealthContext = (): HealthContext => ({
  primarySymptom: '',
  associatedSymptoms: [],
  riskFactors: [],
  chronicConditions: [],
  recentEvents: [],
  medications: [],
  allergies: [],
  additionalNotes: '',
});

// ============================================
// MESSAGE TYPES
// ============================================

export type MessageRole = 'user' | 'assistant' | 'system';

export type MessageContentType =
  | 'text'
  | 'question'
  | 'guidance'
  | 'service_recommendation'
  | 'emergency_alert'
  | 'quick_options';

export type QuickOption = {
  id: string;
  label: string;
  value: string;
};

export type ServiceRecommendation = {
  serviceId: string;
  serviceTitle: string;
  reason: string;
  urgency: UrgencyLevel;
  prefilledNotes: string;
};

export type GuidanceSection = {
  title: string;
  items: string[];
};

/**
 * Structured guidance response following clinical output format:
 * 1. Understanding (brief)
 * 2. Guidance (calm, neutral)
 * 3. What to watch for
 * 4. Recommended next step (actionable)
 * 5. Disclaimer (soft)
 */
export type GuidanceResponse = {
  // 1. Understanding - "Based on what you shared..."
  understanding: string;
  // 2. Possible causes - "This can sometimes be caused by..."
  possibleCauses: string[];
  // 3. What you can do - immediate actions
  immediateActions: string[];
  // 4. What to watch for - "If you notice X or Y, seek care"
  whenToSeekHelp: string[];
  // 5. Recommended actions with buttons
  suggestedActions: SuggestedAction[];
  // Legacy field for backwards compatibility
  recommendedServices: ServiceRecommendation[];
  // Risk level determined from assessment
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  // Detected symptoms from conversation
  detectedSymptoms: string[];
};

export type Message = {
  id: string;
  role: MessageRole;
  contentType: MessageContentType;
  text: string;
  timestamp: string;
  // Optional structured data based on contentType
  quickOptions?: QuickOption[];
  guidance?: GuidanceResponse;
  serviceRecommendation?: ServiceRecommendation;
  suggestedActions?: SuggestedAction[];
  isEmergency?: boolean;
  // For tracking "why I'm asking" explanations
  explanation?: string;
};

// ============================================
// FOLLOW-UP QUESTION TYPES
// ============================================

export type FollowUpQuestionType =
  | 'duration'
  | 'severity'
  | 'frequency'
  | 'associated_symptoms'
  | 'risk_factors'
  | 'age'
  | 'chronic_conditions'
  | 'recent_events'
  | 'medications'
  | 'location'
  | 'triggers'
  | 'relief_attempts';

export type FollowUpQuestion = {
  type: FollowUpQuestionType;
  question: string;
  quickOptions?: QuickOption[];
  required: boolean;
  contextKey: keyof HealthContext;
};

// ============================================
// CONVERSATION STATE
// ============================================

export type ConversationPhase =
  | 'initial'           // Waiting for first input
  | 'gathering'         // Asking follow-up questions
  | 'assessing'         // Analyzing collected data
  | 'guidance'          // Providing recommendations
  | 'service_routing'   // Helping book a service
  | 'completed';        // Session ended

export type ConversationState = {
  phase: ConversationPhase;
  questionsAsked: FollowUpQuestionType[];
  questionsRemaining: FollowUpQuestionType[];
  currentQuestion?: FollowUpQuestion;
  healthContext: HealthContext;
  urgencyLevel?: UrgencyLevel;
  hasProvidedGuidance: boolean;
};

// ============================================
// SESSION SUMMARY TYPES (For Doctor Handoff)
// ============================================

/**
 * Differential possibility from triage analysis
 */
export type DifferentialPossibility = {
  condition: string;
  likelihood: 'likely' | 'possible' | 'less_likely';
  matchingFactors: string[];
  reasoning: string;
};

/**
 * Triage outcome summary for clinical reference
 */
export type TriageOutcome = {
  urgencyLevel: UrgencyLevel;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  redFlagsDetected: string[];
  differentialPossibilities: DifferentialPossibility[];
  recommendedTimeframe: string; // e.g., "within 24-48 hours"
  safetyCheckPassed: boolean;
};

/**
 * Comprehensive session summary for doctor handoff and audit
 */
export type SessionSummary = {
  // Chief complaint in patient's words
  chiefComplaint: string;

  // Structured data collected during conversation
  collectedData: {
    primarySymptom: string;
    duration: string;
    severity: string;
    associatedSymptoms: string[];
    relevantHistory: string[];
    medications: string[];
    allergies: string[];
  };

  // Triage assessment outcome
  triageOutcome: TriageOutcome;

  // Actions recommended to user
  recommendedActions: string[];

  // What user actually did (if tracked)
  actualActionTaken?: string;

  // AI confidence in assessment (0-100)
  assessmentConfidence: number;

  // Questions that weren't answered
  unansweredQuestions: string[];
};

/**
 * User feedback on session helpfulness
 */
export type SessionFeedback = {
  wasHelpful: boolean;
  rating: 1 | 2 | 3 | 4 | 5;
  feedbackNote?: string;
  feedbackTimestamp: string;
};

// ============================================
// SESSION TYPES
// ============================================

/**
 * Session with full traceability for auditability and clinical safety
 */
export type AskCarebowSession = {
  id: string;
  userId: string;
  memberId: string;
  memberName?: string;
  messages: Message[];
  conversationState: ConversationState;
  healthContext: HealthContext;
  urgencyLevel?: UrgencyLevel;
  recommendedServices: ServiceRecommendation[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  feedbackProvided?: boolean;
  feedbackRating?: 1 | 2 | 3 | 4 | 5;

  // === TRACEABILITY FIELDS (CRITICAL FOR AUDIT) ===

  // Symptoms detected during conversation
  detectedSymptoms: string[];

  // Risk level assessment
  riskLevel?: 'low' | 'moderate' | 'high' | 'critical';

  // Actions suggested to user
  suggestedActions: SuggestedAction[];

  // Linked order if user booked a service
  linkedOrderId?: string;

  // Linked service request if user requested on-request service
  linkedRequestId?: string;

  // Entry point context
  entryPoint?: EntryPointContext;

  // Member profile snapshot at time of conversation
  memberProfileSnapshot?: MemberProfile;

  // Did the conversation trigger an emergency flow?
  triggeredEmergencyFlow?: boolean;

  // === ENHANCED SESSION LOGGING ===

  // Comprehensive session summary (generated when session ends)
  sessionSummary?: SessionSummary;

  // User feedback (collected after session)
  feedback?: SessionFeedback;

  // Doctor notes export status
  doctorNotesSent?: boolean;
  doctorNotesSentAt?: string;
  doctorNotesRecipient?: string;

  // Follow-up scheduling
  followUpScheduled?: boolean;
  followUpScheduledFor?: string;
  followUpReminderId?: string;

  // Session export history
  exportHistory?: Array<{
    exportedAt: string;
    exportFormat: 'pdf' | 'text' | 'json';
    exportedTo: 'email' | 'share' | 'download';
  }>;
};

// ============================================
// RED FLAG SYMPTOMS (EMERGENCY DETECTION)
// ============================================

export const RED_FLAG_SYMPTOMS = [
  'chest pain',
  'difficulty breathing',
  'shortness of breath',
  'can\'t breathe',
  'unconscious',
  'passed out',
  'fainted',
  'severe bleeding',
  'heavy bleeding',
  'stroke',
  'face drooping',
  'arm weakness',
  'slurred speech',
  'seizure',
  'convulsion',
  'severe head injury',
  'head trauma',
  'suicidal',
  'suicide',
  'overdose',
  'poisoning',
  'severe allergic reaction',
  'anaphylaxis',
  'can\'t swallow',
  'choking',
  'severe burns',
  'electric shock',
  'drowning',
  'heart attack',
  'cardiac arrest',
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const generateSessionId = (): string => {
  return `ask_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export const createMessage = (
  role: MessageRole,
  text: string,
  contentType: MessageContentType = 'text',
  extras?: Partial<Message>
): Message => ({
  id: generateMessageId(),
  role,
  contentType,
  text,
  timestamp: new Date().toISOString(),
  ...extras,
});

export const durationLabels: Record<Duration, string> = {
  just_now: 'Just now',
  few_hours: 'A few hours',
  today: 'Started today',
  '1_2_days': '1-2 days',
  '3_7_days': '3-7 days',
  '1_2_weeks': '1-2 weeks',
  more_than_2_weeks: 'More than 2 weeks',
  chronic: 'Ongoing/chronic',
};

export const frequencyLabels: Record<Frequency, string> = {
  constant: 'Constant',
  intermittent: 'Comes and goes',
  occasional: 'Occasional',
  first_time: 'First time',
};

// ============================================
// COPY RULES (CLINICAL LANGUAGE)
// ============================================

/**
 * NEVER use these phrases:
 * - "Don't worry, it's nothing"
 * - "You'll be fine"
 * - "This is definitely X"
 *
 * ALWAYS use these patterns:
 * - "May be related to"
 * - "In some cases"
 * - "A healthcare professional can confirm"
 */
export const COPY_RULES = {
  forbidden: [
    "don't worry",
    "you'll be fine",
    "definitely",
    "certainly",
    "100%",
    "always",
    "never",
    "nothing to worry about",
  ],
  preferred: {
    diagnosis: "may be related to",
    certainty: "in some cases",
    recommendation: "a healthcare professional can confirm",
    understanding: "based on what you've shared",
    guidance: "this can sometimes be caused by",
    watchFor: "if you notice",
  },
} as const;

// ============================================
// OPENING PROMPTS (CONTEXT-AWARE)
// ============================================

export const OPENING_PROMPTS: Record<EntryPointType, string> = {
  tab: "Tell me what's going on. I can help you understand symptoms, suggest next steps, or help book care.",
  today_cta: "Hi! I'm here to help with any health concerns. What would you like to talk about?",
  service_context: "I can help you understand if this service is right for your situation. What symptoms or concerns do you have?",
  symptom_context: "Let's talk about what you're experiencing. Describe your symptoms and I'll help guide you.",
  pre_booking: "Before you book, let me make sure this is the right service for your needs. What's going on?",
  order_followup: "I see you recently used our services. How are you feeling now? Any concerns?",
};

export const OPENING_CHIPS: Record<EntryPointType, string[]> = {
  tab: ['Symptoms', 'Care for my parent', 'Before booking', 'Medication question'],
  today_cta: ['New symptoms', 'Follow up on care', 'Ask about a service'],
  service_context: ['Symptoms I have', 'Is this right for me?', 'What to expect'],
  symptom_context: ['Describe symptoms', 'How long has this been?'],
  pre_booking: ['My symptoms', 'What does this include?', 'Is this urgent?'],
  order_followup: ['Feeling better', 'No improvement', 'New concern'],
};

// ============================================
// EMPTY CONTEXT CREATORS
// ============================================

export const createEmptyMemberProfile = (): MemberProfile => ({
  id: '',
  name: '',
  relationship: '',
  age: 0,
  conditions: [],
  medications: [],
  allergies: [],
  profileCompleteness: 0,
});

export const createEmptyEntryContext = (): EntryPointContext => ({
  type: 'tab',
});

export const createEmptyAskCareBowContext = (): AskCareBowContext => ({
  userId: '',
  selectedMemberId: '',
  memberProfile: createEmptyMemberProfile(),
  lastOrders: [],
  lastRequests: [],
  activeSubscriptions: [],
  entryPoint: createEmptyEntryContext(),
  hasAskCareBowPlan: false,
  conversationsThisMonth: 0,
  maxFreeConversations: 3,
});

// ============================================
// DISCLAIMER TEXT
// ============================================

export const DISCLAIMER = {
  short: "This guidance doesn't replace a medical professional.",
  full: "This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition.",
  emergency: "If you are experiencing a medical emergency, call 911 or your local emergency services immediately.",
} as const;

// ============================================
// SESSION SUMMARY HELPERS
// ============================================

/**
 * Generate session summary from completed session
 */
export const generateSessionSummary = (session: AskCarebowSession): SessionSummary => {
  const { healthContext, messages, conversationState, urgencyLevel, riskLevel, detectedSymptoms } = session;

  // Extract chief complaint from first user message
  const firstUserMessage = messages.find(m => m.role === 'user');
  const chiefComplaint = firstUserMessage?.text || healthContext.primarySymptom || 'Not specified';

  // Format duration for display
  const durationText = healthContext.duration
    ? durationLabels[healthContext.duration]
    : 'Not specified';

  // Format severity
  const severityText = healthContext.severity
    ? `${healthContext.severity}/10`
    : 'Not specified';

  // Build recommended actions from suggested actions
  const recommendedActions = session.suggestedActions?.map(a => a.label) || [];

  // Calculate unanswered questions
  const unansweredQuestions = conversationState.questionsRemaining.map(q => {
    const questionMap: Record<FollowUpQuestionType, string> = {
      duration: 'How long has this been going on?',
      severity: 'How severe is it on a scale of 1-10?',
      frequency: 'How often does this occur?',
      associated_symptoms: 'Any other symptoms?',
      risk_factors: 'Any relevant risk factors?',
      age: 'Patient age',
      chronic_conditions: 'Any chronic conditions?',
      recent_events: 'Any recent events (injury, travel, etc.)?',
      medications: 'Current medications?',
      location: 'Where exactly is the symptom?',
      triggers: 'What triggers it?',
      relief_attempts: 'What have you tried for relief?',
    };
    return questionMap[q] || q;
  });

  // Build timeframe recommendation based on urgency
  const timeframeMap: Record<UrgencyLevel, string> = {
    self_care: 'Self-care at home',
    monitor: 'Monitor for 24-48 hours',
    non_urgent: 'Within 1-2 weeks',
    soon: 'Within 24-48 hours',
    urgent: 'Today',
    emergency: 'Immediately',
  };

  return {
    chiefComplaint,
    collectedData: {
      primarySymptom: healthContext.primarySymptom || 'Not specified',
      duration: durationText,
      severity: severityText,
      associatedSymptoms: healthContext.associatedSymptoms,
      relevantHistory: [
        ...healthContext.chronicConditions,
        ...healthContext.recentEvents,
      ],
      medications: healthContext.medications,
      allergies: healthContext.allergies,
    },
    triageOutcome: {
      urgencyLevel: urgencyLevel || 'monitor',
      riskLevel: riskLevel || 'low',
      redFlagsDetected: detectedSymptoms.filter(s =>
        RED_FLAG_SYMPTOMS.some(rf => s.toLowerCase().includes(rf))
      ),
      differentialPossibilities: [], // To be filled by guidanceBuilder
      recommendedTimeframe: timeframeMap[urgencyLevel || 'monitor'],
      safetyCheckPassed: !session.triggeredEmergencyFlow,
    },
    recommendedActions,
    assessmentConfidence: calculateAssessmentConfidence(session),
    unansweredQuestions,
  };
};

/**
 * Calculate confidence score based on data completeness
 */
const calculateAssessmentConfidence = (session: AskCarebowSession): number => {
  const { healthContext, conversationState } = session;
  let score = 0;

  // Primary symptom (+20)
  if (healthContext.primarySymptom) score += 20;

  // Duration (+15)
  if (healthContext.duration) score += 15;

  // Severity (+15)
  if (healthContext.severity) score += 15;

  // Associated symptoms (+10)
  if (healthContext.associatedSymptoms.length > 0) score += 10;

  // Frequency (+10)
  if (healthContext.frequency) score += 10;

  // Medications known (+10)
  if (healthContext.medications.length > 0) score += 10;

  // Chronic conditions known (+10)
  if (healthContext.chronicConditions.length > 0) score += 10;

  // Questions answered ratio (+10 max)
  const answeredRatio = conversationState.questionsAsked.length /
    (conversationState.questionsAsked.length + conversationState.questionsRemaining.length);
  score += Math.round(answeredRatio * 10);

  return Math.min(100, score);
};

/**
 * Format session for doctor notes export
 */
export const formatSessionForDoctorNotes = (session: AskCarebowSession): string => {
  const summary = session.sessionSummary || generateSessionSummary(session);
  const timestamp = new Date(session.createdAt).toLocaleString();

  return `
================================================================================
CAREBOW AI HEALTH ASSISTANT - SESSION SUMMARY
Generated: ${new Date().toLocaleString()}
Session Date: ${timestamp}
Session ID: ${session.id}
================================================================================

PATIENT INFORMATION
-------------------
Name: ${session.memberName || 'Not specified'}
Member ID: ${session.memberId}

CHIEF COMPLAINT
---------------
"${summary.chiefComplaint}"

COLLECTED DATA
--------------
Primary Symptom: ${summary.collectedData.primarySymptom}
Duration: ${summary.collectedData.duration}
Severity: ${summary.collectedData.severity}

Associated Symptoms:
${summary.collectedData.associatedSymptoms.length > 0
  ? summary.collectedData.associatedSymptoms.map(s => `  - ${s}`).join('\n')
  : '  None reported'}

Relevant Medical History:
${summary.collectedData.relevantHistory.length > 0
  ? summary.collectedData.relevantHistory.map(h => `  - ${h}`).join('\n')
  : '  None reported'}

Current Medications:
${summary.collectedData.medications.length > 0
  ? summary.collectedData.medications.map(m => `  - ${m}`).join('\n')
  : '  None reported'}

Known Allergies:
${summary.collectedData.allergies.length > 0
  ? summary.collectedData.allergies.map(a => `  - ${a}`).join('\n')
  : '  None reported'}

AI TRIAGE ASSESSMENT
--------------------
Urgency Level: ${urgencyConfig[summary.triageOutcome.urgencyLevel].label}
Risk Level: ${summary.triageOutcome.riskLevel.toUpperCase()}
Recommended Timeframe: ${summary.triageOutcome.recommendedTimeframe}
Safety Check: ${summary.triageOutcome.safetyCheckPassed ? 'PASSED' : 'RED FLAGS DETECTED'}

${summary.triageOutcome.redFlagsDetected.length > 0
  ? `Red Flags Detected:\n${summary.triageOutcome.redFlagsDetected.map(f => `  ⚠️ ${f}`).join('\n')}`
  : ''}

ACTIONS RECOMMENDED
-------------------
${summary.recommendedActions.length > 0
  ? summary.recommendedActions.map((a, i) => `${i + 1}. ${a}`).join('\n')
  : 'None specified'}

DATA COMPLETENESS
-----------------
Assessment Confidence: ${summary.assessmentConfidence}%

Unanswered Questions:
${summary.unansweredQuestions.length > 0
  ? summary.unansweredQuestions.map(q => `  - ${q}`).join('\n')
  : '  All key questions answered'}

================================================================================
DISCLAIMER: This AI-generated summary is for informational purposes only and
does not constitute medical advice, diagnosis, or treatment. The healthcare
provider should conduct their own independent assessment.
================================================================================
`.trim();
};

/**
 * Format session as JSON for export
 */
export const formatSessionForExport = (session: AskCarebowSession): object => {
  const summary = session.sessionSummary || generateSessionSummary(session);

  return {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    session: {
      id: session.id,
      memberId: session.memberId,
      memberName: session.memberName,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    },
    summary,
    conversationLog: session.messages.map(m => ({
      role: m.role,
      text: m.text,
      timestamp: m.timestamp,
      contentType: m.contentType,
    })),
    feedback: session.feedback,
    linkedActions: {
      orderId: session.linkedOrderId,
      requestId: session.linkedRequestId,
      followUpScheduled: session.followUpScheduled,
      followUpDate: session.followUpScheduledFor,
    },
  };
};
