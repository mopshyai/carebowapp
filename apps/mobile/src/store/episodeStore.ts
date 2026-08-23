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
  EpisodeCareStatus,
  EpisodeMessage,
  ForWhom,
  createEpisode,
  createMessage,
  MessageAttachment,
} from '../types/episode';
import type { FollowUpOutcome } from '../types/followUp';
import { TriageLevel } from '../utils/triageCTAMapping';
import { generateEpisodeTitle, getAgeGroupFromAge } from '../utils/episodeTitleGenerator';

type ServerBookingStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

function careStatusFromBooking(status: ServerBookingStatus): EpisodeCareStatus {
  switch (status) {
    case 'PENDING':
      return 'care_requested';
    case 'CONFIRMED':
      return 'care_confirmed';
    case 'IN_PROGRESS':
      return 'care_in_progress';
    case 'COMPLETED':
      return 'care_completed';
    case 'CANCELLED':
      return 'care_cancelled';
  }
}

type EpisodeState = {
  episodes: Episode[];
  messages: Record<string, EpisodeMessage[]>;
  activeEpisodeId: string | null;
};

type EpisodeActions = {
  startEpisode: (params: {
    symptomText: string;
    forWhom: ForWhom;
    age?: string | number;
    relationship?: string;
  }) => Episode;

  updateEpisode: (episodeId: string, updates: Partial<Episode>) => void;
  setTriageLevel: (episodeId: string, triageLevel: TriageLevel) => void;
  recordFollowUpOutcome: (episodeId: string, outcome: FollowUpOutcome) => void;
  linkBooking: (episodeId: string, bookingId: string, status: ServerBookingStatus) => void;
  closeEpisode: (episodeId: string) => void;
  deleteEpisode: (episodeId: string) => void;

  addMessage: (params: {
    episodeId: string;
    role: 'user' | 'assistant' | 'system';
    text: string;
    attachments?: MessageAttachment[];
  }) => EpisodeMessage;

  getEpisode: (episodeId: string) => Episode | undefined;
  getMessages: (episodeId: string) => EpisodeMessage[];
  getActiveEpisode: () => Episode | undefined;
  getAllEpisodes: () => Episode[];
  getRecentEpisodes: (limit?: number) => Episode[];

  setActiveEpisode: (episodeId: string | null) => void;
  resumeEpisode: (episodeId: string) => void;
};

export const useEpisodeStore = create<EpisodeState & EpisodeActions>()(
  persist(
    (set, get) => ({
      episodes: [],
      messages: {},
      activeEpisodeId: null,

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

        const firstMessage = createMessage({
          episodeId: episode.id,
          role: 'user',
          text: symptomText,
        });

        set((state) => ({
          episodes: [episode, ...state.episodes],
          messages: { ...state.messages, [episode.id]: [firstMessage] },
          activeEpisodeId: episode.id,
        }));

        return episode;
      },

      updateEpisode: (episodeId, updates) => {
        set((state) => ({
          episodes: state.episodes.map((ep) =>
            ep.id === episodeId ? { ...ep, ...updates, updatedAt: new Date().toISOString() } : ep
          ),
        }));
      },

      setTriageLevel: (episodeId, triageLevel) => {
        get().updateEpisode(episodeId, { triageLevel });
      },

      recordFollowUpOutcome: (episodeId, outcome) => {
        get().updateEpisode(episodeId, {
          lastFollowUpOutcome: outcome,
          lastFollowUpAt: new Date().toISOString(),
        });
      },

      linkBooking: (episodeId, bookingId, status) => {
        const episode = get().getEpisode(episodeId);
        if (!episode) return;

        get().updateEpisode(episodeId, {
          linkedBookingId: bookingId,
          careStatus: careStatusFromBooking(status),
        });
      },

      closeEpisode: (episodeId) => {
        get().updateEpisode(episodeId, { isActive: false });
        if (get().activeEpisodeId === episodeId) set({ activeEpisodeId: null });
      },

      deleteEpisode: (episodeId) => {
        set((state) => {
          const { [episodeId]: _, ...remainingMessages } = state.messages;
          return {
            episodes: state.episodes.filter((ep) => ep.id !== episodeId),
            messages: remainingMessages,
            activeEpisodeId: state.activeEpisodeId === episodeId ? null : state.activeEpisodeId,
          };
        });
      },

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

      getEpisode: (episodeId) => get().episodes.find((ep) => ep.id === episodeId),
      getMessages: (episodeId) => get().messages[episodeId] || [],
      getActiveEpisode: () => {
        const { activeEpisodeId, episodes } = get();
        if (!activeEpisodeId) return undefined;
        return episodes.find((ep) => ep.id === activeEpisodeId);
      },
      getAllEpisodes: () => get().episodes,
      getRecentEpisodes: (limit = 10) =>
        [...get().episodes]
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
          .slice(0, limit),

      setActiveEpisode: (episodeId) => set({ activeEpisodeId: episodeId }),
      resumeEpisode: (episodeId) => {
        const episode = get().getEpisode(episodeId);
        if (episode) {
          set({ activeEpisodeId: episodeId });
          if (!episode.isActive) get().updateEpisode(episodeId, { isActive: true });
        }
      },
    }),
    {
      name: 'carebow-episodes',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useActiveEpisode = () => useEpisodeStore((state) => state.getActiveEpisode());
export const useAllEpisodes = () => useEpisodeStore((state) => state.episodes);
export const useRecentEpisodes = (limit?: number) =>
  useEpisodeStore(useShallow((state) => state.getRecentEpisodes(limit)));
export const useEpisodeMessages = (episodeId: string) =>
  useEpisodeStore((state) => state.messages[episodeId]);
