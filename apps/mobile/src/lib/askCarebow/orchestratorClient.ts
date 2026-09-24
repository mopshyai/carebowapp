/**
 * Wrapper around the mobile-auth'd orchestrator for symptom-help turns.
 *
 * One requestId belongs to one user turn. Mobile never invents an assistant
 * reply locally: it submits to the canonical backend and renders server state.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { askCarebowOrchestratorApi } from '../../services/api/endpoints/askCarebowOrchestrator';
import { ApiClient } from '../../services/api/ApiClient';
import { postSSE } from '../../services/api/sseClient';
import { ApiError } from '../../services/api/types';
import { createLogger } from '../../utils/logger';

const logger = createLogger('OrchestratorClient');

const SESSION_CACHE_PREFIX = '@carebow/orchestrator_session/';
const inMemoryBackendSessions = new Map<string, string>();

function sessionCacheKey(localSessionId: string): string {
  return `${SESSION_CACHE_PREFIX}${localSessionId}`;
}

export function clearKnownBackendSessions(): void {
  inMemoryBackendSessions.clear();
}

export function getKnownBackendSessionId(localSessionId: string): string | null {
  return inMemoryBackendSessions.get(localSessionId) ?? null;
}

export async function bindKnownBackendSession(
  localSessionId: string,
  backendSessionId: string
): Promise<void> {
  inMemoryBackendSessions.set(localSessionId, backendSessionId);
  await AsyncStorage.setItem(sessionCacheKey(localSessionId), backendSessionId);
}

export async function getCachedBackendSessionId(localSessionId: string): Promise<string | null> {
  const known = getKnownBackendSessionId(localSessionId);
  if (known) return known;

  if (localSessionId.startsWith('sess_')) {
    inMemoryBackendSessions.set(localSessionId, localSessionId);
    return localSessionId;
  }

  const cached = await AsyncStorage.getItem(sessionCacheKey(localSessionId));
  if (cached) inMemoryBackendSessions.set(localSessionId, cached);
  return cached;
}

async function getOrCreateBackendSessionId(
  localSessionId: string,
  profileId: string
): Promise<string> {
  const known = getKnownBackendSessionId(localSessionId);
  if (known) return known;

  if (localSessionId.startsWith('sess_')) {
    inMemoryBackendSessions.set(localSessionId, localSessionId);
    return localSessionId;
  }

  const key = sessionCacheKey(localSessionId);
  const cached = await AsyncStorage.getItem(key);
  if (cached) {
    inMemoryBackendSessions.set(localSessionId, cached);
    return cached;
  }

  const session = await askCarebowOrchestratorApi.createSession(profileId);
  inMemoryBackendSessions.set(localSessionId, session.id);
  await AsyncStorage.setItem(key, session.id);
  return session.id;
}

export function isTransportOrDisconnectError(error: unknown): boolean {
  if (error instanceof ApiError) {
    if (typeof error.status === 'number' && error.status >= 400 && error.status < 500) {
      return false;
    }
    return error.code === 'NETWORK_ERROR' || error.code === 'TIMEOUT' || error.status === 0;
  }
  if (error && typeof error === 'object') {
    const status = (error as { status?: number }).status;
    if (typeof status === 'number' && status >= 400 && status < 500) {
      return false;
    }
  }
  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (
      msg.includes('status 4') ||
      msg.includes('409') ||
      msg.includes('402') ||
      msg.includes('401') ||
      msg.includes('403') ||
      msg.includes('unauthorized')
    ) {
      return false;
    }
    return (
      msg.includes('network') ||
      msg.includes('timeout') ||
      msg.includes('connection') ||
      msg.includes('disconnect') ||
      msg.includes('stream ended') ||
      msg.includes('aborted')
    );
  }
  return false;
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
    if (result.assistantMessage?.content) {
      return {
        text: result.assistantMessage.content,
        isEmergency: result.isEmergency,
        urgencyLevel: result.urgencyLevel,
        backendSessionId,
      };
    }

    const recovered = await recoverTurn(backendSessionId, params.requestId);
    if (recovered) return recovered;
    if (result.run?.status === 'FAILED') return null;
    return null;
  } catch (error) {
    if (!isTransportOrDisconnectError(error)) {
      throw error;
    }
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
  let backendSessionId: string | null = null;
  try {
    backendSessionId = await getOrCreateBackendSessionId(params.localSessionId, params.profileId);

    const token = ApiClient.getAccessToken();

    interface DoneEvent {
      assistantMessage?: { content?: string };
      isEmergency?: boolean;
      urgencyLevel?: string;
      rolledOut?: boolean;
    }
    let doneEvent: DoneEvent | null = null;

    // SSE bypasses the JSON ApiClient transport but not the architecture
    // boundary: it still targets the canonical CareBow /api/v1 adapter and uses
    // the same bearer access token.
    await postSSE(
      `${ApiClient.getBaseUrl()}/v1/chat/sessions/${backendSessionId}/messages`,
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
    if (finalEvent?.assistantMessage?.content) {
      return {
        text: finalEvent.assistantMessage.content,
        isEmergency: finalEvent.isEmergency ?? false,
        urgencyLevel: finalEvent.urgencyLevel ?? 'P4',
        backendSessionId,
      };
    }

    const recovered = await recoverTurn(backendSessionId, params.requestId);
    if (recovered) return recovered;
    logger.warn('Ask CareBow stream ended without a confirmed assistant reply');
    return null;
  } catch (error) {
    if (!isTransportOrDisconnectError(error)) {
      throw error;
    }
    try {
      const targetSessionId =
        backendSessionId || (await getCachedBackendSessionId(params.localSessionId));
      if (!targetSessionId) return null;
      return await recoverTurn(targetSessionId, params.requestId);
    } catch (err) {
      if (!isTransportOrDisconnectError(err)) {
        throw err;
      }
      return null;
    }
  }
}

export async function listCanonicalSessions(profileId?: string) {
  return askCarebowOrchestratorApi.listSessions(profileId);
}

export async function loadCanonicalSession(backendSessionId: string) {
  return askCarebowOrchestratorApi.getSession(backendSessionId);
}

export async function attachCanonicalSession(localSessionId: string, backendSessionId: string) {
  await bindKnownBackendSession(localSessionId, backendSessionId);
}

async function recoverTurn(
  backendSessionId: string,
  requestId: string
): Promise<OrchestratorReply | null> {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    try {
      const turn = await askCarebowOrchestratorApi.getTurn(backendSessionId, requestId);
      if (turn.assistantMessage?.content) {
        return {
          text: turn.assistantMessage.content,
          isEmergency: turn.isEmergency,
          urgencyLevel: turn.urgencyLevel,
          backendSessionId,
        };
      }
      if (turn.run?.status === 'FAILED') return null;
    } catch (error) {
      if (!isTransportOrDisconnectError(error)) {
        throw error;
      }
      logger.warn('Ask CareBow turn recovery failed', error);
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return null;
}
