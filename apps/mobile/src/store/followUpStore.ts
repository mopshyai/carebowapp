/**
 * Follow-Up Store
 * Zustand store for managing follow-up check-ins
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useShallow } from 'zustand/shallow';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FollowUpIntent,
  FollowUpOutcome,
  FollowUpStatus,
  createFollowUpIntent,
} from '../types/followUp';
import { scheduleLocalNotification, cancelLocalNotification } from '../utils/notifications';
import { useEpisodeStore } from './episodeStore';

type FollowUpState = {
  followUps: FollowUpIntent[];
};

type FollowUpActions = {
  scheduleFollowUp: (params: {
    episodeId: string;
    episodeTitle: string;
    daysFromNow: number;
    reasonSnippet: string;
  }) => FollowUpIntent;

  markFollowUpDone: (followUpId: string) => void;
  recordFollowUpOutcome: (followUpId: string, outcome: FollowUpOutcome) => void;
  cancelFollowUp: (followUpId: string) => void;
  deleteFollowUp: (followUpId: string) => void;
  deleteFollowUpsForEpisode: (episodeId: string) => void;

  getFollowUp: (followUpId: string) => FollowUpIntent | undefined;
  getFollowUpsForEpisode: (episodeId: string) => FollowUpIntent[];
  getScheduledFollowUps: () => FollowUpIntent[];
  getUpcomingFollowUps: (limit?: number) => FollowUpIntent[];
  hasScheduledFollowUp: (episodeId: string) => boolean;
};

export const useFollowUpStore = create<FollowUpState & FollowUpActions>()(
  persist(
    (set, get) => ({
      followUps: [],

      scheduleFollowUp: ({ episodeId, episodeTitle, daysFromNow, reasonSnippet }) => {
        const followUp = createFollowUpIntent({
          episodeId,
          episodeTitle,
          daysFromNow,
          reasonSnippet,
        });

        const existing = get().followUps.find(
          (f) => f.episodeId === episodeId && f.status === 'scheduled'
        );
        if (existing) cancelLocalNotification(existing.id);

        set((state) => ({
          followUps: [
            followUp,
            ...state.followUps.filter(
              (f) => !(f.episodeId === episodeId && f.status === 'scheduled')
            ),
          ],
        }));

        const episode = useEpisodeStore.getState().getEpisode(episodeId);
        if (episode && episode.careStatus !== 'escalated' && episode.careStatus !== 'resolved') {
          useEpisodeStore.getState().updateEpisode(episodeId, { careStatus: 'awaiting_follow_up' });
        }

        scheduleLocalNotification({
          id: followUp.id,
          title: 'CareBow Check-in',
          body: `How are you feeling? Time to check in on: ${episodeTitle}`,
          scheduledAt: new Date(followUp.followUpAt),
          data: {
            type: 'follow_up',
            episodeId,
            followUpId: followUp.id,
          },
        });

        return followUp;
      },

      markFollowUpDone: (followUpId) => {
        set((state) => ({
          followUps: state.followUps.map((f) =>
            f.id === followUpId
              ? { ...f, status: 'done' as FollowUpStatus, completedAt: new Date().toISOString() }
              : f
          ),
        }));
        cancelLocalNotification(followUpId);
      },

      recordFollowUpOutcome: (followUpId, outcome) => {
        const followUp = get().followUps.find((f) => f.id === followUpId);

        set((state) => ({
          followUps: state.followUps.map((f) =>
            f.id === followUpId
              ? {
                  ...f,
                  status: 'done' as FollowUpStatus,
                  completedAt: new Date().toISOString(),
                  outcome,
                }
              : f
          ),
        }));
        cancelLocalNotification(followUpId);

        if (followUp) {
          useEpisodeStore.getState().recordFollowUpOutcome(followUp.episodeId, outcome);
        }
      },

      cancelFollowUp: (followUpId) => {
        set((state) => ({
          followUps: state.followUps.map((f) =>
            f.id === followUpId ? { ...f, status: 'cancelled' as FollowUpStatus } : f
          ),
        }));
        cancelLocalNotification(followUpId);
      },

      deleteFollowUp: (followUpId) => {
        const followUp = get().followUps.find((f) => f.id === followUpId);
        if (followUp) cancelLocalNotification(followUpId);
        set((state) => ({ followUps: state.followUps.filter((f) => f.id !== followUpId) }));
      },

      deleteFollowUpsForEpisode: (episodeId) => {
        const toDelete = get().followUps.filter((f) => f.episodeId === episodeId);
        toDelete.forEach((f) => cancelLocalNotification(f.id));
        set((state) => ({
          followUps: state.followUps.filter((f) => f.episodeId !== episodeId),
        }));
      },

      getFollowUp: (followUpId) => get().followUps.find((f) => f.id === followUpId),
      getFollowUpsForEpisode: (episodeId) =>
        get().followUps.filter((f) => f.episodeId === episodeId),
      getScheduledFollowUps: () => get().followUps.filter((f) => f.status === 'scheduled'),
      getUpcomingFollowUps: (limit = 5) =>
        get()
          .followUps.filter((f) => f.status === 'scheduled')
          .sort((a, b) => new Date(a.followUpAt).getTime() - new Date(b.followUpAt).getTime())
          .slice(0, limit),
      hasScheduledFollowUp: (episodeId) =>
        get().followUps.some((f) => f.episodeId === episodeId && f.status === 'scheduled'),
    }),
    {
      name: 'carebow-followups',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export const useScheduledFollowUps = () =>
  useFollowUpStore(
    useShallow((state) => state.followUps.filter((f) => f.status === 'scheduled'))
  );

export const useUpcomingFollowUps = (limit?: number) =>
  useFollowUpStore(useShallow((state) => state.getUpcomingFollowUps(limit)));

export const useHasScheduledFollowUp = (episodeId: string) =>
  useFollowUpStore((state) => state.hasScheduledFollowUp(episodeId));
