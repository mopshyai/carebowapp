/**
 * Wrapper around the mobile-auth'd orchestrator (E5/E7) for the symptom-help
 * intent branch only — see conversationEngine.ts's `intent` field on
 * ConversationResponse. Every other intent (talk / want_doctor / want_test /
 * emergency) keeps using askCareBowApi.rewrite untouched.
 *
 * A backend chat session is created once per local Ask CareBow session and
 * cached (keyed by the local session id) so a multi-turn symptom conversation
 * reuses the same backend session instead of starting a fresh one each turn.
 *
 * Returns null on any failure — including "no cached/creatable session" — so
 * the caller degrades to today's rewrite-only behavior, per E7's feature-flag
 * rollback plan. Never throws.
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
}

export async function getOrchestratorReply(params: {
  localSessionId: string;
  profileId: string;
  text: string;
}): Promise<OrchestratorReply | null> {
  try {
    const backendSessionId = await getOrCreateBackendSessionId(
      params.localSessionId,
      params.profileId
    );
    const result = await askCarebowOrchestratorApi.sendMessage(backendSessionId, params.text);
    if (!result.assistantMessage?.content) return null;

    return {
      text: result.assistantMessage.content,
      isEmergency: result.isEmergency,
      urgencyLevel: result.urgencyLevel,
    };
  } catch {
    // Network/backend/auth failure — caller falls back to the rewrite-only
    // response, same as askCareBowApi.rewrite's existing failure mode.
    return null;
  }
}

/**
 * E4: same contract as getOrchestratorReply (null on any failure, caller
 * falls back to rewrite-only), but calls onTextDelta as the medical agent's
 * answer streams in from the backend's SSE-mode endpoint (`stream: true`
 * in the request body — see messages/route.ts in carebow-main). Every other
 * intent/agent path on the backend still answers in one shot; those arrive
 * as a single 'delta' event immediately followed by 'done', which this
 * still renders correctly, just without incremental deltas.
 */
export async function streamOrchestratorReply(params: {
  localSessionId: string;
  profileId: string;
  text: string;
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
      // E10: false means this profile is outside the backend's rollout
      // bucket for this turn — the orchestrator still ran and was
      // shadow-logged server-side, but was never meant to be shown. Falling
      // back to the rewrite-only path (below, via the null return) is the
      // intended UX here, not an error condition.
      rolledOut?: boolean;
    }
    let doneEvent: DoneEvent | null = null;

    await postSSE(
      `${ApiClient.getBaseUrl()}/chat/sessions/${backendSessionId}/messages`,
      { content: params.text, stream: true },
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

    // Re-bind through an explicit cast: doneEvent is only ever reassigned
    // inside the postSSE callback above, and TS's flow analysis does not
    // carry that reassignment back into this scope, so it (wrongly) treats
    // doneEvent as still null here without this.
    const finalEvent = doneEvent as DoneEvent | null;
    if (!finalEvent?.assistantMessage?.content) {
      if (finalEvent?.rolledOut === false) {
        logger.debug('Shadowed by E10 rollout gate; using the rewrite-only fallback for this turn');
      }
      return null;
    }

    return {
      text: finalEvent.assistantMessage.content,
      isEmergency: finalEvent.isEmergency ?? false,
      urgencyLevel: finalEvent.urgencyLevel ?? 'P4',
    };
  } catch {
    return null;
  }
}
