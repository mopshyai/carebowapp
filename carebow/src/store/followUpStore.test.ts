/**
 * Follow-Up Store Tests
 * Tests for the follow-up check-in system
 */

import { act, renderHook } from '@testing-library/react-native';
import { useFollowUpStore } from './followUpStore';
import type { FollowUpIntent } from '../types/followUp';

// Mock the notifications utility to avoid notifee dependency
jest.mock('../utils/notifications', () => ({
  scheduleLocalNotification: jest.fn().mockResolvedValue(undefined),
  cancelLocalNotification: jest.fn().mockResolvedValue(undefined),
}));

// Helper to reset store state between tests
const resetStore = () => {
  useFollowUpStore.setState({
    followUps: [],
  });
};

describe('followUpStore', () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('starts with empty follow-ups', () => {
      const { result } = renderHook(() => useFollowUpStore());
      expect(result.current.followUps).toEqual([]);
    });
  });

  describe('Schedule Follow-Up', () => {
    it('scheduleFollowUp creates a new follow-up', () => {
      const { result } = renderHook(() => useFollowUpStore());

      let followUp: FollowUpIntent;
      act(() => {
        followUp = result.current.scheduleFollowUp({
          episodeId: 'episode-123',
          episodeTitle: 'Headache symptoms',
          daysFromNow: 3,
          reasonSnippet: 'Check if symptoms persist',
        });
      });

      expect(result.current.followUps).toHaveLength(1);
      expect(followUp!.episodeId).toBe('episode-123');
      expect(followUp!.episodeTitle).toBe('Headache symptoms');
      expect(followUp!.status).toBe('scheduled');
      expect(followUp!.id).toBeDefined();
      expect(followUp!.createdAt).toBeDefined();
      expect(followUp!.followUpAt).toBeDefined();
    });

    it('scheduleFollowUp replaces existing scheduled follow-up for same episode', () => {
      const { result } = renderHook(() => useFollowUpStore());

      act(() => {
        result.current.scheduleFollowUp({
          episodeId: 'episode-123',
          episodeTitle: 'First follow-up',
          daysFromNow: 1,
          reasonSnippet: 'First reason',
        });
      });

      expect(result.current.followUps).toHaveLength(1);

      act(() => {
        result.current.scheduleFollowUp({
          episodeId: 'episode-123',
          episodeTitle: 'Second follow-up',
          daysFromNow: 3,
          reasonSnippet: 'Second reason',
        });
      });

      // Should still be 1 (replaced, not added)
      expect(result.current.followUps).toHaveLength(1);
      expect(result.current.followUps[0].reasonSnippet).toBe('Second reason');
    });

    it('scheduleFollowUp allows multiple follow-ups for different episodes', () => {
      const { result } = renderHook(() => useFollowUpStore());

      act(() => {
        result.current.scheduleFollowUp({
          episodeId: 'episode-1',
          episodeTitle: 'Episode 1',
          daysFromNow: 1,
          reasonSnippet: 'Reason 1',
        });
        result.current.scheduleFollowUp({
          episodeId: 'episode-2',
          episodeTitle: 'Episode 2',
          daysFromNow: 2,
          reasonSnippet: 'Reason 2',
        });
      });

      expect(result.current.followUps).toHaveLength(2);
    });
  });

  describe('Mark Follow-Up Done', () => {
    it('markFollowUpDone updates status to done', () => {
      const { result } = renderHook(() => useFollowUpStore());

      let followUp: FollowUpIntent;
      act(() => {
        followUp = result.current.scheduleFollowUp({
          episodeId: 'episode-123',
          episodeTitle: 'Test episode',
          daysFromNow: 1,
          reasonSnippet: 'Test reason',
        });
      });

      act(() => {
        result.current.markFollowUpDone(followUp!.id);
      });

      expect(result.current.followUps[0].status).toBe('done');
      expect(result.current.followUps[0].completedAt).toBeDefined();
    });
  });

  describe('Cancel Follow-Up', () => {
    it('cancelFollowUp updates status to cancelled', () => {
      const { result } = renderHook(() => useFollowUpStore());

      let followUp: FollowUpIntent;
      act(() => {
        followUp = result.current.scheduleFollowUp({
          episodeId: 'episode-123',
          episodeTitle: 'Test episode',
          daysFromNow: 1,
          reasonSnippet: 'Test reason',
        });
      });

      act(() => {
        result.current.cancelFollowUp(followUp!.id);
      });

      expect(result.current.followUps[0].status).toBe('cancelled');
    });
  });

  describe('Delete Follow-Up', () => {
    it('deleteFollowUp removes follow-up from store', () => {
      const { result } = renderHook(() => useFollowUpStore());

      let followUp: FollowUpIntent;
      act(() => {
        followUp = result.current.scheduleFollowUp({
          episodeId: 'episode-123',
          episodeTitle: 'Test episode',
          daysFromNow: 1,
          reasonSnippet: 'Test reason',
        });
      });

      expect(result.current.followUps).toHaveLength(1);

      act(() => {
        result.current.deleteFollowUp(followUp!.id);
      });

      expect(result.current.followUps).toHaveLength(0);
    });

    it('deleteFollowUpsForEpisode removes all follow-ups for episode', () => {
      const { result } = renderHook(() => useFollowUpStore());

      act(() => {
        result.current.scheduleFollowUp({
          episodeId: 'episode-1',
          episodeTitle: 'Episode 1',
          daysFromNow: 1,
          reasonSnippet: 'Reason 1',
        });
        result.current.scheduleFollowUp({
          episodeId: 'episode-2',
          episodeTitle: 'Episode 2',
          daysFromNow: 2,
          reasonSnippet: 'Reason 2',
        });
      });

      expect(result.current.followUps).toHaveLength(2);

      act(() => {
        result.current.deleteFollowUpsForEpisode('episode-1');
      });

      expect(result.current.followUps).toHaveLength(1);
      expect(result.current.followUps[0].episodeId).toBe('episode-2');
    });
  });

  describe('Getters', () => {
    it('getFollowUp returns correct follow-up', () => {
      const { result } = renderHook(() => useFollowUpStore());

      let followUp: FollowUpIntent;
      act(() => {
        followUp = result.current.scheduleFollowUp({
          episodeId: 'episode-123',
          episodeTitle: 'Test episode',
          daysFromNow: 1,
          reasonSnippet: 'Test reason',
        });
      });

      const found = result.current.getFollowUp(followUp!.id);
      expect(found).toBeDefined();
      expect(found?.episodeId).toBe('episode-123');
    });

    it('getFollowUp returns undefined for non-existent id', () => {
      const { result } = renderHook(() => useFollowUpStore());
      const found = result.current.getFollowUp('non-existent');
      expect(found).toBeUndefined();
    });

    it('getFollowUpsForEpisode returns correct follow-ups', () => {
      const { result } = renderHook(() => useFollowUpStore());

      act(() => {
        result.current.scheduleFollowUp({
          episodeId: 'episode-1',
          episodeTitle: 'Episode 1',
          daysFromNow: 1,
          reasonSnippet: 'Reason 1',
        });
        result.current.scheduleFollowUp({
          episodeId: 'episode-2',
          episodeTitle: 'Episode 2',
          daysFromNow: 2,
          reasonSnippet: 'Reason 2',
        });
      });

      const episodeFollowUps = result.current.getFollowUpsForEpisode('episode-1');
      expect(episodeFollowUps).toHaveLength(1);
      expect(episodeFollowUps[0].episodeId).toBe('episode-1');
    });

    it('getScheduledFollowUps returns only scheduled follow-ups', () => {
      const { result } = renderHook(() => useFollowUpStore());

      let followUp1: FollowUpIntent;
      let followUp2: FollowUpIntent;
      act(() => {
        followUp1 = result.current.scheduleFollowUp({
          episodeId: 'episode-1',
          episodeTitle: 'Episode 1',
          daysFromNow: 1,
          reasonSnippet: 'Reason 1',
        });
        followUp2 = result.current.scheduleFollowUp({
          episodeId: 'episode-2',
          episodeTitle: 'Episode 2',
          daysFromNow: 2,
          reasonSnippet: 'Reason 2',
        });
      });

      // Cancel one
      act(() => {
        result.current.cancelFollowUp(followUp1!.id);
      });

      const scheduled = result.current.getScheduledFollowUps();
      expect(scheduled).toHaveLength(1);
      expect(scheduled[0].episodeId).toBe('episode-2');
    });

    it('getUpcomingFollowUps returns sorted and limited results', () => {
      const { result } = renderHook(() => useFollowUpStore());

      act(() => {
        // Schedule in random order
        result.current.scheduleFollowUp({
          episodeId: 'episode-3',
          episodeTitle: 'Episode 3',
          daysFromNow: 5,
          reasonSnippet: 'Later',
        });
        result.current.scheduleFollowUp({
          episodeId: 'episode-1',
          episodeTitle: 'Episode 1',
          daysFromNow: 1,
          reasonSnippet: 'Soon',
        });
        result.current.scheduleFollowUp({
          episodeId: 'episode-2',
          episodeTitle: 'Episode 2',
          daysFromNow: 3,
          reasonSnippet: 'Mid',
        });
      });

      // Get top 2
      const upcoming = result.current.getUpcomingFollowUps(2);
      expect(upcoming).toHaveLength(2);
      // Should be sorted by date (earliest first)
      expect(upcoming[0].episodeId).toBe('episode-1');
      expect(upcoming[1].episodeId).toBe('episode-2');
    });

    it('getUpcomingFollowUps defaults to 5 items', () => {
      const { result } = renderHook(() => useFollowUpStore());

      act(() => {
        for (let i = 1; i <= 7; i++) {
          result.current.scheduleFollowUp({
            episodeId: `episode-${i}`,
            episodeTitle: `Episode ${i}`,
            daysFromNow: i,
            reasonSnippet: `Reason ${i}`,
          });
        }
      });

      const upcoming = result.current.getUpcomingFollowUps();
      expect(upcoming).toHaveLength(5);
    });

    it('hasScheduledFollowUp returns correct boolean', () => {
      const { result } = renderHook(() => useFollowUpStore());

      expect(result.current.hasScheduledFollowUp('episode-123')).toBe(false);

      let followUp: FollowUpIntent;
      act(() => {
        followUp = result.current.scheduleFollowUp({
          episodeId: 'episode-123',
          episodeTitle: 'Test episode',
          daysFromNow: 1,
          reasonSnippet: 'Test reason',
        });
      });

      expect(result.current.hasScheduledFollowUp('episode-123')).toBe(true);

      // Cancel it
      act(() => {
        result.current.cancelFollowUp(followUp!.id);
      });

      expect(result.current.hasScheduledFollowUp('episode-123')).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('handles deleting non-existent follow-up gracefully', () => {
      const { result } = renderHook(() => useFollowUpStore());

      // Should not throw
      expect(() => {
        act(() => {
          result.current.deleteFollowUp('non-existent-id');
        });
      }).not.toThrow();
    });

    it('handles marking non-existent follow-up as done gracefully', () => {
      const { result } = renderHook(() => useFollowUpStore());

      // Should not throw
      expect(() => {
        act(() => {
          result.current.markFollowUpDone('non-existent-id');
        });
      }).not.toThrow();
    });

    it('completed follow-ups are not included in scheduled list', () => {
      const { result } = renderHook(() => useFollowUpStore());

      let followUp: FollowUpIntent;
      act(() => {
        followUp = result.current.scheduleFollowUp({
          episodeId: 'episode-123',
          episodeTitle: 'Test episode',
          daysFromNow: 1,
          reasonSnippet: 'Test reason',
        });
      });

      expect(result.current.getScheduledFollowUps()).toHaveLength(1);

      act(() => {
        result.current.markFollowUpDone(followUp!.id);
      });

      expect(result.current.getScheduledFollowUps()).toHaveLength(0);
    });
  });
});
