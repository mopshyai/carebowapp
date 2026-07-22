/**
 * Safety API endpoints.
 *
 * reportSosEvent notifies the CareBow backend the instant SOS is triggered, so
 * the on-call team is alerted (they call emergency services). This is ADDITIVE:
 * the app's own contact-SMS and emergency-dial remain the primary, offline-safe
 * path, so this call is fire-and-forget and must never block the SOS flow.
 */

import { ApiClient } from '../ApiClient';

export interface SosReportPayload {
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  userName?: string | null;
  phone?: string | null;
  triageLevel?: string | null;
  note?: string | null;
}

export interface SosReportResponse {
  success: boolean;
  eventId?: string;
  notified?: boolean;
  error?: string;
}

export const safetyApi = {
  /**
   * Report an SOS event to the backend (best-effort). Swallows errors — the
   * caller should not await this in a way that blocks the emergency UI.
   */
  reportSosEvent: async (payload: SosReportPayload): Promise<SosReportResponse | null> => {
    try {
      const response = await ApiClient.post<SosReportResponse>('/v1/safety/sos', payload);
      return response.data;
    } catch {
      // Never let team-notification failure affect the on-device SOS path.
      return null;
    }
  },
};

export default safetyApi;
