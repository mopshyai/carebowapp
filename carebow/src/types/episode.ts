/**
 * Episode Types
 * Data model for Health Episodes (conversation threads)
 */

import { TriageLevel } from '../utils/triageCTAMapping';

export type ForWhom = 'me' | 'family';
export type AgeGroup = 'child' | 'adult' | 'senior';

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

/**
 * Attachment on a message (images, etc.)
 */
export interface MessageAttachment {
  id: string;
  type: 'image' | 'document';
  uri: string;
  mimeType?: string;
}

/**
 * Create a new Episode
 */
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
  };
}

/**
 * Create a new Message
 */
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
