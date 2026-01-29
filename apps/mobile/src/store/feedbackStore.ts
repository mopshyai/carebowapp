/**
 * Feedback Store
 * Manages user feedback on assistant responses
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FeedbackEntry,
  FeedbackRating,
  FeedbackSummary,
  NegativeFeedbackReason,
  NEGATIVE_FEEDBACK_REASONS,
  generateFeedbackId,
} from '../types/feedback';
import { createLogger } from '../utils/logger';

const logger = createLogger('Feedback');

interface FeedbackState {
  // All feedback entries
  entries: FeedbackEntry[];

  // Track which messages have been rated (messageId -> true)
  ratedMessages: Record<string, boolean>;

  // Actions
  submitFeedback: (params: {
    episodeId: string;
    messageId: string;
    rating: FeedbackRating;
    reason?: NegativeFeedbackReason;
    customReason?: string;
    messageSnippet?: string;
  }) => FeedbackEntry;

  hasRatedMessage: (messageId: string) => boolean;

  // Export functions
  getFeedbackSummary: () => FeedbackSummary;
  getRecentFeedback: (limit?: number) => FeedbackEntry[];
  getFeedbackForEpisode: (episodeId: string) => FeedbackEntry[];
  exportFeedbackJSON: () => string;
  logFeedbackSummary: () => void;

  // Clear (for dev/testing)
  clearAllFeedback: () => void;
}

export const useFeedbackStore = create<FeedbackState>()(
  persist(
    (set, get) => ({
      entries: [],
      ratedMessages: {},

      submitFeedback: ({ episodeId, messageId, rating, reason, customReason, messageSnippet }) => {
        const entry: FeedbackEntry = {
          id: generateFeedbackId(),
          episodeId,
          messageId,
          rating,
          reason,
          customReason,
          timestamp: new Date().toISOString(),
          messageSnippet: messageSnippet?.substring(0, 100),
        };

        set((state) => ({
          entries: [...state.entries, entry],
          ratedMessages: { ...state.ratedMessages, [messageId]: true },
        }));

        // Log for dev review
        logger.debug('Feedback submitted', {
          rating,
          reason: reason ? NEGATIVE_FEEDBACK_REASONS[reason] : undefined,
          episodeId,
          messageId,
          timestamp: entry.timestamp,
        });

        return entry;
      },

      hasRatedMessage: (messageId) => {
        return !!get().ratedMessages[messageId];
      },

      getFeedbackSummary: () => {
        const { entries } = get();
        const helpfulCount = entries.filter((e) => e.rating === 'helpful').length;
        const notHelpfulCount = entries.filter((e) => e.rating === 'not_helpful').length;
        const totalFeedback = entries.length;

        // Reason breakdown
        const reasonBreakdown: Record<NegativeFeedbackReason, number> = {
          too_long: 0,
          didnt_answer: 0,
          felt_unsafe: 0,
          other: 0,
        };

        entries
          .filter((e) => e.rating === 'not_helpful' && e.reason)
          .forEach((e) => {
            if (e.reason) {
              reasonBreakdown[e.reason]++;
            }
          });

        return {
          totalFeedback,
          helpfulCount,
          notHelpfulCount,
          helpfulPercentage: totalFeedback > 0 ? Math.round((helpfulCount / totalFeedback) * 100) : 0,
          reasonBreakdown,
          recentFeedback: entries.slice(-10).reverse(),
        };
      },

      getRecentFeedback: (limit = 20) => {
        return get().entries.slice(-limit).reverse();
      },

      getFeedbackForEpisode: (episodeId) => {
        return get().entries.filter((e) => e.episodeId === episodeId);
      },

      exportFeedbackJSON: () => {
        const { entries } = get();
        const summary = get().getFeedbackSummary();

        const exportData = {
          exportedAt: new Date().toISOString(),
          summary,
          entries,
        };

        return JSON.stringify(exportData, null, 2);
      },

      logFeedbackSummary: () => {
        const summary = get().getFeedbackSummary();
        const reasonsWithCounts = Object.entries(summary.reasonBreakdown)
          .filter(([, count]) => count > 0)
          .map(([reason, count]) => `${NEGATIVE_FEEDBACK_REASONS[reason as NegativeFeedbackReason]}: ${count}`)
          .join(', ');

        const recentItems = summary.recentFeedback
          .slice(0, 5)
          .map((entry, i) => `${i + 1}. ${entry.rating}${entry.reason ? ` (${NEGATIVE_FEEDBACK_REASONS[entry.reason]})` : ''}`)
          .join(', ');

        logger.info('Feedback summary', {
          total: summary.totalFeedback,
          helpful: `${summary.helpfulCount} (${summary.helpfulPercentage}%)`,
          notHelpful: summary.notHelpfulCount,
          reasons: reasonsWithCounts || 'none',
          recent: recentItems || 'none',
        });
      },

      clearAllFeedback: () => {
        set({ entries: [], ratedMessages: {} });
        logger.debug('All feedback cleared');
      },
    }),
    {
      name: 'carebow-feedback-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Selector hooks
export const useHasRatedMessage = (messageId: string) => {
  return useFeedbackStore((state) => state.ratedMessages[messageId] ?? false);
};

export const useFeedbackSummary = () => {
  return useFeedbackStore((state) => state.getFeedbackSummary());
};
