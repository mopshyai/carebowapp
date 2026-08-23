/**
 * Episode Types
 * Data model for Health Episodes (conversation threads)
 */

import { TriageLevel } from '../utils/triageCTAMapping';
import type { FollowUpOutcome } from './followUp';

export type ForWhom = 'me' | 'family';
export type AgeGroup = 'child' | 'adult' | 'senior';
export type EpisodeCareStatus =
  | 'monitoring'
  | 'care_requested'
  | 'care_confirmed'
  | 'care_in_progress'
  | 'care_completed'
  | 'care_cancelled';

/**
 * Health Episode - A conversation thread about a health concern
 */
export interface Episode {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  triageLevel?: TriageLevel;
  forWhom: ForWhom;
  ageGroup?: AgeGroup;
  relationship?: string;
  lastMessageSnippet: string;
  messageCount: number;
  isActive: boolean;

  // Continuity of care. These fields are derived from user follow-ups and
  // server-owned bookings; they do not replace backend booking truth.
  careStatus?: EpisodeCareStatus;
  linkedBookingId?: string;
  lastFollowUpOutcome?: FollowUpOutcome;
  lastFollowUpAt?: string;
}

/**
 * Message within an Episode
 */
export interface EpisodeMessage {
  id: string;
  episodeId: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  createdAt: string;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'document';
  uri: string;
  mimeType?: string;
}

export function createEpisode(params: {
  title: string;
  forWhom: ForWhom;
  ageGroup?: AgeGroup;
  relationship?: string;
  firstMessage: string;
}): Episode {
  const now = new Date().toISOString();
  return {
    id: `episode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: params.title,
    createdAt: now,
    updatedAt: now,
    forWhom: params.forWhom,
    ageGroup: params.ageGroup,
    relationship: params.relationship,
    lastMessageSnippet: params.firstMessage.slice(0, 100),
    messageCount: 1,
    isActive: true,
    careStatus: 'monitoring',
  };
}

export function createMessage(params: {
  episodeId: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  attachments?: MessageAttachment[];
}): EpisodeMessage {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    episodeId: params.episodeId,
    role: params.role,
    text: params.text,
    createdAt: new Date().toISOString(),
    attachments: params.attachments,
  };
}
