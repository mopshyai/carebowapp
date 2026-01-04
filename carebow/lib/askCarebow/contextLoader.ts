/**
 * Context Loader for Ask CareBow
 *
 * Preloads user/member profile data when Ask CareBow opens.
 * This MUST be called before conversation starts.
 *
 * Context includes:
 * - User and selected member info
 * - Health profile (conditions, medications, allergies)
 * - Mobility status and care preferences
 * - Recent orders and service requests
 * - Active subscriptions
 */

import {
  AskCareBowContext,
  MemberProfile,
  RecentOrder,
  RecentRequest,
  ActiveSubscription,
  EntryPointContext,
  EntryPointType,
  createEmptyAskCareBowContext,
  createEmptyMemberProfile,
} from '@/types/askCarebow';

// ============================================
// CONTEXT VALIDATION
// ============================================

export type ContextValidationResult = {
  isValid: boolean;
  requiresMemberSelection: boolean;
  requiresProfileCompletion: boolean;
  missingFields: string[];
  warnings: string[];
};

/**
 * Validates if context is ready for conversation
 */
export function validateContext(context: AskCareBowContext): ContextValidationResult {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Check if member is selected
  if (!context.selectedMemberId) {
    return {
      isValid: false,
      requiresMemberSelection: true,
      requiresProfileCompletion: false,
      missingFields: ['selectedMemberId'],
      warnings: [],
    };
  }

  // Check profile completeness
  const profile = context.memberProfile;

  if (!profile.name) missingFields.push('name');
  if (!profile.age) missingFields.push('age');
  if (!profile.relationship) missingFields.push('relationship');

  // Warnings for incomplete but non-critical fields
  if (profile.conditions.length === 0) {
    warnings.push('No chronic conditions listed - we may ask about this during conversation');
  }
  if (profile.medications.length === 0) {
    warnings.push('No current medications listed');
  }
  if (profile.allergies.length === 0) {
    warnings.push('No allergies listed');
  }

  const requiresProfileCompletion = profile.profileCompleteness < 50;

  return {
    isValid: missingFields.length === 0,
    requiresMemberSelection: false,
    requiresProfileCompletion,
    missingFields,
    warnings,
  };
}

// ============================================
// CONTEXT LOADING
// ============================================

/**
 * Load context for Ask CareBow
 * In production, this would fetch from API/database
 */
export async function loadAskCareBowContext(
  userId: string,
  memberId: string,
  entryPoint: EntryPointContext
): Promise<AskCareBowContext> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 100));

  // In production, fetch from actual data sources
  const memberProfile = await loadMemberProfile(memberId);
  const lastOrders = await loadRecentOrders(userId, memberId);
  const lastRequests = await loadRecentRequests(userId, memberId);
  const subscriptions = await loadActiveSubscriptions(userId);

  const hasAskCareBowPlan = subscriptions.some(
    (sub) => sub.planId === 'ask-carebow' || sub.planId === 'carebow-complete'
  );

  // Get conversation count this month
  const conversationsThisMonth = await getConversationCountThisMonth(userId);

  return {
    userId,
    selectedMemberId: memberId,
    memberProfile,
    lastOrders,
    lastRequests,
    activeSubscriptions: subscriptions,
    entryPoint,
    hasAskCareBowPlan,
    conversationsThisMonth,
    maxFreeConversations: 3,
  };
}

// ============================================
// DATA LOADERS (MOCK - REPLACE WITH REAL API)
// ============================================

async function loadMemberProfile(memberId: string): Promise<MemberProfile> {
  // Mock data - in production, fetch from user profile store
  const mockProfiles: Record<string, MemberProfile> = {
    member_self: {
      id: 'member_self',
      name: 'Me',
      relationship: 'self',
      age: 35,
      gender: 'male',
      conditions: ['Hypertension'],
      medications: ['Lisinopril 10mg'],
      allergies: ['Penicillin'],
      mobilityStatus: 'fully_mobile',
      carePreferences: ['home_care', 'video_consult'],
      profileCompleteness: 85,
    },
    member_mother: {
      id: 'member_mother',
      name: 'Mom',
      relationship: 'mother',
      age: 68,
      gender: 'female',
      conditions: ['Diabetes Type 2', 'Arthritis'],
      medications: ['Metformin 500mg', 'Ibuprofen as needed'],
      allergies: [],
      mobilityStatus: 'needs_assistance',
      carePreferences: ['home_care'],
      profileCompleteness: 90,
    },
    member_father: {
      id: 'member_father',
      name: 'Dad',
      relationship: 'father',
      age: 72,
      gender: 'male',
      conditions: ['Heart Disease', 'High Cholesterol'],
      medications: ['Aspirin 81mg', 'Atorvastatin 20mg'],
      allergies: ['Sulfa drugs'],
      mobilityStatus: 'needs_assistance',
      carePreferences: ['home_care', 'clinic_visit'],
      profileCompleteness: 75,
    },
  };

  return mockProfiles[memberId] || createEmptyMemberProfile();
}

async function loadRecentOrders(
  userId: string,
  memberId: string
): Promise<RecentOrder[]> {
  // Mock data - in production, fetch from orders store
  return [
    {
      id: 'order_001',
      serviceTitle: 'Doctor Home Visit',
      date: '2024-01-10',
      status: 'completed',
    },
    {
      id: 'order_002',
      serviceTitle: 'Blood Test - Home Collection',
      date: '2024-01-05',
      status: 'completed',
    },
  ];
}

async function loadRecentRequests(
  userId: string,
  memberId: string
): Promise<RecentRequest[]> {
  // Mock data - in production, fetch from requests store
  return [
    {
      id: 'request_001',
      serviceTitle: 'Nursing Care',
      date: '2024-01-08',
      status: 'submitted',
    },
  ];
}

async function loadActiveSubscriptions(userId: string): Promise<ActiveSubscription[]> {
  // Mock data - in production, fetch from subscription store
  return [
    // Uncomment to simulate having Ask CareBow plan:
    // {
    //   planId: 'ask-carebow',
    //   planName: 'Ask CareBow',
    //   expiresAt: '2024-12-31',
    // },
  ];
}

async function getConversationCountThisMonth(userId: string): Promise<number> {
  // Mock data - in production, fetch from analytics/session store
  return 1; // User has had 1 conversation this month
}

// ============================================
// CONTEXT-AWARE HELPERS
// ============================================

/**
 * Get questions to skip based on known profile data
 */
export function getQuestionsToSkip(profile: MemberProfile): string[] {
  const skip: string[] = [];

  // Don't ask about conditions if we already know them
  if (profile.conditions.length > 0) {
    skip.push('chronic_conditions');
  }

  // Don't ask about medications if we already know them
  if (profile.medications.length > 0) {
    skip.push('medications');
  }

  // Don't ask about age if we know it
  if (profile.age > 0) {
    skip.push('age');
  }

  return skip;
}

/**
 * Get system context message for AI
 * This helps the AI understand the user's profile
 */
export function buildSystemContextMessage(context: AskCareBowContext): string {
  const { memberProfile: profile } = context;
  const parts: string[] = [];

  // Basic info
  parts.push(
    `User is seeking guidance for ${profile.relationship === 'self' ? 'themselves' : `their ${profile.relationship}`}.`
  );
  parts.push(`Age: ${profile.age} years old.`);

  // Conditions
  if (profile.conditions.length > 0) {
    parts.push(`Known conditions: ${profile.conditions.join(', ')}.`);
  }

  // Medications
  if (profile.medications.length > 0) {
    parts.push(`Current medications: ${profile.medications.join(', ')}.`);
  }

  // Allergies - CRITICAL
  if (profile.allergies.length > 0) {
    parts.push(`ALLERGIES (avoid recommendations involving these): ${profile.allergies.join(', ')}.`);
  }

  // Mobility
  if (profile.mobilityStatus && profile.mobilityStatus !== 'fully_mobile') {
    parts.push(`Mobility status: ${profile.mobilityStatus.replace(/_/g, ' ')}.`);
  }

  // Care preferences
  if (profile.carePreferences && profile.carePreferences.length > 0) {
    parts.push(`Preferred care settings: ${profile.carePreferences.join(', ').replace(/_/g, ' ')}.`);
  }

  // Recent care
  if (context.lastOrders.length > 0) {
    const recent = context.lastOrders[0];
    parts.push(`Recent care: ${recent.serviceTitle} on ${recent.date}.`);
  }

  return parts.join(' ');
}

/**
 * Check if user can start a new conversation
 */
export function canStartConversation(context: AskCareBowContext): {
  allowed: boolean;
  reason?: string;
  showUpgradePrompt: boolean;
} {
  // If user has Ask CareBow plan, always allow
  if (context.hasAskCareBowPlan) {
    return { allowed: true, showUpgradePrompt: false };
  }

  // Check free conversation limit
  if (context.conversationsThisMonth >= context.maxFreeConversations) {
    return {
      allowed: false,
      reason: `You've used all ${context.maxFreeConversations} free conversations this month.`,
      showUpgradePrompt: true,
    };
  }

  return { allowed: true, showUpgradePrompt: false };
}

/**
 * Get appropriate opening message based on entry point and context
 */
export function getContextualOpeningMessage(context: AskCareBowContext): string {
  const { entryPoint, memberProfile: profile } = context;
  const name = profile.relationship === 'self' ? '' : profile.name;

  switch (entryPoint.type) {
    case 'service_context':
      return `I can help you understand if ${entryPoint.serviceName || 'this service'} is right for ${name || 'you'}. What symptoms or concerns do you have?`;

    case 'pre_booking':
      return `Before booking ${entryPoint.serviceName || 'this service'}, let me make sure it's right for ${name || 'your'} situation. What's going on?`;

    case 'order_followup':
      return `I see ${name || 'you'} recently had care with us. How ${profile.relationship === 'self' ? 'are you' : 'is ' + name} feeling now?`;

    case 'today_cta':
    case 'tab':
    default:
      if (name) {
        return `Tell me what's going on with ${name}. I can help understand symptoms, suggest next steps, or help book care.`;
      }
      return "Tell me what's going on. I can help you understand symptoms, suggest next steps, or help book care.";
  }
}
