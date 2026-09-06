import type { ConversationResponse } from './conversationEngine';

/**
 * The shared server orchestrator is CareBow's canonical conversation/action
 * engine. The local mobile engine exists for deterministic safety and graceful
 * fallback only; it must not prevent doctor/test/custom-care turns from reaching
 * the server tools that own Booking and CareRequest state.
 */
export function shouldRouteThroughSharedOrchestrator(
  response: Pick<ConversationResponse, 'intent' | 'isEmergency'>
): boolean {
  return response.isEmergency !== true && response.intent !== 'emergency';
}

/**
 * ConversationScreen currently uses the historical `symptom_help` marker as
 * its orchestrator gate. Normalize only the app-entry response so all
 * non-emergency intents reach the shared orchestrator without changing the
 * underlying intent classifier or its regression tests.
 */
export function normalizeIntentForAppRouting(
  response: ConversationResponse
): ConversationResponse {
  if (!shouldRouteThroughSharedOrchestrator(response)) return response;
  return response.intent === 'symptom_help'
    ? response
    : { ...response, intent: 'symptom_help' };
}
