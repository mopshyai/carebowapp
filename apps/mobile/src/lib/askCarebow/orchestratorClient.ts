/**
 * Wrapper around the mobile-auth'd orchestrator for symptom-help turns.
 *
 * One requestId belongs to one user turn. ConversationScreen passes the same id
 * here and to the rewrite fallback so the backend can meter the turn exactly
 * once even when an orchestrator shadow turn falls back to rewrite.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { askCarebowOrchestratorApi } from '../../services/api/endpoints/askCarebowOrchestrator';
import { ApiClient } from '../../services/api/ApiClient';
import { postSSE } from '../../services/api/sseClient';
import { createLogger } from '../../utils/logger';

const logger = createLogger('OrchestratorClient');

const SESSION_CACHE_PREFIX = '@carebow/orchestrator_session/';

function sessionCacheKey(localSessionId: string): string {
  return `${SESSION_CACHE_PREFIX}${localSessionId}`;
}

export async function getCachedBackendSessionId(localSessionId: string): Promise<string | null> {
  return AsyncStorage.getItem(sessionCacheKey(localSessionId));
}

async function getOrCreateBackendSessionId(
  localSessionId: string,
  profileId: string
): Promise<string> {
  const key = sessionCacheKey(localSessionId);
  const cached = await AsyncStorage.getItem(key);
  if (cached) return cached;

  const session = await askCarebowOrchestratorApi.createSession(profileId);
  await AsyncStorage.setItem(key, session.id);
  return session.id;
}

export interface OrchestratorReply {
  text: string;
  isEmergency: boolean;
  urgencyLevel: string;
  backendSessionId: string;
}

export async function getOrchestratorReply(params: {
  localSessionId: string;
  profileId: string;
  text: string;
  requestId: string;
}): Promise<OrchestratorReply | null> {
  try {
    const backendSessionId = await getOrCreateBackendSessionId(
      params.localSessionId,
      params.profileId
    );
    const result = await askCarebowOrchestratorApi.sendMessage(
      backendSessionId,
      params.text,
      params.requestId
    );
    if (!result.assistantMessage?.content) return null;

    return {
      text: result.assistantMessage.content,
      isEmergency: result.isEmergency,
      urgencyLevel: result.urgencyLevel,
      backendSessionId,
    };
  } catch {
    return null;
  }
}

export async function streamOrchestratorReply(params: {
  localSessionId: string;
  profileId: string;
  text: string;
  requestId: string;
  onTextDelta: (delta: string) => void;
}): Promise<OrchestratorReply | null> {
  try {
    const backendSessionId = await getOrCreateBackendSessionId(
      params.localSessionId,
      params.profileId
    );

    const token = ApiClient.getAccessToken();

    interface DoneEvent {
      assistantMessage?: { content?: string };
      isEmergency?: boolean;
      urgencyLevel?: string;
      rolledOut?: boolean;
    }
    let doneEvent: DoneEvent | null = null;

    await postSSE(
      `${ApiClient.getBaseUrl()}/chat/sessions/${backendSessionId}/messages`,
      { content: params.text, stream: true, requestId: params.requestId },
      {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      (event) => {
        const e = event as { type?: string; text?: string } & DoneEvent;
        if (e.type === 'delta' && e.text) {
          params.onTextDelta(e.text);
        } else if (e.type === 'done') {
          doneEvent = e;
        }
      }
    );

    const finalEvent = doneEvent as DoneEvent | null;
    if (!finalEvent?.assistantMessage?.content) {
      if (finalEvent?.rolledOut === false) {
        logger.debug('Shadowed by rollout gate; using rewrite fallback for this turn');
      }
      return null;
    }

    return {
      text: finalEvent.assistantMessage.content,
      isEmergency: finalEvent.isEmergency ?? false,
      urgencyLevel: finalEvent.urgencyLevel ?? 'P4',
      backendSessionId,
    };
  } catch {
    return null;
  }
}
