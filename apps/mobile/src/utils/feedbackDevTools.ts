/**
 * Feedback Dev Tools
 * Development utilities for reviewing and exporting feedback
 *
 * Usage (in React Native debugger console):
 * - CareBowFeedback.summary()  - Print feedback summary
 * - CareBowFeedback.export()   - Export all feedback as JSON
 * - CareBowFeedback.recent()   - Show recent feedback
 * - CareBowFeedback.clear()    - Clear all feedback (with confirmation)
 */

import { useFeedbackStore } from '../store/feedbackStore';
import { NEGATIVE_FEEDBACK_REASONS, NegativeFeedbackReason } from '../types/feedback';

/**
 * Dev tools object exposed globally for console access
 */
export const CareBowFeedbackDevTools = {
  /**
   * Print feedback summary to console
   */
  summary: () => {
    const store = useFeedbackStore.getState();
    store.logFeedbackSummary();
  },

  /**
   * Export all feedback as JSON string
   */
  export: () => {
    const store = useFeedbackStore.getState();
    const json = store.exportFeedbackJSON();
    console.log('\n========== FEEDBACK EXPORT ==========');
    console.log(json);
    console.log('======================================\n');
    return json;
  },

  /**
   * Show recent feedback entries
   */
  recent: (limit: number = 10) => {
    const store = useFeedbackStore.getState();
    const entries = store.getRecentFeedback(limit);

    console.log(`\n========== RECENT FEEDBACK (${entries.length}) ==========`);
    entries.forEach((entry, i) => {
      const reasonText = entry.reason ? ` - ${NEGATIVE_FEEDBACK_REASONS[entry.reason]}` : '';
      console.log(`${i + 1}. [${entry.rating.toUpperCase()}]${reasonText}`);
      console.log(`   Episode: ${entry.episodeId}`);
      console.log(`   Time: ${new Date(entry.timestamp).toLocaleString()}`);
      if (entry.messageSnippet) {
        console.log(`   Snippet: "${entry.messageSnippet.substring(0, 50)}..."`);
      }
      console.log('');
    });
    console.log('==========================================\n');
  },

  /**
   * Get feedback for a specific episode
   */
  forEpisode: (episodeId: string) => {
    const store = useFeedbackStore.getState();
    const entries = store.getFeedbackForEpisode(episodeId);

    console.log(`\n========== FEEDBACK FOR EPISODE ${episodeId} ==========`);
    if (entries.length === 0) {
      console.log('No feedback found for this episode.');
    } else {
      entries.forEach((entry, i) => {
        const reasonText = entry.reason ? ` - ${NEGATIVE_FEEDBACK_REASONS[entry.reason]}` : '';
        console.log(`${i + 1}. [${entry.rating.toUpperCase()}]${reasonText}`);
        console.log(`   Message ID: ${entry.messageId}`);
        console.log(`   Time: ${new Date(entry.timestamp).toLocaleString()}`);
      });
    }
    console.log('====================================================\n');
  },

  /**
   * Clear all feedback (with confirmation log)
   */
  clear: () => {
    const store = useFeedbackStore.getState();
    const count = store.entries.length;
    store.clearAllFeedback();
    console.log(`[Feedback] Cleared ${count} feedback entries.`);
  },

  /**
   * Get raw feedback data for programmatic access
   */
  getData: () => {
    const store = useFeedbackStore.getState();
    return {
      entries: store.entries,
      summary: store.getFeedbackSummary(),
    };
  },
};

/**
 * Initialize dev tools in global scope (for console access)
 */
export function initializeFeedbackDevTools() {
  if (__DEV__) {
    // @ts-ignore - Intentionally adding to global for dev tools
    global.CareBowFeedback = CareBowFeedbackDevTools;
    console.log('[Dev] CareBowFeedback tools available. Try: CareBowFeedback.summary()');
  }
}

/**
 * Hook to get feedback stats for dev UI
 */
export function useFeedbackStats() {
  const entries = useFeedbackStore((state) => state.entries);

  const helpfulCount = entries.filter((e) => e.rating === 'helpful').length;
  const notHelpfulCount = entries.filter((e) => e.rating === 'not_helpful').length;
  const totalCount = entries.length;
  const helpfulPercentage = totalCount > 0 ? Math.round((helpfulCount / totalCount) * 100) : 0;

  return {
    totalCount,
    helpfulCount,
    notHelpfulCount,
    helpfulPercentage,
  };
}
