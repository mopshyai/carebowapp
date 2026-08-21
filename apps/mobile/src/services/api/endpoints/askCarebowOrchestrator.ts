/**
 * Chat-session orchestrator API (v1-auth'd via bearer JWT).
 * This is the RAG-backed medical reasoning path; askCareBow.ts is rewrite-only.
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
    content: string,
    requestId: string
  ): Promise<ChatOrchestratorMessageResponse> => {
    const response = await ApiClient.post<ChatOrchestratorMessageResponse>(
      `/chat/sessions/${sessionId}/messages`,
      { content, requestId }
    );
    return response.data;
  },
};

export default askCarebowOrchestratorApi;
