/**
 * Where the customer is, and therefore what they pay in.
 *
 * The app has always asked for a country when building a profile — and kept the
 * answer on the device. The server, which decides what a customer is actually
 * charged, had no idea where anyone was and quoted everyone in rupees. So the
 * app could display "$270" and hand the customer a ₹26,000 checkout page.
 *
 * This is the one call that keeps the two in step:
 *
 *   user picks a country  ─> PUT /v1/region  ─> User.country
 *                                                   │
 *                          pricing reads it ────────┘  (never the request body)
 *
 * Display currency is derived from the same country on both sides, so if this
 * call fails the app must not pretend otherwise — see useProfileStore.
 */

import ApiClient from '../ApiClient';

export type RegionResponse = {
  success?: boolean;
  error?: string;
  country?: string | null;
  currency?: 'INR' | 'USD';
  /** 'account' = they told us, 'detected' = inferred, 'default' = neither. */
  source?: 'account' | 'detected' | 'default';
};

export const regionApi = {
  /** What the server currently believes, including its own detection. */
  get: async (): Promise<RegionResponse> => {
    const response = await ApiClient.get<RegionResponse>('/v1/region');
    return response.data;
  },

  /**
   * Tell the server where this customer is. Returns the currency it will now
   * charge in, so the caller can verify the server agrees rather than assuming.
   */
  set: async (country: string): Promise<RegionResponse> => {
    const response = await ApiClient.put<RegionResponse>('/v1/region', { country });
    return response.data;
  },
};
