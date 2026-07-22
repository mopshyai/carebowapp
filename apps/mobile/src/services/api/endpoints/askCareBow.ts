import { ApiClient } from '../ApiClient';

export interface AskCareBowRewriteResponse {
  success: boolean;
  assistantMessage: string;
  source: 'ai' | 'safety-engine' | 'safety-fallback';
  error?: string;
}

export const askCareBowApi = {
  rewrite: async (data: {
    messageText: string;
    draftResponse: string;
    forWhom: 'me' | 'family';
  }): Promise<AskCareBowRewriteResponse> => {
    const response = await ApiClient.post<AskCareBowRewriteResponse>('/ask-carebow/message', data);
    return response.data;
  },
};
