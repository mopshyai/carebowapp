/**
 * Home remedies API (v1, JWT-authenticated).
 *
 * The backend (src/lib/agents/tools/remedies-tool.ts in carebow-main) is the
 * single source of truth for remedy content — it applies contraindication
 * filtering (pregnancy, diabetes, age, allergies) before returning anything.
 * Mobile no longer bundles its own remedy copy; see remediesClient.ts for the
 * offline-cache wrapper that calls this endpoint.
 */

import { ApiClient } from '../ApiClient';

export interface Remedy {
  name: string;
  hindiName: string;
  description: string;
  howTo: string;
  timing: string;
  effectiveness: string;
  evidenceLevel: string;
  suitableFor: string[];
}

export interface RemediesResponse {
  success: boolean;
  error?: string;
  condition?: string | null;
  remedies?: Remedy[];
  withheld?: { name: string; reason: string }[];
  unfiltered?: boolean;
  lifestyleAdvice?: string[];
  warningSignsToWatch?: string[];
  availableConditions?: string[];
  disclaimer?: string;
}

export const remediesApi = {
  get: async (params: {
    symptom?: string;
    condition?: string;
    profileId?: string;
    limit?: number;
  }): Promise<RemediesResponse> => {
    const response = await ApiClient.get<RemediesResponse>('/v1/remedies', {
      params: {
        symptom: params.symptom,
        condition: params.condition,
        profileId: params.profileId,
        limit: params.limit,
      },
    });
    return response.data;
  },
};

export default remediesApi;
