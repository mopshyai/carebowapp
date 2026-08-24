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
import { askCarebowOrchestratorApi } from '../services/api/endpoints/askCarebowOrchestrator';
import { getCachedBackendSessionId } from '../lib/askCarebow/orchestratorClient';
import { useAskCarebowStore } from './askCarebowStore';
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
  syncFollowUpOutcome: (followUpId: string) => Promise<void>;
  syncPendingOutcomes: () => Promise<void>;
  cancelFollowUp: (followUpId: string) => void;
  deleteFollowUp: (followUpId: string) => void;
  deleteFollowUpsForEpisode: (episodeId: string) => void;

  getFollowUp: (followUpId: string) => FollowUpIntent | undefined;
  getFollowUpsForEpisode: (episodeId: string) => FollowUpIntent[];
  getScheduledFollowUps: () => FollowUpIntent[];
  getUpcomingFollowUps: (limit?: number) => FollowUpIntent[];
  hasScheduledFollowUp: (episodeId: string) => boolean;
};

// Prevent duplicate network writes inside one running app process. Persisted
// status remains `pending`, so a crash cannot strand an item in a `syncing` state.
const syncingFollowUpIds = new Set<string>();

export const useFollowUpStore = create<FollowUpState & FollowUpActions>()(
  persist(
    (set, get) => ({
      followUps: [],

      scheduleFollowUp: ({ episodeId, episodeTitle, daysFromNow, reasonSnippet }) => {
        // Any new user activity is a useful opportunity to flush an older
        // offline follow-up outcome before adding another reminder.
        void get().syncPendingOutcomes();

        const localChatSessionId = useAskCarebowStore.getState().currentSession?.id;
        const followUp = createFollowUpIntent({
          episodeId,
          episodeTitle,
          localChatSessionId,
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
        if (!followUp) return;

        set((state) => ({
          followUps: state.followUps.map((f) =>
            f.id === followUpId
              ? {
                  ...f,
                  status: 'done' as FollowUpStatus,
                  completedAt: new Date().toISOString(),
                  outcome,
                  serverSyncStatus: f.localChatSessionId ? 'pending' : 'not_applicable',
                  serverSyncedAt: undefined,
                }
              : f
          ),
        }));
        cancelLocalNotification(followUpId);

        useEpisodeStore.getState().recordFollowUpOutcome(followUp.episodeId, outcome);
        void get().syncFollowUpOutcome(followUpId);
      },

      syncFollowUpOutcome: async (followUpId) => {
        if (syncingFollowUpIds.has(followUpId)) return;

        const followUp = get().followUps.find((f) => f.id === followUpId);
        if (!followUp?.outcome) return;
        if (followUp.serverSyncStatus === 'synced' || followUp.serverSyncStatus === 'not_applicable') {
          return;
        }

        if (!followUp.localChatSessionId) {
          set((state) => ({
            followUps: state.followUps.map((f) =>
              f.id === followUpId ? { ...f, serverSyncStatus: 'not_applicable' } : f
            ),
          }));
          return;
        }

        syncingFollowUpIds.add(followUpId);
        try {
          const backendSessionId = await getCachedBackendSessionId(followUp.localChatSessionId);
          if (!backendSessionId) return;

          const result = await askCarebowOrchestratorApi.recordFollowUpOutcome(
            backendSessionId,
            followUp.outcome
          );
          if (!result.success) return;

          set((state) => ({
            followUps: state.followUps.map((f) =>
              f.id === followUpId
                ? {
                    ...f,
                    serverSyncStatus: 'synced',
                    serverSyncedAt: new Date().toISOString(),
                  }
                : f
            ),
          }));
        } catch {
          // Deliberately leave the persisted status as pending. The store retries
          // after rehydration and on subsequent follow-up activity.
        } finally {
          syncingFollowUpIds.delete(followUpId);
        }
      },

      syncPendingOutcomes: async () => {
        const pendingIds = get()
          .followUps.filter(
            (f) =>
              Boolean(f.outcome) &&
              Boolean(f.localChatSessionId) &&
              f.serverSyncStatus !== 'synced' &&
              f.serverSyncStatus !== 'not_applicable'
          )
          .map((f) => f.id);

        await Promise.all(pendingIds.map((id) => get().syncFollowUpOutcome(id)));
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
      onRehydrateStorage: () => (state, error) => {
        if (!error && state) {
          void state.syncPendingOutcomes();
        }
      },
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
