/**
 * Safety Store
 * State management for Emergency & Safety feature
 * Uses Zustand with AsyncStorage persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  SafetyEvent,
  SafetySettings,
  SafetyContact,
  SafetyPermissions,
  DEFAULT_SAFETY_SETTINGS,
  createSafetyEvent,
  createSafetyContact,
  SafetyEventType,
  SafetyEventMetadata,
} from '../types';
import { generateId } from '@/types/profile';

// ============================================
// STORE TYPES
// ============================================

type SafetyState = {
  // Safety settings
  settings: SafetySettings;

  // Safety events history
  events: SafetyEvent[];

  // Safety contacts (separate from profile emergency contacts for flexibility)
  contacts: SafetyContact[];

  // Permission states
  permissions: SafetyPermissions;

  // UI state
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
  recordCheckIn: () => SafetyEvent;
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

// ============================================
// HELPER FUNCTIONS
// ============================================

function isSameLocalDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function getTodayStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
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
          events: [event, ...state.events].slice(0, 100), // Keep last 100 events
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
          // If no contacts exist, make this one primary
          isPrimary: get().contacts.length === 0 ? true : contactData.isPrimary,
        });

        // If this contact is primary, unset primary on others
        if (contact.isPrimary) {
          set((state) => ({
            contacts: [
              ...state.contacts.map((c) => ({ ...c, isPrimary: false })),
              contact,
            ],
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

        // If deleted contact was primary and there are remaining contacts,
        // make the first one primary
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

      getPrimaryContact: () => {
        return get().contacts.find((c) => c.isPrimary);
      },

      getContactById: (id) => {
        return get().contacts.find((c) => c.id === id);
      },

      // ========== CHECK-IN ==========
      recordCheckIn: () => {
        const now = new Date().toISOString();
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

        const lastCheckIn = new Date(lastCheckInAt);
        const today = new Date();

        return isSameLocalDay(lastCheckIn, today);
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
    }
  )
);

// ============================================
// SELECTOR HOOKS
// ============================================

export const useSafetySettings = () => useSafetyStore((state) => state.settings);

export const useSafetyContacts = () => useSafetyStore((state) => state.contacts);

// Note: Returns raw events array - consumers should slice if needed
export const useSafetyEvents = () => useSafetyStore((state) => state.events);

export const useSafetyPermissions = () => useSafetyStore((state) => state.permissions);

export const useSOSInProgress = () => useSafetyStore((state) => state.sosInProgress);

export const usePrimaryContact = () =>
  useSafetyStore((state) => state.contacts.find((c) => c.isPrimary));

export const useHasCheckedInToday = () => {
  const lastCheckInAt = useSafetyStore((state) => state.settings.lastCheckInAt);

  if (!lastCheckInAt) return false;

  const lastCheckIn = new Date(lastCheckInAt);
  const today = new Date();

  return isSameLocalDay(lastCheckIn, today);
};

export const useCheckInEnabled = () =>
  useSafetyStore((state) => state.settings.dailyCheckInEnabled);
