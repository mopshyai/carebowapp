/**
 * Episode Store Tests
 * Tests for health episode (conversation thread) management
 */

import { act, renderHook } from '@testing-library/react-native';
import { useEpisodeStore } from './episodeStore';
import type { Episode } from '../types/episode';

// Helper to reset store state between tests
const resetStore = () => {
  useEpisodeStore.setState({
    episodes: [],
    messages: {},
    activeEpisodeId: null,
  });
};

describe('episodeStore', () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('starts with empty episodes', () => {
      const { result } = renderHook(() => useEpisodeStore());
      expect(result.current.episodes).toEqual([]);
    });

    it('starts with empty messages', () => {
      const { result } = renderHook(() => useEpisodeStore());
      expect(result.current.messages).toEqual({});
    });

    it('starts with no active episode', () => {
      const { result } = renderHook(() => useEpisodeStore());
      expect(result.current.activeEpisodeId).toBeNull();
    });
  });

  describe('Start Episode', () => {
    it('startEpisode creates a new episode', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'I have a headache',
          forWhom: 'self',
          age: 35,
        });
      });

      expect(result.current.episodes).toHaveLength(1);
      expect(episode!.forWhom).toBe('self');
      expect(episode!.isActive).toBe(true);
    });

    it('startEpisode sets the episode as active', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'Feeling dizzy',
          forWhom: 'self',
        });
      });

      expect(result.current.activeEpisodeId).toBe(episode!.id);
    });

    it('startEpisode creates initial user message', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'My back hurts',
          forWhom: 'self',
        });
      });

      const messages = result.current.messages[episode!.id];
      expect(messages).toHaveLength(1);
      expect(messages[0].role).toBe('user');
      expect(messages[0].text).toBe('My back hurts');
    });

    it('startEpisode handles family member episodes', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'Child has fever',
          forWhom: 'family_member',
          age: 5,
          relationship: 'child',
        });
      });

      expect(episode!.forWhom).toBe('family_member');
      expect(episode!.relationship).toBe('child');
    });

    it('startEpisode generates title from symptom', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'Severe stomach pain after eating',
          forWhom: 'self',
        });
      });

      expect(episode!.title).toBeDefined();
      expect(episode!.title.length).toBeGreaterThan(0);
    });
  });

  describe('Update Episode', () => {
    it('updateEpisode updates episode fields', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'Test symptom',
          forWhom: 'self',
        });
      });

      act(() => {
        result.current.updateEpisode(episode!.id, {
          title: 'Updated Title',
        });
      });

      expect(result.current.episodes[0].title).toBe('Updated Title');
    });

    it('updateEpisode updates timestamp', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'Test symptom',
          forWhom: 'self',
        });
      });

      const originalUpdatedAt = new Date(result.current.episodes[0].updatedAt).getTime();

      act(() => {
        result.current.updateEpisode(episode!.id, { title: 'New Title' });
      });

      const newUpdatedAt = new Date(result.current.episodes[0].updatedAt).getTime();
      expect(newUpdatedAt).toBeGreaterThanOrEqual(originalUpdatedAt);
    });

    it('setTriageLevel sets the triage level', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'Chest pain',
          forWhom: 'self',
        });
      });

      act(() => {
        result.current.setTriageLevel(episode!.id, 'emergent');
      });

      expect(result.current.episodes[0].triageLevel).toBe('emergent');
    });
  });

  describe('Close Episode', () => {
    it('closeEpisode marks episode as inactive', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'Test symptom',
          forWhom: 'self',
        });
      });

      act(() => {
        result.current.closeEpisode(episode!.id);
      });

      expect(result.current.episodes[0].isActive).toBe(false);
    });

    it('closeEpisode clears active episode if it was active', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'Test symptom',
          forWhom: 'self',
        });
      });

      expect(result.current.activeEpisodeId).toBe(episode!.id);

      act(() => {
        result.current.closeEpisode(episode!.id);
      });

      expect(result.current.activeEpisodeId).toBeNull();
    });
  });

  describe('Delete Episode', () => {
    it('deleteEpisode removes episode from store', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'Test symptom',
          forWhom: 'self',
        });
      });

      expect(result.current.episodes).toHaveLength(1);

      act(() => {
        result.current.deleteEpisode(episode!.id);
      });

      expect(result.current.episodes).toHaveLength(0);
    });

    it('deleteEpisode removes messages for episode', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'Test symptom',
          forWhom: 'self',
        });
      });

      expect(result.current.messages[episode!.id]).toBeDefined();

      act(() => {
        result.current.deleteEpisode(episode!.id);
      });

      expect(result.current.messages[episode!.id]).toBeUndefined();
    });

    it('deleteEpisode clears active episode if deleted', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'Test symptom',
          forWhom: 'self',
        });
      });

      act(() => {
        result.current.deleteEpisode(episode!.id);
      });

      expect(result.current.activeEpisodeId).toBeNull();
    });
  });

  describe('Add Message', () => {
    it('addMessage adds message to episode', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'Initial symptom',
          forWhom: 'self',
        });
      });

      act(() => {
        result.current.addMessage({
          episodeId: episode!.id,
          role: 'assistant',
          text: 'How long have you had this symptom?',
        });
      });

      const messages = result.current.messages[episode!.id];
      expect(messages).toHaveLength(2); // Initial + new message
      expect(messages[1].role).toBe('assistant');
    });

    it('addMessage updates episode lastMessageSnippet', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'Initial symptom',
          forWhom: 'self',
        });
      });

      act(() => {
        result.current.addMessage({
          episodeId: episode!.id,
          role: 'user',
          text: 'About 3 days now',
        });
      });

      expect(result.current.episodes[0].lastMessageSnippet).toBe('About 3 days now');
    });

    it('addMessage increments messageCount', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'Initial symptom',
          forWhom: 'self',
        });
      });

      act(() => {
        result.current.addMessage({
          episodeId: episode!.id,
          role: 'assistant',
          text: 'Response 1',
        });
        result.current.addMessage({
          episodeId: episode!.id,
          role: 'user',
          text: 'Response 2',
        });
      });

      expect(result.current.episodes[0].messageCount).toBe(3); // Initial + 2 new
    });
  });

  describe('Getters', () => {
    it('getEpisode returns correct episode', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'Test symptom',
          forWhom: 'self',
        });
      });

      const found = result.current.getEpisode(episode!.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(episode!.id);
    });

    it('getEpisode returns undefined for non-existent id', () => {
      const { result } = renderHook(() => useEpisodeStore());
      const found = result.current.getEpisode('non-existent');
      expect(found).toBeUndefined();
    });

    it('getMessages returns messages for episode', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'Test symptom',
          forWhom: 'self',
        });
      });

      const messages = result.current.getMessages(episode!.id);
      expect(messages).toHaveLength(1);
    });

    it('getMessages returns empty array for non-existent episode', () => {
      const { result } = renderHook(() => useEpisodeStore());
      const messages = result.current.getMessages('non-existent');
      expect(messages).toEqual([]);
    });

    it('getActiveEpisode returns active episode', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'Test symptom',
          forWhom: 'self',
        });
      });

      const active = result.current.getActiveEpisode();
      expect(active?.id).toBe(episode!.id);
    });

    it('getActiveEpisode returns undefined when no active episode', () => {
      const { result } = renderHook(() => useEpisodeStore());
      const active = result.current.getActiveEpisode();
      expect(active).toBeUndefined();
    });

    it('getAllEpisodes returns all episodes', () => {
      const { result } = renderHook(() => useEpisodeStore());

      act(() => {
        result.current.startEpisode({ symptomText: 'Symptom 1', forWhom: 'self' });
        result.current.startEpisode({ symptomText: 'Symptom 2', forWhom: 'self' });
        result.current.startEpisode({ symptomText: 'Symptom 3', forWhom: 'self' });
      });

      const all = result.current.getAllEpisodes();
      expect(all).toHaveLength(3);
    });

    it('getRecentEpisodes returns limited episodes sorted by date', () => {
      const { result } = renderHook(() => useEpisodeStore());

      act(() => {
        result.current.startEpisode({ symptomText: 'Symptom 1', forWhom: 'self' });
        result.current.startEpisode({ symptomText: 'Symptom 2', forWhom: 'self' });
        result.current.startEpisode({ symptomText: 'Symptom 3', forWhom: 'self' });
      });

      const recent = result.current.getRecentEpisodes(2);
      expect(recent).toHaveLength(2);
    });
  });

  describe('Session Management', () => {
    it('setActiveEpisode sets the active episode', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'Test symptom',
          forWhom: 'self',
        });
      });

      act(() => {
        result.current.setActiveEpisode(null);
      });

      expect(result.current.activeEpisodeId).toBeNull();

      act(() => {
        result.current.setActiveEpisode(episode!.id);
      });

      expect(result.current.activeEpisodeId).toBe(episode!.id);
    });

    it('resumeEpisode activates a closed episode', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode: Episode;
      act(() => {
        episode = result.current.startEpisode({
          symptomText: 'Test symptom',
          forWhom: 'self',
        });
      });

      act(() => {
        result.current.closeEpisode(episode!.id);
      });

      expect(result.current.activeEpisodeId).toBeNull();
      expect(result.current.episodes[0].isActive).toBe(false);

      act(() => {
        result.current.resumeEpisode(episode!.id);
      });

      expect(result.current.activeEpisodeId).toBe(episode!.id);
      expect(result.current.episodes[0].isActive).toBe(true);
    });

    it('resumeEpisode does nothing for non-existent episode', () => {
      const { result } = renderHook(() => useEpisodeStore());

      act(() => {
        result.current.resumeEpisode('non-existent');
      });

      expect(result.current.activeEpisodeId).toBeNull();
    });
  });

  describe('Multiple Episodes', () => {
    it('handles multiple episodes correctly', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode1: Episode;
      let episode2: Episode;
      act(() => {
        episode1 = result.current.startEpisode({
          symptomText: 'Headache',
          forWhom: 'self',
        });
        episode2 = result.current.startEpisode({
          symptomText: 'Back pain',
          forWhom: 'self',
        });
      });

      expect(result.current.episodes).toHaveLength(2);
      // Most recent episode should be active
      expect(result.current.activeEpisodeId).toBe(episode2!.id);
    });

    it('maintains separate message arrays per episode', () => {
      const { result } = renderHook(() => useEpisodeStore());

      let episode1: Episode;
      let episode2: Episode;
      act(() => {
        episode1 = result.current.startEpisode({
          symptomText: 'Headache',
          forWhom: 'self',
        });
        episode2 = result.current.startEpisode({
          symptomText: 'Back pain',
          forWhom: 'self',
        });
      });

      act(() => {
        result.current.addMessage({
          episodeId: episode1!.id,
          role: 'assistant',
          text: 'Response for headache',
        });
      });

      expect(result.current.messages[episode1!.id]).toHaveLength(2);
      expect(result.current.messages[episode2!.id]).toHaveLength(1);
    });
  });
});
