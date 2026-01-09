/**
 * Feedback Types
 * Data models for user feedback on assistant responses
 */

/**
 * Feedback rating
 */
export type FeedbackRating = 'helpful' | 'not_helpful';

/**
 * Quick reasons for negative feedback
 */
export type NegativeFeedbackReason =
  | 'too_long'
  | 'didnt_answer'
  | 'felt_unsafe'
  | 'other';

/**
 * Reason labels for display
 */
export const NEGATIVE_FEEDBACK_REASONS: Record<NegativeFeedbackReason, string> = {
  too_long: 'Too long',
  didnt_answer: "Didn't answer",
  felt_unsafe: 'Felt unsafe',
  other: 'Other',
};

/**
 * Individual feedback entry
 */
export interface FeedbackEntry {
  id: string;
  episodeId: string;
  messageId: string;
  rating: FeedbackRating;
  reason?: NegativeFeedbackReason;
  customReason?: string;
  timestamp: string;
  messageSnippet?: string; // First 100 chars of the message for context
}

/**
 * Feedback summary for export
 */
export interface FeedbackSummary {
  totalFeedback: number;
  helpfulCount: number;
  notHelpfulCount: number;
  helpfulPercentage: number;
  reasonBreakdown: Record<NegativeFeedbackReason, number>;
  recentFeedback: FeedbackEntry[];
}

/**
 * Generate unique feedback ID
 */
export function generateFeedbackId(): string {
  return `fb_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}
