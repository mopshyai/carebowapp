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
  FollowUpStatus,
  createFollowUpIntent,
} from '../types/followUp';
import { scheduleLocalNotification, cancelLocalNotification } from '../utils/notifications';

// ============================================
// STORE TYPES
// ============================================

type FollowUpState = {
  followUps: FollowUpIntent[];
};

type FollowUpActions = {
  // Create follow-up
  scheduleFollowUp: (params: {
    episodeId: string;
    episodeTitle: string;
    daysFromNow: number;
    reasonSnippet: string;
  }) => FollowUpIntent;

  // Update status
  markFollowUpDone: (followUpId: string) => void;
  cancelFollowUp: (followUpId: string) => void;

  // Delete
  deleteFollowUp: (followUpId: string) => void;
  deleteFollowUpsForEpisode: (episodeId: string) => void;

  // Getters
  getFollowUp: (followUpId: string) => FollowUpIntent | undefined;
  getFollowUpsForEpisode: (episodeId: string) => FollowUpIntent[];
  getScheduledFollowUps: () => FollowUpIntent[];
  getUpcomingFollowUps: (limit?: number) => FollowUpIntent[];
  hasScheduledFollowUp: (episodeId: string) => boolean;
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useFollowUpStore = create<FollowUpState & FollowUpActions>()(
  persist(
    (set, get) => ({
      // Initial state
      followUps: [],

      // Schedule a new follow-up
      scheduleFollowUp: ({ episodeId, episodeTitle, daysFromNow, reasonSnippet }) => {
        const followUp = createFollowUpIntent({
          episodeId,
          episodeTitle,
          daysFromNow,
          reasonSnippet,
        });

        // Cancel any existing scheduled follow-up for this episode
        const existing = get().followUps.find(
          (f) => f.episodeId === episodeId && f.status === 'scheduled'
        );
        if (existing) {
          cancelLocalNotification(existing.id);
        }

        set((state) => ({
          followUps: [
            followUp,
            ...state.followUps.filter(
              (f) => !(f.episodeId === episodeId && f.status === 'scheduled')
            ),
          ],
        }));

        // Schedule notification (stub for now)
        scheduleLocalNotification({
          id: followUp.id,
          title: 'CareBow Check-in',
          body: `How are you feeling? Time to check in on: ${episodeTitle}`,
          scheduledAt: new Date(followUp.followUpAt),
        });

        return followUp;
      },

      // Mark as done
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

      // Cancel follow-up
      cancelFollowUp: (followUpId) => {
        set((state) => ({
          followUps: state.followUps.map((f) =>
            f.id === followUpId ? { ...f, status: 'cancelled' as FollowUpStatus } : f
          ),
        }));
        cancelLocalNotification(followUpId);
      },

      // Delete follow-up
      deleteFollowUp: (followUpId) => {
        const followUp = get().followUps.find((f) => f.id === followUpId);
        if (followUp) {
          cancelLocalNotification(followUpId);
        }
        set((state) => ({
          followUps: state.followUps.filter((f) => f.id !== followUpId),
        }));
      },

      // Delete all follow-ups for an episode
      deleteFollowUpsForEpisode: (episodeId) => {
        const toDelete = get().followUps.filter((f) => f.episodeId === episodeId);
        toDelete.forEach((f) => cancelLocalNotification(f.id));

        set((state) => ({
          followUps: state.followUps.filter((f) => f.episodeId !== episodeId),
        }));
      },

      // Getters
      getFollowUp: (followUpId) => {
        return get().followUps.find((f) => f.id === followUpId);
      },

      getFollowUpsForEpisode: (episodeId) => {
        return get().followUps.filter((f) => f.episodeId === episodeId);
      },

      getScheduledFollowUps: () => {
        return get().followUps.filter((f) => f.status === 'scheduled');
      },

      getUpcomingFollowUps: (limit = 5) => {
        return get()
          .followUps.filter((f) => f.status === 'scheduled')
          .sort((a, b) => new Date(a.followUpAt).getTime() - new Date(b.followUpAt).getTime())
          .slice(0, limit);
      },

      hasScheduledFollowUp: (episodeId) => {
        return get().followUps.some(
          (f) => f.episodeId === episodeId && f.status === 'scheduled'
        );
      },
    }),
    {
      name: 'carebow-followups',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// ============================================
// SELECTOR HOOKS
// ============================================

/**
 * FIX: Use `useShallow` (Zustand v5) to compare array contents, not references.
 *
 * ROOT CAUSE: getUpcomingFollowUps/getScheduledFollowUps create new array refs
 * via filter().sort().slice(). Without shallow equality, useSyncExternalStore
 * detects ref inequality → synchronous re-render → infinite loop.
 */

export const useScheduledFollowUps = () =>
  useFollowUpStore(
    useShallow((state) => state.followUps.filter((f) => f.status === 'scheduled'))
  );

export const useUpcomingFollowUps = (limit?: number) =>
  useFollowUpStore(
    useShallow((state) => state.getUpcomingFollowUps(limit))
  );

// Returns boolean (primitive) - no shallow needed
export const useHasScheduledFollowUp = (episodeId: string) =>
  useFollowUpStore((state) => state.hasScheduledFollowUp(episodeId));
