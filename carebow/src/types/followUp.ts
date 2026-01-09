/**
 * Follow-Up Types
 * Data model for episode follow-up check-ins
 */

export type FollowUpStatus = 'scheduled' | 'done' | 'cancelled';

/**
 * Follow-up check-in intent
 */
export interface FollowUpIntent {
  id: string;
  episodeId: string;
  episodeTitle: string;
  followUpAt: string; // ISO date string
  reasonSnippet: string;
  status: FollowUpStatus;
  createdAt: string;
  completedAt?: string;
}

/**
 * Follow-up option for UI
 */
export interface FollowUpOption {
  id: string;
  label: string;
  days: number;
}

/**
 * Default follow-up options
 */
export const FOLLOW_UP_OPTIONS: FollowUpOption[] = [
  { id: 'tomorrow', label: 'Tomorrow', days: 1 },
  { id: '3days', label: 'In 3 days', days: 3 },
];

/**
 * Create a new follow-up intent
 */
export function createFollowUpIntent(params: {
  episodeId: string;
  episodeTitle: string;
  daysFromNow: number;
  reasonSnippet: string;
}): FollowUpIntent {
  const now = new Date();
  const followUpDate = new Date(now);
  followUpDate.setDate(followUpDate.getDate() + params.daysFromNow);
  followUpDate.setHours(9, 0, 0, 0); // Default to 9 AM

  return {
    id: `followup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    episodeId: params.episodeId,
    episodeTitle: params.episodeTitle,
    followUpAt: followUpDate.toISOString(),
    reasonSnippet: params.reasonSnippet,
    status: 'scheduled',
    createdAt: now.toISOString(),
  };
}

/**
 * Check if a follow-up is due (within the next hour)
 */
export function isFollowUpDue(followUp: FollowUpIntent): boolean {
  if (followUp.status !== 'scheduled') return false;

  const now = new Date();
  const followUpTime = new Date(followUp.followUpAt);
  const hourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

  return followUpTime <= hourFromNow && followUpTime >= now;
}

/**
 * Check if a follow-up is overdue
 */
export function isFollowUpOverdue(followUp: FollowUpIntent): boolean {
  if (followUp.status !== 'scheduled') return false;

  const now = new Date();
  const followUpTime = new Date(followUp.followUpAt);

  return followUpTime < now;
}

/**
 * Format follow-up date for display
 */
export function formatFollowUpDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  if (isToday) return 'Today';
  if (isTomorrow) return 'Tomorrow';

  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 0 && diffDays <= 7) {
    return `In ${diffDays} days`;
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
