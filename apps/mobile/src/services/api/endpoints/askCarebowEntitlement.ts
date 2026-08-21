import { ApiClient } from '../ApiClient';

export type AskCarebowEntitlementSource = 'trial_available' | 'trial' | 'plan';

export interface AskCarebowEntitlement {
  canAsk: boolean;
  source: AskCarebowEntitlementSource;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  trialActive: boolean;
  trialDays: number;
  planSlug: string;
  planTitle: string;
  planExpiresAt: string | null;
  recurring: false;
  limit: number | null;
  used: number;
  remaining: number | null;
}

interface AskCarebowEntitlementResponse {
  success: boolean;
  entitlement?: AskCarebowEntitlement;
  error?: string;
}

export const askCarebowEntitlementApi = {
  get: async (): Promise<AskCarebowEntitlement> => {
    const response = await ApiClient.get<AskCarebowEntitlementResponse>(
      '/v1/ask-carebow/entitlement'
    );
    if (!response.data.success || !response.data.entitlement) {
      throw new Error(response.data.error || 'Unable to verify Ask CareBow access.');
    }
    return response.data.entitlement;
  },
};
