/**
 * Episode Store
 * Zustand store for managing Health Episodes (conversation threads)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Episode,
  EpisodeMessage,
  ForWhom,
  AgeGroup,
  createEpisode,
  createMessage,
  MessageAttachment,
} from '../types/episode';
import { TriageLevel } from '../utils/triageCTAMapping';
import { generateEpisodeTitle, getAgeGroupFromAge } from '../utils/episodeTitleGenerator';

// ============================================
// STORE TYPES
// ============================================

type EpisodeState = {
  episodes: Episode[];
  messages: Record<string, EpisodeMessage[]>; // keyed by episodeId
  activeEpisodeId: string | null;
};

type EpisodeActions = {
  // Episode management
  startEpisode: (params: {
    symptomText: string;
    forWhom: ForWhom;
    age?: string | number;
    relationship?: string;
  }) => Episode;

  updateEpisode: (episodeId: string, updates: Partial<Episode>) => void;
  setTriageLevel: (episodeId: string, triageLevel: TriageLevel) => void;
  closeEpisode: (episodeId: string) => void;
  deleteEpisode: (episodeId: string) => void;

  // Message management
  addMessage: (params: {
    episodeId: string;
    role: 'user' | 'assistant' | 'system';
    text: string;
    attachments?: MessageAttachment[];
  }) => EpisodeMessage;

  // Getters
  getEpisode: (episodeId: string) => Episode | undefined;
  getMessages: (episodeId: string) => EpisodeMessage[];
  getActiveEpisode: () => Episode | undefined;
  getAllEpisodes: () => Episode[];
  getRecentEpisodes: (limit?: number) => Episode[];

  // Session management
  setActiveEpisode: (episodeId: string | null) => void;
  resumeEpisode: (episodeId: string) => void;
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useEpisodeStore = create<EpisodeState & EpisodeActions>()(
  persist(
    (set, get) => ({
      // Initial state
      episodes: [],
      messages: {},
      activeEpisodeId: null,

      // Start a new episode
      startEpisode: ({ symptomText, forWhom, age, relationship }) => {
        const ageGroup = getAgeGroupFromAge(age);
        const title = generateEpisodeTitle(symptomText, forWhom, ageGroup, relationship);

        const episode = createEpisode({
          title,
          forWhom,
          ageGroup,
          relationship,
          firstMessage: symptomText,
        });

        // Create initial user message
        const firstMessage = createMessage({
          episodeId: episode.id,
          role: 'user',
          text: symptomText,
        });

        set((state) => ({
          episodes: [episode, ...state.episodes],
          messages: {
            ...state.messages,
            [episode.id]: [firstMessage],
          },
          activeEpisodeId: episode.id,
        }));

        return episode;
      },

      // Update episode
      updateEpisode: (episodeId, updates) => {
        set((state) => ({
          episodes: state.episodes.map((ep) =>
            ep.id === episodeId
              ? { ...ep, ...updates, updatedAt: new Date().toISOString() }
              : ep
          ),
        }));
      },

      // Set triage level
      setTriageLevel: (episodeId, triageLevel) => {
        get().updateEpisode(episodeId, { triageLevel });
      },

      // Close episode
      closeEpisode: (episodeId) => {
        get().updateEpisode(episodeId, { isActive: false });
        if (get().activeEpisodeId === episodeId) {
          set({ activeEpisodeId: null });
        }
      },

      // Delete episode
      deleteEpisode: (episodeId) => {
        set((state) => {
          const { [episodeId]: _, ...remainingMessages } = state.messages;
          return {
            episodes: state.episodes.filter((ep) => ep.id !== episodeId),
            messages: remainingMessages,
            activeEpisodeId:
              state.activeEpisodeId === episodeId ? null : state.activeEpisodeId,
          };
        });
      },

      // Add message to episode
      addMessage: ({ episodeId, role, text, attachments }) => {
        const message = createMessage({ episodeId, role, text, attachments });

        set((state) => {
          const episodeMessages = state.messages[episodeId] || [];
          return {
            messages: {
              ...state.messages,
              [episodeId]: [...episodeMessages, message],
            },
            episodes: state.episodes.map((ep) =>
              ep.id === episodeId
                ? {
                    ...ep,
                    lastMessageSnippet: text.slice(0, 100),
                    messageCount: episodeMessages.length + 1,
                    updatedAt: new Date().toISOString(),
                  }
                : ep
            ),
          };
        });

        return message;
      },

      // Getters
      getEpisode: (episodeId) => {
        return get().episodes.find((ep) => ep.id === episodeId);
      },

      getMessages: (episodeId) => {
        return get().messages[episodeId] || [];
      },

      getActiveEpisode: () => {
        const { activeEpisodeId, episodes } = get();
        if (!activeEpisodeId) return undefined;
        return episodes.find((ep) => ep.id === activeEpisodeId);
      },

      getAllEpisodes: () => {
        return get().episodes;
      },

      getRecentEpisodes: (limit = 10) => {
        return get()
          .episodes.sort(
            (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
          .slice(0, limit);
      },

      // Session management
      setActiveEpisode: (episodeId) => {
        set({ activeEpisodeId: episodeId });
      },

      resumeEpisode: (episodeId) => {
        const episode = get().getEpisode(episodeId);
        if (episode) {
          set({ activeEpisodeId: episodeId });
          // Mark as active if it was closed
          if (!episode.isActive) {
            get().updateEpisode(episodeId, { isActive: true });
          }
        }
      },
    }),
    {
      name: 'carebow-episodes',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================
// SELECTOR HOOKS
// ============================================

// Returns same object ref from .find() - no shallow needed
export const useActiveEpisode = () => useEpisodeStore((state) => state.getActiveEpisode());

// Returns same array ref from state - no shallow needed
export const useAllEpisodes = () => useEpisodeStore((state) => state.episodes);

/**
 * FIX: getRecentEpisodes creates NEW array via .sort().slice() on every call.
 * Use useShallow to compare array contents, not references.
 */
export const useRecentEpisodes = (limit?: number) =>
  useEpisodeStore(
    useShallow((state) => state.getRecentEpisodes(limit))
  );

// Returns same array ref from state.messages[id], or undefined - no shallow needed
export const useEpisodeMessages = (episodeId: string) =>
  useEpisodeStore((state) => state.messages[episodeId]);
