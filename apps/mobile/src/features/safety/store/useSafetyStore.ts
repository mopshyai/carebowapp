/**
 * Safety Store
 * State management for Emergency & Safety feature
 * Uses Zustand with AsyncStorage persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getDeviceTimeZone, safetyApi } from '@/services/api/endpoints/safety';
import {
  DEFAULT_SAFETY_SETTINGS,
  SafetyContact,
  SafetyEvent,
  SafetyEventMetadata,
  SafetyEventType,
  SafetyPermissions,
  SafetySettings,
  createSafetyContact,
  createSafetyEvent,
} from '../types';

// ============================================
// STORE TYPES
// ============================================

type SafetyState = {
  settings: SafetySettings;
  events: SafetyEvent[];
  contacts: SafetyContact[];
  permissions: SafetyPermissions;
  isLoading: boolean;
  sosInProgress: boolean;
};

type SafetyActions = {
  // Settings
  updateSettings: (updates: Partial<SafetySettings>) => void;
  resetSettings: () => void;

  // Events
  addEvent: (type: SafetyEventType, metadata?: SafetyEventMetadata) => SafetyEvent;
  clearEvents: () => void;
  getRecentEvents: (limit?: number) => SafetyEvent[];

  // Contacts
  addContact: (contact: Omit<SafetyContact, 'id' | 'createdAt' | 'updatedAt'>) => SafetyContact;
  updateContact: (id: string, updates: Partial<SafetyContact>) => void;
  deleteContact: (id: string) => void;
  setPrimaryContact: (id: string) => void;
  getPrimaryContact: () => SafetyContact | undefined;
  getContactById: (id: string) => SafetyContact | undefined;

  // Check-in
  recordCheckIn: () => Promise<SafetyEvent | null>;
  recordMissedCheckIn: () => SafetyEvent;
  hasCheckedInToday: () => boolean;
  getLastCheckInTime: () => Date | null;

  // SOS
  triggerSOS: (metadata?: SafetyEventMetadata) => SafetyEvent;
  setSOSInProgress: (inProgress: boolean) => void;

  // Permissions
  updatePermissions: (updates: Partial<SafetyPermissions>) => void;

  // Utils
  setLoading: (loading: boolean) => void;
  resetStore: () => void;
};

// ============================================
// INITIAL STATE
// ============================================

const initialState: SafetyState = {
  settings: DEFAULT_SAFETY_SETTINGS,
  events: [],
  contacts: [],
  permissions: {
    location: 'undetermined',
    notifications: 'undetermined',
  },
  isLoading: false,
  sosInProgress: false,
};

function isSameLocalDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useSafetyStore = create<SafetyState & SafetyActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========== SETTINGS ==========
      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      resetSettings: () => {
        set({ settings: DEFAULT_SAFETY_SETTINGS });
      },

      // ========== EVENTS ==========
      addEvent: (type, metadata = {}) => {
        const event = createSafetyEvent(type, 'guest', metadata);
        set((state) => ({
          events: [event, ...state.events].slice(0, 100),
        }));
        return event;
      },

      clearEvents: () => {
        set({ events: [] });
      },

      getRecentEvents: (limit = 10) => {
        return get().events.slice(0, limit);
      },

      // ========== CONTACTS ==========
      addContact: (contactData) => {
        const contact = createSafetyContact({
          ...contactData,
          isPrimary: get().contacts.length === 0 ? true : contactData.isPrimary,
        });

        if (contact.isPrimary) {
          set((state) => ({
            contacts: [...state.contacts.map((c) => ({ ...c, isPrimary: false })), contact],
          }));
        } else {
          set((state) => ({
            contacts: [...state.contacts, contact],
          }));
        }

        return contact;
      },

      updateContact: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          contacts: state.contacts.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: now } : c
          ),
        }));
      },

      deleteContact: (id) => {
        const contacts = get().contacts;
        const deletedContact = contacts.find((c) => c.id === id);
        const remainingContacts = contacts.filter((c) => c.id !== id);

        if (deletedContact?.isPrimary && remainingContacts.length > 0) {
          remainingContacts[0].isPrimary = true;
        }

        set({ contacts: remainingContacts });
      },

      setPrimaryContact: (id) => {
        set((state) => ({
          contacts: state.contacts.map((c) => ({
            ...c,
            isPrimary: c.id === id,
            updatedAt: c.id === id ? new Date().toISOString() : c.updatedAt,
          })),
        }));
      },

      getPrimaryContact: () => get().contacts.find((c) => c.isPrimary),
      getContactById: (id) => get().contacts.find((c) => c.id === id),

      // ========== CHECK-IN ==========
      recordCheckIn: async () => {
        // A local green check without backend confirmation is dangerous: the
        // server could still mark the person MISSED and alert family. Only
        // record success locally after the JWT endpoint accepts "I'm OK".
        const response = await safetyApi.completeDailyCheckIn();
        if (!response?.success || !response.checkIn) {
          return null;
        }

        const now = response.checkIn.checkedInAt ?? new Date().toISOString();
        const state = get();
        const wasLate = Boolean(
          state.settings.lastMissedCheckInAt &&
          isSameLocalDay(new Date(state.settings.lastMissedCheckInAt), new Date())
        );
        const event = createSafetyEvent('CHECKIN_CONFIRMED', 'guest', { wasLate });

        set((s) => ({
          events: [event, ...s.events].slice(0, 100),
          settings: {
            ...s.settings,
            lastCheckInAt: now,
          },
        }));

        return event;
      },

      recordMissedCheckIn: () => {
        const now = new Date().toISOString();
        const event = createSafetyEvent('CHECKIN_MISSED', 'guest', {});

        set((s) => ({
          events: [event, ...s.events].slice(0, 100),
          settings: {
            ...s.settings,
            lastMissedCheckInAt: now,
          },
        }));

        return event;
      },

      hasCheckedInToday: () => {
        const { lastCheckInAt } = get().settings;
        if (!lastCheckInAt) return false;
        return isSameLocalDay(new Date(lastCheckInAt), new Date());
      },

      getLastCheckInTime: () => {
        const { lastCheckInAt } = get().settings;
        if (!lastCheckInAt) return null;
        return new Date(lastCheckInAt);
      },

      // ========== SOS ==========
      triggerSOS: (metadata = {}) => {
        const event = createSafetyEvent('SOS_TRIGGERED', 'guest', metadata);

        set((s) => ({
          events: [event, ...s.events].slice(0, 100),
          sosInProgress: false,
        }));

        return event;
      },

      setSOSInProgress: (inProgress) => {
        set({ sosInProgress: inProgress });
      },

      // ========== PERMISSIONS ==========
      updatePermissions: (updates) => {
        set((state) => ({
          permissions: { ...state.permissions, ...updates },
        }));
      },

      // ========== UTILS ==========
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      resetStore: () => {
        set(initialState);
      },
    }),
    {
      name: 'carebow-safety-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        events: state.events,
        contacts: state.contacts,
        permissions: state.permissions,
      }),
      onRehydrateStorage: () => (state) => {
        // Migrate users from the old local-only build. Re-sending the schedule
        // is idempotent and ensures the backend knows about an already-enabled
        // check-in without requiring the user to toggle the setting off/on.
        const settings = state?.settings;
        if (!settings?.dailyCheckInEnabled) return;
        void safetyApi.updateDailyCheckIn({
          enabled: true,
          time: settings.dailyCheckInTime,
          gracePeriodMinutes: settings.gracePeriodMinutes,
          timezone: getDeviceTimeZone(),
        });
      },
    }
  )
);

// ============================================
// SELECTOR HOOKS
// ============================================

export const useSafetySettings = () => useSafetyStore((state) => state.settings);
export const useSafetyContacts = () => useSafetyStore((state) => state.contacts);
export const useSafetyEvents = () => useSafetyStore((state) => state.events);
export const useSafetyPermissions = () => useSafetyStore((state) => state.permissions);
export const useSOSInProgress = () => useSafetyStore((state) => state.sosInProgress);
export const usePrimaryContact = () =>
  useSafetyStore((state) => state.contacts.find((c) => c.isPrimary));

export const useHasCheckedInToday = () => {
  const lastCheckInAt = useSafetyStore((state) => state.settings.lastCheckInAt);
  if (!lastCheckInAt) return false;
  return isSameLocalDay(new Date(lastCheckInAt), new Date());
};

export const useCheckInEnabled = () =>
  useSafetyStore((state) => state.settings.dailyCheckInEnabled);
