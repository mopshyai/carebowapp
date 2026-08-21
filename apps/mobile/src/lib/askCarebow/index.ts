/**
 * Ask CareBow Library
 * Export all modules for the AI Health Assistant
 */

// The legacy engine remains available to focused regression tests, but the app
// entry point uses the conservative clinical fallback gate so a shadowed or
// unavailable server orchestrator cannot skip required intake fields.
export type { ConversationResponse } from './conversationEngine';
export { processSafeFallbackUserInput as processUserInput } from './safeFallbackEngine';
export * from './followUpQuestions';
export * from './safetyClassifier';
export * from './serviceRouter';
export * from './guidanceBuilder';
export * from './contextLoader';
export * from './actionIntegration';

// Export triage level mapping utilities (P0-2 fix)
export {
  mapToExternalTriageLevel,
  EXTERNAL_TRIAGE_LEVELS,
  INTERNAL_TRIAGE_LEVELS,
} from './prompts';

// DEV-ONLY: Audit harness exports
// These are conditionally available - use require() in __DEV__ blocks
// import { runAskCareBowAudit } from './audit' // Only in __DEV__
