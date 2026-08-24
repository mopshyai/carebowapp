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

export type ServerFollowUpOutcome = 'better' | 'same' | 'worse';

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

  recordFollowUpOutcome: async (
    sessionId: string,
    outcome: ServerFollowUpOutcome
  ): Promise<{ success: boolean; careStatus?: string }> => {
    const response = await ApiClient.post<{ success: boolean; careStatus?: string }>(
      `/chat/sessions/${sessionId}/follow-up-outcome`,
      { outcome }
    );
    return response.data;
  },
};

export default askCarebowOrchestratorApi;
