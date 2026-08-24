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
  EpisodeProviderOutcome,
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
      return 'booking_pending';
    case 'CONFIRMED':
      return 'booked';
    case 'IN_PROGRESS':
      return 'care_in_progress';
    case 'COMPLETED':
      return 'awaiting_follow_up';
    case 'CANCELLED':
      return 'cancelled';
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
  markActionRecommended: (episodeId: string) => void;
  markSelfCare: (episodeId: string) => void;
  recordFollowUpOutcome: (episodeId: string, outcome: FollowUpOutcome) => void;
  linkBooking: (episodeId: string, bookingId: string, status: ServerBookingStatus) => void;
  recordProviderOutcome: (episodeId: string, outcome: EpisodeProviderOutcome) => void;
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
        get().updateEpisode(episodeId, {
          triageLevel,
          careStatus: triageLevel === 'emergency' ? 'escalated' : 'assessed',
          ...(triageLevel === 'emergency' ? { escalatedAt: new Date().toISOString() } : {}),
        });
      },

      markActionRecommended: (episodeId) => {
        const episode = get().getEpisode(episodeId);
        if (!episode || episode.careStatus === 'escalated') return;
        get().updateEpisode(episodeId, { careStatus: 'action_recommended' });
      },

      markSelfCare: (episodeId) => {
        const episode = get().getEpisode(episodeId);
        if (!episode || episode.careStatus === 'escalated') return;
        get().updateEpisode(episodeId, { careStatus: 'self_care' });
      },

      recordFollowUpOutcome: (episodeId, outcome) => {
        const now = new Date().toISOString();
        const episode = get().getEpisode(episodeId);
        if (!episode) return;

        if (outcome === 'worse') {
          get().updateEpisode(episodeId, {
            lastFollowUpOutcome: outcome,
            lastFollowUpAt: now,
            careStatus: 'escalated',
            escalatedAt: now,
            isActive: true,
          });
          return;
        }

        if (outcome === 'better') {
          get().updateEpisode(episodeId, {
            lastFollowUpOutcome: outcome,
            lastFollowUpAt: now,
            careStatus: 'resolved',
            resolvedAt: now,
            isActive: false,
          });
          if (get().activeEpisodeId === episodeId) set({ activeEpisodeId: null });
          return;
        }

        get().updateEpisode(episodeId, {
          lastFollowUpOutcome: outcome,
          lastFollowUpAt: now,
          careStatus: 'awaiting_follow_up',
          isActive: true,
        });
      },

      linkBooking: (episodeId, bookingId, status) => {
        const episode = get().getEpisode(episodeId);
        if (!episode) return;

        get().updateEpisode(episodeId, {
          linkedBookingId: bookingId,
          careStatus: careStatusFromBooking(status),
          isActive: status !== 'CANCELLED',
        });
      },

      recordProviderOutcome: (episodeId, outcome) => {
        const episode = get().getEpisode(episodeId);
        if (!episode) return;
        get().updateEpisode(episodeId, {
          providerOutcome: outcome,
          linkedBookingId: outcome.bookingId,
          careStatus: 'awaiting_follow_up',
          isActive: true,
        });
      },

      closeEpisode: (episodeId) => {
        const now = new Date().toISOString();
        get().updateEpisode(episodeId, {
          isActive: false,
          careStatus: 'resolved',
          resolvedAt: now,
        });
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
          if (!episode.isActive) {
            get().updateEpisode(episodeId, {
              isActive: true,
              careStatus: episode.careStatus === 'resolved' ? 'assessing' : episode.careStatus,
              resolvedAt: episode.careStatus === 'resolved' ? undefined : episode.resolvedAt,
            });
          }
        }
      },
    }),
    {
      name: 'carebow-episodes',
      storage: createJSONStorage(() => AsyncStorage),
      merge: (persisted, current) => {
        const saved = persisted as Partial<EpisodeState> | undefined;
        return {
          ...current,
          ...saved,
          episodes: (saved?.episodes ?? []).map((episode) => ({
            ...episode,
            careStatus:
              episode.careStatus === ('monitoring' as EpisodeCareStatus)
                ? 'assessing'
                : episode.careStatus === ('care_requested' as EpisodeCareStatus)
                  ? 'booking_pending'
                  : episode.careStatus === ('care_confirmed' as EpisodeCareStatus)
                    ? 'booked'
                    : episode.careStatus === ('care_completed' as EpisodeCareStatus)
                      ? 'awaiting_follow_up'
                      : episode.careStatus === ('care_cancelled' as EpisodeCareStatus)
                        ? 'cancelled'
                        : episode.careStatus || 'assessing',
          })) as Episode[],
        } as EpisodeState & EpisodeActions;
      },
    }
  )
);

export const useActiveEpisode = () => useEpisodeStore((state) => state.getActiveEpisode());
export const useAllEpisodes = () => useEpisodeStore((state) => state.episodes);
export const useRecentEpisodes = (limit?: number) =>
  useEpisodeStore(useShallow((state) => state.getRecentEpisodes(limit)));
export const useEpisodeMessages = (episodeId: string) =>
  useEpisodeStore((state) => state.messages[episodeId]);
