import { ApiClient } from '../ApiClient';
import type { AskCarebowEntitlement } from './askCarebowEntitlement';

export interface AskCareBowRewriteResponse {
  success: boolean;
  assistantMessage: string;
  source: 'ai' | 'safety-engine' | 'safety-fallback';
  safetyOverride?: boolean;
  entitlement?: AskCarebowEntitlement;
  error?: string;
}

export const askCareBowApi = {
  rewrite: async (data: {
    messageText: string;
    draftResponse: string;
    forWhom: 'me' | 'family';
    requestId: string;
  }): Promise<AskCareBowRewriteResponse> => {
    const response = await ApiClient.post<AskCareBowRewriteResponse>('/ask-carebow/message', data);
    return response.data;
  },
};
