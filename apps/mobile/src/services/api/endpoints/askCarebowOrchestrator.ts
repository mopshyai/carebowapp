/**
 * Chat-session orchestrator API (v1-auth'd via bearer JWT, see E5 —
 * carebow-main's getChatAuthedUser falls through cookie-session to the same
 * bearer check ApiClient already attaches to every request).
 *
 * This is the real multi-agent, RAG-backed medical reasoning pipeline
 * (src/lib/agents/orchestrator.ts in carebow-main) — distinct from
 * askCareBow.ts's `rewrite`, which only rewords a draft for tone and adds no
 * medical content.
 */

import { ApiClient } from '../ApiClient';

export interface ChatSession {
  id: string;
}

export interface ChatOrchestratorMessageResponse {
  assistantMessage: { id: string; content: string };
  isEmergency: boolean;
  urgencyLevel: string;
  recommendation: string;
}

export const askCarebowOrchestratorApi = {
  createSession: async (profileId: string): Promise<ChatSession> => {
    const response = await ApiClient.post<{ session: ChatSession }>('/chat/sessions', {
      profileId,
    });
    return response.data.session;
  },

  sendMessage: async (
    sessionId: string,
    content: string
  ): Promise<ChatOrchestratorMessageResponse> => {
    const response = await ApiClient.post<ChatOrchestratorMessageResponse>(
      `/chat/sessions/${sessionId}/messages`,
      { content }
    );
    return response.data;
  },
};

export default askCarebowOrchestratorApi;
