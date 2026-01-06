/**
 * Action Integration for Ask CareBow
 *
 * Converts conversation guidance into actionable outcomes:
 * - Paid services → Orders
 * - On-request services → ServiceRequests
 *
 * All actions are linked back to the conversation for traceability.
 */

import {
  SuggestedAction,
  AskCarebowSession,
  HealthContext,
  UrgencyLevel,
} from '@/types/askCarebow';

// ============================================
// ORDER TYPES
// ============================================

export type OrderFromConversation = {
  id: string;
  conversationId: string;
  userId: string;
  memberId: string;
  serviceId: string;
  serviceTitle: string;
  // Pre-filled from conversation
  scheduledDate?: string;
  duration?: string;
  notes: string;
  // Urgency from assessment
  urgencyLevel: UrgencyLevel;
  // Symptoms summary for provider
  symptomsSummary: string;
  // Status
  status: 'draft' | 'pending_payment' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
};

// ============================================
// SERVICE REQUEST TYPES
// ============================================

export type ServiceRequestFromConversation = {
  id: string;
  conversationId: string;
  userId: string;
  memberId: string;
  serviceId: string;
  serviceTitle: string;
  // From conversation
  symptomsSummary: string;
  urgencyLevel: UrgencyLevel;
  preferredTiming?: string;
  notes: string;
  // Status
  status: 'submitted' | 'under_review' | 'quote_ready' | 'accepted' | 'declined';
  createdAt: string;
  updatedAt: string;
};

// ============================================
// ACTION HANDLERS
// ============================================

/**
 * Create an order from a suggested action
 * Used for paid services with fixed pricing
 */
export async function createOrderFromAction(
  action: SuggestedAction,
  session: AskCarebowSession
): Promise<OrderFromConversation> {
  const now = new Date().toISOString();
  const orderId = generateOrderId();

  const order: OrderFromConversation = {
    id: orderId,
    conversationId: session.id,
    userId: session.userId,
    memberId: session.memberId,
    serviceId: action.serviceId || '',
    serviceTitle: action.label,
    scheduledDate: action.prefilledData?.suggestedDate,
    duration: action.prefilledData?.suggestedDuration,
    notes: action.prefilledData?.notes || '',
    urgencyLevel: action.urgency,
    symptomsSummary: buildSymptomsSummary(session.healthContext),
    status: 'draft',
    createdAt: now,
    updatedAt: now,
  };

  // In production, save to database
  // await saveOrder(order);

  return order;
}

/**
 * Create a service request from a suggested action
 * Used for on-request services that need quotes
 */
export async function createServiceRequest(
  action: SuggestedAction,
  session: AskCarebowSession,
  preferredTiming?: string
): Promise<ServiceRequestFromConversation> {
  const now = new Date().toISOString();
  const requestId = generateRequestId();

  const request: ServiceRequestFromConversation = {
    id: requestId,
    conversationId: session.id,
    userId: session.userId,
    memberId: session.memberId,
    serviceId: action.serviceId || '',
    serviceTitle: action.label,
    symptomsSummary: buildSymptomsSummary(session.healthContext),
    urgencyLevel: action.urgency,
    preferredTiming,
    notes: action.prefilledData?.notes || '',
    status: 'submitted',
    createdAt: now,
    updatedAt: now,
  };

  // In production, save to database
  // await saveServiceRequest(request);

  return request;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateOrderId(): string {
  return `order_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function generateRequestId(): string {
  return `request_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Build a summary of symptoms for the service provider
 */
function buildSymptomsSummary(context: HealthContext): string {
  const parts: string[] = [];

  // Chief complaint
  if (context.primarySymptom) {
    parts.push(`Chief Complaint: ${context.primarySymptom}`);
  }

  // Duration
  if (context.duration) {
    parts.push(`Duration: ${formatDuration(context.duration)}`);
  }

  // Severity
  if (context.severity) {
    parts.push(`Severity: ${context.severity}/10`);
  }

  // Frequency
  if (context.frequency) {
    parts.push(`Frequency: ${context.frequency}`);
  }

  // Associated symptoms
  if (context.associatedSymptoms.length > 0) {
    parts.push(`Associated Symptoms: ${context.associatedSymptoms.join(', ')}`);
  }

  // Chronic conditions
  if (context.chronicConditions.length > 0) {
    parts.push(`Medical History: ${context.chronicConditions.join(', ')}`);
  }

  // Medications
  if (context.medications.length > 0) {
    parts.push(`Current Medications: ${context.medications.join(', ')}`);
  }

  // Allergies
  if (context.allergies.length > 0) {
    parts.push(`Allergies: ${context.allergies.join(', ')}`);
  }

  // Recent events
  if (context.recentEvents.length > 0) {
    parts.push(`Recent Events: ${context.recentEvents.join(', ')}`);
  }

  // Additional notes
  if (context.additionalNotes) {
    parts.push(`Notes: ${context.additionalNotes}`);
  }

  return parts.join('\n');
}

function formatDuration(duration: string): string {
  const durationMap: Record<string, string> = {
    just_now: 'Just started',
    few_hours: 'A few hours',
    today: 'Started today',
    '1_2_days': '1-2 days',
    '3_7_days': '3-7 days',
    '1_2_weeks': '1-2 weeks',
    more_than_2_weeks: 'More than 2 weeks',
    chronic: 'Chronic/ongoing',
  };
  return durationMap[duration] || duration;
}

// ============================================
// SERVICE TYPE DETECTION
// ============================================

/**
 * Determine if a service is paid or on-request
 */
export function getServiceType(serviceId: string): 'paid' | 'on_request' {
  // On-request services (require quotes)
  const onRequestServices = [
    'nursing-care',
    'physiotherapy',
    'caregiver',
    'equipment-rental',
    'specialized-care',
  ];

  if (onRequestServices.includes(serviceId)) {
    return 'on_request';
  }

  return 'paid';
}

// ============================================
// DEEP LINK GENERATION
// ============================================

/**
 * Generate deep link to service booking with pre-filled data
 */
export function generateBookingDeepLink(
  action: SuggestedAction,
  conversationId: string
): string {
  const params = new URLSearchParams({
    service: action.serviceId || '',
    conversation: conversationId,
    urgency: action.urgency,
  });

  if (action.prefilledData) {
    if (action.prefilledData.memberId) {
      params.set('member', action.prefilledData.memberId);
    }
    if (action.prefilledData.suggestedDate) {
      params.set('date', action.prefilledData.suggestedDate);
    }
    if (action.prefilledData.notes) {
      params.set('notes', encodeURIComponent(action.prefilledData.notes));
    }
  }

  return `/service-details/${action.serviceId}?${params.toString()}`;
}

/**
 * Generate deep link for emergency services
 */
export function generateEmergencyDeepLink(): string {
  return 'tel:911';
}

// ============================================
// CONVERSATION LINKING
// ============================================

/**
 * Link an order to a conversation
 * Updates the session with the linked order ID
 */
export async function linkOrderToConversation(
  sessionId: string,
  orderId: string
): Promise<void> {
  // In production, update the session in database
  // await updateSession(sessionId, { linkedOrderId: orderId });
  console.log(`Linked order ${orderId} to conversation ${sessionId}`);
}

/**
 * Link a service request to a conversation
 * Updates the session with the linked request ID
 */
export async function linkRequestToConversation(
  sessionId: string,
  requestId: string
): Promise<void> {
  // In production, update the session in database
  // await updateSession(sessionId, { linkedRequestId: requestId });
  console.log(`Linked request ${requestId} to conversation ${sessionId}`);
}
