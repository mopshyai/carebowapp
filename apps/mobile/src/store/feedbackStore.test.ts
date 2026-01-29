/**
 * Feedback Store Tests
 * Tests for user feedback on assistant responses
 */

import { act, renderHook } from '@testing-library/react-native';
import { useFeedbackStore } from './feedbackStore';
import type { FeedbackEntry } from '../types/feedback';

// Mock console.log to prevent test output noise
const originalLog = console.log;
beforeAll(() => {
  console.log = jest.fn();
});
afterAll(() => {
  console.log = originalLog;
});

// Helper to reset store state between tests
const resetStore = () => {
  useFeedbackStore.setState({
    entries: [],
    ratedMessages: {},
  });
};

describe('feedbackStore', () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('starts with empty entries', () => {
      const { result } = renderHook(() => useFeedbackStore());
      expect(result.current.entries).toEqual([]);
    });

    it('starts with empty ratedMessages', () => {
      const { result } = renderHook(() => useFeedbackStore());
      expect(result.current.ratedMessages).toEqual({});
    });
  });

  describe('Submit Feedback', () => {
    it('submitFeedback creates a helpful feedback entry', () => {
      const { result } = renderHook(() => useFeedbackStore());

      let entry: FeedbackEntry;
      act(() => {
        entry = result.current.submitFeedback({
          episodeId: 'episode-123',
          messageId: 'msg-456',
          rating: 'helpful',
        });
      });

      expect(result.current.entries).toHaveLength(1);
      expect(entry!.rating).toBe('helpful');
      expect(entry!.episodeId).toBe('episode-123');
      expect(entry!.messageId).toBe('msg-456');
    });

    it('submitFeedback creates a not_helpful feedback entry with reason', () => {
      const { result } = renderHook(() => useFeedbackStore());

      let entry: FeedbackEntry;
      act(() => {
        entry = result.current.submitFeedback({
          episodeId: 'episode-123',
          messageId: 'msg-456',
          rating: 'not_helpful',
          reason: 'didnt_answer',
        });
      });

      expect(entry!.rating).toBe('not_helpful');
      expect(entry!.reason).toBe('didnt_answer');
    });

    it('submitFeedback includes custom reason', () => {
      const { result } = renderHook(() => useFeedbackStore());

      let entry: FeedbackEntry;
      act(() => {
        entry = result.current.submitFeedback({
          episodeId: 'episode-123',
          messageId: 'msg-456',
          rating: 'not_helpful',
          reason: 'other',
          customReason: 'Response was confusing',
        });
      });

      expect(entry!.customReason).toBe('Response was confusing');
    });

    it('submitFeedback truncates message snippet to 100 chars', () => {
      const { result } = renderHook(() => useFeedbackStore());

      const longMessage = 'A'.repeat(150);
      let entry: FeedbackEntry;
      act(() => {
        entry = result.current.submitFeedback({
          episodeId: 'episode-123',
          messageId: 'msg-456',
          rating: 'helpful',
          messageSnippet: longMessage,
        });
      });

      expect(entry!.messageSnippet?.length).toBe(100);
    });

    it('submitFeedback marks message as rated', () => {
      const { result } = renderHook(() => useFeedbackStore());

      expect(result.current.ratedMessages['msg-456']).toBeUndefined();

      act(() => {
        result.current.submitFeedback({
          episodeId: 'episode-123',
          messageId: 'msg-456',
          rating: 'helpful',
        });
      });

      expect(result.current.ratedMessages['msg-456']).toBe(true);
    });

    it('submitFeedback includes timestamp', () => {
      const { result } = renderHook(() => useFeedbackStore());

      let entry: FeedbackEntry;
      act(() => {
        entry = result.current.submitFeedback({
          episodeId: 'episode-123',
          messageId: 'msg-456',
          rating: 'helpful',
        });
      });

      expect(entry!.timestamp).toBeDefined();
      expect(new Date(entry!.timestamp).getTime()).toBeGreaterThan(0);
    });
  });

  describe('hasRatedMessage', () => {
    it('returns false for unrated message', () => {
      const { result } = renderHook(() => useFeedbackStore());
      expect(result.current.hasRatedMessage('msg-123')).toBe(false);
    });

    it('returns true for rated message', () => {
      const { result } = renderHook(() => useFeedbackStore());

      act(() => {
        result.current.submitFeedback({
          episodeId: 'episode-123',
          messageId: 'msg-456',
          rating: 'helpful',
        });
      });

      expect(result.current.hasRatedMessage('msg-456')).toBe(true);
    });
  });

  describe('getFeedbackSummary', () => {
    it('returns empty summary initially', () => {
      const { result } = renderHook(() => useFeedbackStore());
      const summary = result.current.getFeedbackSummary();

      expect(summary.totalFeedback).toBe(0);
      expect(summary.helpfulCount).toBe(0);
      expect(summary.notHelpfulCount).toBe(0);
      expect(summary.helpfulPercentage).toBe(0);
    });

    it('calculates correct counts', () => {
      const { result } = renderHook(() => useFeedbackStore());

      act(() => {
        result.current.submitFeedback({
          episodeId: 'ep-1',
          messageId: 'msg-1',
          rating: 'helpful',
        });
        result.current.submitFeedback({
          episodeId: 'ep-1',
          messageId: 'msg-2',
          rating: 'helpful',
        });
        result.current.submitFeedback({
          episodeId: 'ep-1',
          messageId: 'msg-3',
          rating: 'not_helpful',
          reason: 'too_long',
        });
      });

      const summary = result.current.getFeedbackSummary();
      expect(summary.totalFeedback).toBe(3);
      expect(summary.helpfulCount).toBe(2);
      expect(summary.notHelpfulCount).toBe(1);
      expect(summary.helpfulPercentage).toBe(67); // 2/3 * 100 rounded
    });

    it('calculates reason breakdown', () => {
      const { result } = renderHook(() => useFeedbackStore());

      act(() => {
        result.current.submitFeedback({
          episodeId: 'ep-1',
          messageId: 'msg-1',
          rating: 'not_helpful',
          reason: 'too_long',
        });
        result.current.submitFeedback({
          episodeId: 'ep-1',
          messageId: 'msg-2',
          rating: 'not_helpful',
          reason: 'too_long',
        });
        result.current.submitFeedback({
          episodeId: 'ep-1',
          messageId: 'msg-3',
          rating: 'not_helpful',
          reason: 'didnt_answer',
        });
      });

      const summary = result.current.getFeedbackSummary();
      expect(summary.reasonBreakdown.too_long).toBe(2);
      expect(summary.reasonBreakdown.didnt_answer).toBe(1);
      expect(summary.reasonBreakdown.felt_unsafe).toBe(0);
    });
  });

  describe('getRecentFeedback', () => {
    it('returns recent feedback in reverse order', () => {
      const { result } = renderHook(() => useFeedbackStore());

      act(() => {
        result.current.submitFeedback({
          episodeId: 'ep-1',
          messageId: 'msg-1',
          rating: 'helpful',
        });
        result.current.submitFeedback({
          episodeId: 'ep-1',
          messageId: 'msg-2',
          rating: 'not_helpful',
        });
        result.current.submitFeedback({
          episodeId: 'ep-1',
          messageId: 'msg-3',
          rating: 'helpful',
        });
      });

      const recent = result.current.getRecentFeedback(2);
      expect(recent).toHaveLength(2);
      expect(recent[0].messageId).toBe('msg-3'); // Most recent first
      expect(recent[1].messageId).toBe('msg-2');
    });

    it('respects limit parameter', () => {
      const { result } = renderHook(() => useFeedbackStore());

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.submitFeedback({
            episodeId: 'ep-1',
            messageId: `msg-${i}`,
            rating: 'helpful',
          });
        }
      });

      const recent = result.current.getRecentFeedback(5);
      expect(recent).toHaveLength(5);
    });
  });

  describe('getFeedbackForEpisode', () => {
    it('returns feedback for specific episode', () => {
      const { result } = renderHook(() => useFeedbackStore());

      act(() => {
        result.current.submitFeedback({
          episodeId: 'ep-1',
          messageId: 'msg-1',
          rating: 'helpful',
        });
        result.current.submitFeedback({
          episodeId: 'ep-2',
          messageId: 'msg-2',
          rating: 'helpful',
        });
        result.current.submitFeedback({
          episodeId: 'ep-1',
          messageId: 'msg-3',
          rating: 'not_helpful',
        });
      });

      const ep1Feedback = result.current.getFeedbackForEpisode('ep-1');
      expect(ep1Feedback).toHaveLength(2);
      expect(ep1Feedback.every((f) => f.episodeId === 'ep-1')).toBe(true);
    });

    it('returns empty array for episode with no feedback', () => {
      const { result } = renderHook(() => useFeedbackStore());
      const feedback = result.current.getFeedbackForEpisode('non-existent');
      expect(feedback).toEqual([]);
    });
  });

  describe('exportFeedbackJSON', () => {
    it('exports feedback as JSON string', () => {
      const { result } = renderHook(() => useFeedbackStore());

      act(() => {
        result.current.submitFeedback({
          episodeId: 'ep-1',
          messageId: 'msg-1',
          rating: 'helpful',
        });
      });

      const json = result.current.exportFeedbackJSON();
      const parsed = JSON.parse(json);

      expect(parsed.exportedAt).toBeDefined();
      expect(parsed.summary).toBeDefined();
      expect(parsed.entries).toHaveLength(1);
    });
  });

  describe('clearAllFeedback', () => {
    it('clears all entries and rated messages', () => {
      const { result } = renderHook(() => useFeedbackStore());

      act(() => {
        result.current.submitFeedback({
          episodeId: 'ep-1',
          messageId: 'msg-1',
          rating: 'helpful',
        });
        result.current.submitFeedback({
          episodeId: 'ep-1',
          messageId: 'msg-2',
          rating: 'not_helpful',
        });
      });

      expect(result.current.entries).toHaveLength(2);

      act(() => {
        result.current.clearAllFeedback();
      });

      expect(result.current.entries).toHaveLength(0);
      expect(result.current.ratedMessages).toEqual({});
    });
  });

  describe('logFeedbackSummary', () => {
    it('logs summary without throwing', () => {
      const { result } = renderHook(() => useFeedbackStore());

      act(() => {
        result.current.submitFeedback({
          episodeId: 'ep-1',
          messageId: 'msg-1',
          rating: 'helpful',
        });
      });

      expect(() => {
        act(() => {
          result.current.logFeedbackSummary();
        });
      }).not.toThrow();
    });
  });
});
