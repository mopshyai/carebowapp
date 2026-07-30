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
