/**
 * Safety API endpoints.
 *
 * Device actions (dialer / SMS composer) remain available even if CareBow's
 * backend is unreachable. Server reporting is additive but its outcome is
 * returned so the UI can distinguish "accepted by CareBow" from "use direct
 * emergency actions; server alert could not be confirmed."
 */

import { ApiClient } from '../ApiClient';

export interface SafetyApiContact {
  name: string;
  phone: string;
  relationship?: string | null;
  isPrimary?: boolean;
}

export interface SosReportPayload {
  lat?: number | null;
  lng?: number | null;
  address?: string | null;
  userName?: string | null;
  phone?: string | null;
  triageLevel?: string | null;
  note?: string | null;
  /**
   * Current SMS-capable contacts visible on this device. Old builds stored
   * these only locally, so the SOS request itself carries them as a safety net
   * against a stale/empty server contact table.
   */
  contacts?: SafetyApiContact[];
}

export interface SosReportResponse {
  success: boolean;
  accepted?: boolean;
  eventId?: string;
  queued?: number;
  /** Queued for delivery; not proof that a recipient has read it. */
  notified?: boolean;
  error?: string;
}

export interface SafetyContactsResponse {
  success: boolean;
  contacts?: Array<{
    id: string;
    name: string;
    phone: string;
    relationship: string;
    isPrimary: boolean;
    createdAt: string;
  }>;
  error?: string;
}

export const safetyApi = {
  /**
   * Report SOS without blocking the direct emergency path. Errors resolve null
   * so callers can show an explicit "server alert not confirmed" state while
   * continuing to offer 112/911 and local contact actions.
   */
  reportSosEvent: async (payload: SosReportPayload): Promise<SosReportResponse | null> => {
    try {
      const response = await ApiClient.post<SosReportResponse>('/v1/safety/sos', payload);
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Replace the authenticated user's server-side SMS emergency contact list.
   * The mobile store keeps richer local preferences (e.g. WhatsApp); only the
   * contacts explicitly eligible for SMS should be passed here.
   */
  syncContacts: async (contacts: SafetyApiContact[]): Promise<SafetyContactsResponse | null> => {
    try {
      const response = await ApiClient.put<SafetyContactsResponse>('/v1/safety/contacts', {
        contacts,
      });
      return response.data;
    } catch {
      // The SOS request also carries the live contact list, so sync failure is
      // recoverable and must not make contact management unusable offline.
      return null;
    }
  },
};

export default safetyApi;
