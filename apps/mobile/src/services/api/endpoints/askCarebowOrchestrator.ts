/**
 * Chat-session orchestrator API. Mobile reaches the canonical CareBow backend
 * only through `/api/v1`; the backend adapter reuses the same chat domain
 * services as web rather than duplicating orchestration or persistence here.
 */

import { ApiClient } from '../ApiClient';

export interface ChatSession {
  id: string;
  title?: string | null;
  status?: string;
  urgencyLevel?: string;
  createdAt?: string;
  lastMessageAt?: string | null;
  profile?: { id: string; name: string };
  profileId?: string;
  _count?: { messages: number };
}

export interface ChatOrchestratorMessage {
  id: string;
  role: string;
  content: string;
  isEmergency?: boolean;
  createdAt?: string;
}

export interface ChatOrchestratorMessageResponse {
  userMessage?: ChatOrchestratorMessage;
  assistantMessage?: ChatOrchestratorMessage | null;
  isEmergency: boolean;
  urgencyLevel: string;
  recommendation?: string;
  run?: {
    id: string;
    requestId: string;
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
    errorCode?: string | null;
  };
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

  listSessions: async (profileId?: string): Promise<ChatSession[]> => {
    const path = profileId
      ? `/v1/chat/sessions?profileId=${encodeURIComponent(profileId)}`
      : '/v1/chat/sessions';
    const response = await ApiClient.get<{ sessions: ChatSession[] }>(path);
    return response.data.sessions ?? [];
  },

  getSession: async (
    sessionId: string
  ): Promise<{ session: ChatSession & { messages?: ChatOrchestratorMessage[] } }> => {
    const response = await ApiClient.get<{
      session: ChatSession & { messages?: ChatOrchestratorMessage[] };
    }>(`/v1/chat/sessions/${sessionId}`);
    return response.data;
  },

  getTurn: async (
    sessionId: string,
    requestId: string
  ): Promise<ChatOrchestratorMessageResponse> => {
    const response = await ApiClient.get<ChatOrchestratorMessageResponse>(
      `/v1/chat/sessions/${sessionId}/turns/${encodeURIComponent(requestId)}`
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
