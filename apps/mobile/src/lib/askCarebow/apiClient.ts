/**
 * Live Ask CareBow transport.
 *
 * The user-facing conversation screen builds safety guidance with the
 * deterministic on-device engine, then asks the authenticated backend to
 * improve wording. This module intentionally contains no canned medical
 * answers, unverified memory candidates, local uploads, or artificial latency.
 */
import type { MemorySnapshot, MemoryCandidate } from '../../types/healthMemory';
import type { ImageAttachment } from '../../components/askCarebow/ImageUploadBottomSheet';
import type { EnhancedResponse } from '../../components/askCarebow/EnhancedChatBubble';
import { askCareBowApi } from '../../services/api/endpoints/askCareBow';
import {
  EXTERNAL_TRIAGE_LEVELS,
  HEALTH_BUDDY_SYSTEM_PROMPT,
  type ExternalTriageLevel,
} from './prompts';

export { EXTERNAL_TRIAGE_LEVELS, HEALTH_BUDDY_SYSTEM_PROMPT };
export type { ExternalTriageLevel };

export type AskCareBowMessagePayload = {
  userId: string;
  context: {
    forWhom: 'me' | 'family';
    ageGroup?: string;
    relationship?: string;
    caregiverPresent?: boolean;
  };
  messageText: string;
  attachments: Array<{ type: 'image'; uri: string; mimeType: string }>;
  memorySnapshot: MemorySnapshot;
  conversationId?: string;
  systemPrompt?: string;
  /** Stable id for this user turn so retries cannot consume quota twice. */
  requestId?: string;
};

export type AskCareBowMessageResponse = {
  conversationId: string;
  assistantMessage: string;
  enhancedResponse?: EnhancedResponse;
  triageLevel: ExternalTriageLevel;
  followUpQuestions: string[];
  memoryCandidates: MemoryCandidate[];
};

const emergencyPattern =
  /(?:difficulty breathing|can(?:not|'t) breathe|chest pain|unconscious|seizure|stroke|severe bleeding|suicid)/i;

function createTurnRequestId(): string {
  return `ask-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export async function sendAskCareBowMessage(
  payload: AskCareBowMessagePayload
): Promise<AskCareBowMessageResponse> {
  if (payload.attachments.length > 0) {
    throw new Error('Image analysis is not available in the production mobile API yet.');
  }

  const triageLevel: ExternalTriageLevel = emergencyPattern.test(payload.messageText)
    ? 'emergency'
    : 'self_care';
  const safetyDraft =
    triageLevel === 'emergency'
      ? 'This may be an emergency. Contact local emergency services now. Do not wait for an online response.'
      : 'I can help you think through this safely. Please share when it started, how severe it is, and any warning signs. This is guidance, not a diagnosis.';

  const response = await askCareBowApi.rewrite({
    messageText: payload.messageText,
    draftResponse: safetyDraft,
    forWhom: payload.context.forWhom,
    requestId: payload.requestId || createTurnRequestId(),
  });
  if (!response.success || !response.assistantMessage) {
    throw new Error(response.error || 'Ask CareBow is unavailable');
  }

  return {
    conversationId: payload.conversationId || `local-${Date.now()}`,
    assistantMessage: response.assistantMessage,
    triageLevel,
    followUpQuestions: [],
    memoryCandidates: [],
  };
}

export async function uploadImage(_image: ImageAttachment): Promise<string> {
  throw new Error('Image upload is not available in the production mobile API yet.');
}

export function createMessagePayload(
  userId: string,
  messageText: string,
  context: AskCareBowMessagePayload['context'],
  attachments: ImageAttachment[],
  memorySnapshot: MemorySnapshot,
  conversationId?: string
): AskCareBowMessagePayload {
  return {
    userId,
    messageText,
    context,
    attachments: attachments.map((image) => ({
      type: 'image',
      uri: image.uri,
      mimeType: image.type,
    })),
    memorySnapshot,
    conversationId,
    systemPrompt: conversationId ? undefined : HEALTH_BUDDY_SYSTEM_PROMPT,
    requestId: createTurnRequestId(),
  };
}
