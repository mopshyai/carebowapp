/**
 * Episode Types
 * Data model for Health Episodes (conversation threads)
 */

import { TriageLevel } from '../utils/triageCTAMapping';
import type { FollowUpOutcome } from './followUp';

export type ForWhom = 'me' | 'family';
export type AgeGroup = 'child' | 'adult' | 'senior';
export type EpisodeCareStatus =
  | 'assessing'
  | 'assessed'
  | 'self_care'
  | 'action_recommended'
  | 'booking_pending'
  | 'booked'
  | 'care_in_progress'
  | 'awaiting_follow_up'
  | 'resolved'
  | 'escalated'
  | 'cancelled';

export interface EpisodeProviderOutcome {
  bookingId: string;
  providerName?: string;
  diagnosis?: string;
  treatmentPlan?: string | null;
  advice?: string | null;
  labTests?: string[];
  nextReview?: string | null;
  recordedAt: string;
}

/**
 * Health Episode - a longitudinal thread about one health concern.
 * The episode remains active across assessment, booking, provider care and
 * follow-up; it closes only when the concern is resolved or explicitly closed.
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

  careStatus: EpisodeCareStatus;
  linkedBookingId?: string;
  providerOutcome?: EpisodeProviderOutcome;
  lastFollowUpOutcome?: FollowUpOutcome;
  lastFollowUpAt?: string;
  resolvedAt?: string;
  escalatedAt?: string;
}

/** Message within an Episode */
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
    careStatus: 'assessing',
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
