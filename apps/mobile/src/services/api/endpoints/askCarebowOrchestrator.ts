/**
 * Chat-session orchestrator API. Mobile reaches the canonical CareBow backend
 * only through `/api/v1`; the backend adapter reuses the same chat domain
 * services as web rather than duplicating orchestration or persistence here.
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
    const response = await ApiClient.post<{ session: ChatSession }>('/v1/chat/sessions', {
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
      `/v1/chat/sessions/${sessionId}/messages`,
      { content, requestId }
    );
    return response.data;
  },

  recordFollowUpOutcome: async (
    sessionId: string,
    outcome: ServerFollowUpOutcome
  ): Promise<{ success: boolean; careStatus?: string }> => {
    const response = await ApiClient.post<{ success: boolean; careStatus?: string }>(
      `/v1/chat/sessions/${sessionId}/follow-up-outcome`,
      { outcome }
    );
    return response.data;
  },
};

export default askCarebowOrchestratorApi;
