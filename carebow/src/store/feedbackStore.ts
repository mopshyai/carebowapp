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

        // Log to console for dev review
        console.log('[Feedback]', {
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
        console.log('\n========== FEEDBACK SUMMARY ==========');
        console.log(`Total Feedback: ${summary.totalFeedback}`);
        console.log(`Helpful: ${summary.helpfulCount} (${summary.helpfulPercentage}%)`);
        console.log(`Not Helpful: ${summary.notHelpfulCount}`);
        console.log('\nNegative Feedback Reasons:');
        Object.entries(summary.reasonBreakdown).forEach(([reason, count]) => {
          if (count > 0) {
            console.log(`  - ${NEGATIVE_FEEDBACK_REASONS[reason as NegativeFeedbackReason]}: ${count}`);
          }
        });
        console.log('\nRecent Feedback:');
        summary.recentFeedback.slice(0, 5).forEach((entry, i) => {
          console.log(`  ${i + 1}. ${entry.rating}${entry.reason ? ` (${NEGATIVE_FEEDBACK_REASONS[entry.reason]})` : ''}`);
        });
        console.log('======================================\n');
      },

      clearAllFeedback: () => {
        set({ entries: [], ratedMessages: {} });
        console.log('[Feedback] All feedback cleared');
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
