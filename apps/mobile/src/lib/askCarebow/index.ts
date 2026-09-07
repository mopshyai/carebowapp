/**
 * Ask CareBow Library
 * Export all modules for the AI Health Assistant
 */

// The local engine remains the conservative deterministic fallback. The app
// entry adapter below marks every non-emergency turn for the shared server
// orchestrator so service/care requests cannot bypass canonical Booking and
// CareRequest tools simply because the local classifier called them
// `want_doctor`, `want_test`, or `talk` rather than `symptom_help`.
export type { ConversationResponse } from './conversationEngine';
import { processSafeFallbackUserInput } from './safeFallbackEngine';
import { normalizeIntentForAppRouting } from './orchestratorRouting';

export async function processUserInput(
  ...args: Parameters<typeof processSafeFallbackUserInput>
): Promise<Awaited<ReturnType<typeof processSafeFallbackUserInput>>> {
  const response = await processSafeFallbackUserInput(...args);
  return normalizeIntentForAppRouting(response);
}

export * from './followUpQuestions';
export * from './safetyClassifier';
export * from './serviceRouter';
export * from './guidanceBuilder';
export * from './contextLoader';
export * from './orchestratorRouting';

// Export triage level mapping utilities (P0-2 fix)
export {
  mapToExternalTriageLevel,
  EXTERNAL_TRIAGE_LEVELS,
  INTERNAL_TRIAGE_LEVELS,
} from './prompts';

// DEV-ONLY: Audit harness exports
// These are conditionally available - use require() in __DEV__ blocks
// import { runAskCareBowAudit } from './audit' // Only in __DEV__
