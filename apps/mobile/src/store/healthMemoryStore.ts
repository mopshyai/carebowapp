/**
 * Health Memory Store
 * Zustand store for managing user's health memory (Spotify-like personalization)
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MemoryItem,
  MemoryItemType,
  MemoryItemSource,
  MemoryCandidate,
  MemorySnapshot,
  HealthMemorySettings,
  createMemoryItem,
  memoryItemsToSnapshot,
} from '../types/healthMemory';

// ============================================
// STORE TYPES
// ============================================

type HealthMemoryState = {
  items: MemoryItem[];
  settings: HealthMemorySettings;
  lastSyncedAt: string | null;
  pendingCandidates: MemoryCandidate[];
};

type HealthMemoryActions = {
  // Item management
  addMemoryItem: (
    type: MemoryItemType,
    label: string,
    value: string,
    source: MemoryItemSource,
    forWhom?: 'me' | 'family',
    confidence?: 'high' | 'medium' | 'low',
    extras?: Partial<MemoryItem>
  ) => MemoryItem;

  updateMemoryItem: (id: string, updates: Partial<MemoryItem>) => void;
  deleteMemoryItem: (id: string) => void;
  deleteAllMemory: () => void;

  // Candidate management (from AI responses)
  addPendingCandidate: (candidate: MemoryCandidate) => void;
  addPendingCandidates: (candidates: MemoryCandidate[]) => void;
  saveCandidate: (candidateId: string, sessionId?: string) => void;
  dismissCandidate: (candidateId: string) => void;
  clearPendingCandidates: () => void;

  // Settings
  updateSettings: (settings: Partial<HealthMemorySettings>) => void;
  toggleSaveFullChatHistory: () => void;

  // Getters
  getItemsByType: (type: MemoryItemType) => MemoryItem[];
  getItemsForPerson: (forWhom: 'me' | 'family', familyMemberId?: string) => MemoryItem[];
  getMemorySnapshot: (forWhom?: 'me' | 'family', familyMemberId?: string) => MemorySnapshot;
  hasAnyMemory: () => boolean;
  getMemoryCount: () => number;

  // Import from profile
  importFromProfile: (
    allergies: string[],
    conditions: string[],
    medications: string[],
    forWhom: 'me' | 'family',
    familyMemberId?: string,
    familyMemberName?: string
  ) => void;
};

// ============================================
// INITIAL STATE
// ============================================

const initialSettings: HealthMemorySettings = {
  saveFullChatHistory: false,  // Default OFF for privacy
  autoSaveHighConfidence: false,
  syncWithProfile: true,
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useHealthMemoryStore = create<HealthMemoryState & HealthMemoryActions>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      settings: initialSettings,
      lastSyncedAt: null,
      pendingCandidates: [],

      // Item management
      addMemoryItem: (type, label, value, source, forWhom = 'me', confidence = 'medium', extras) => {
        const item = createMemoryItem(type, label, value, source, forWhom, confidence, extras);

        set((state) => ({
          items: [...state.items, item],
        }));

        return item;
      },

      updateMemoryItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          ),
        }));
      },

      deleteMemoryItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      deleteAllMemory: () => {
        set({
          items: [],
          pendingCandidates: [],
          lastSyncedAt: null,
        });
      },

      // Candidate management
      addPendingCandidate: (candidate) => {
        set((state) => ({
          pendingCandidates: [...state.pendingCandidates, candidate],
        }));
      },

      addPendingCandidates: (candidates) => {
        set((state) => ({
          pendingCandidates: [...state.pendingCandidates, ...candidates],
        }));
      },

      saveCandidate: (candidateId, sessionId) => {
        const state = get();
        const candidate = state.pendingCandidates.find((c) => c.id === candidateId);

        if (!candidate) return;

        // Create memory item from candidate
        const item = createMemoryItem(
          candidate.type,
          candidate.label,
          candidate.value,
          'conversation',
          'me',
          candidate.confidence,
          { sourceSessionId: sessionId }
        );

        set((state) => ({
          items: [...state.items, item],
          pendingCandidates: state.pendingCandidates.filter((c) => c.id !== candidateId),
        }));
      },

      dismissCandidate: (candidateId) => {
        set((state) => ({
          pendingCandidates: state.pendingCandidates.filter((c) => c.id !== candidateId),
        }));
      },

      clearPendingCandidates: () => {
        set({ pendingCandidates: [] });
      },

      // Settings
      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }));
      },

      toggleSaveFullChatHistory: () => {
        set((state) => ({
          settings: {
            ...state.settings,
            saveFullChatHistory: !state.settings.saveFullChatHistory,
          },
        }));
      },

      // Getters
      getItemsByType: (type) => {
        return get().items.filter((item) => item.type === type);
      },

      getItemsForPerson: (forWhom, familyMemberId) => {
        return get().items.filter((item) => {
          if (forWhom === 'me') {
            return item.forWhom === 'me';
          }
          return item.forWhom === 'family' && item.familyMemberId === familyMemberId;
        });
      },

      getMemorySnapshot: (forWhom, familyMemberId) => {
        const items = forWhom
          ? get().getItemsForPerson(forWhom, familyMemberId)
          : get().items;
        return memoryItemsToSnapshot(items);
      },

      hasAnyMemory: () => {
        return get().items.length > 0;
      },

      getMemoryCount: () => {
        return get().items.length;
      },

      // Import from profile
      importFromProfile: (allergies, conditions, medications, forWhom, familyMemberId, familyMemberName) => {
        const now = new Date().toISOString();
        const newItems: MemoryItem[] = [];

        // Add allergies
        allergies.forEach((allergy) => {
          newItems.push(
            createMemoryItem('allergy', 'Allergy', allergy, 'profile_sync', forWhom, 'high', {
              familyMemberId,
              familyMemberName,
            })
          );
        });

        // Add conditions
        conditions.forEach((condition) => {
          newItems.push(
            createMemoryItem('condition', 'Condition', condition, 'profile_sync', forWhom, 'high', {
              familyMemberId,
              familyMemberName,
            })
          );
        });

        // Add medications
        medications.forEach((medication) => {
          newItems.push(
            createMemoryItem('medication', 'Medication', medication, 'profile_sync', forWhom, 'high', {
              familyMemberId,
              familyMemberName,
            })
          );
        });

        set((state) => ({
          items: [...state.items, ...newItems],
          lastSyncedAt: now,
        }));
      },
    }),
    {
      name: 'health-memory-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        items: state.items,
        settings: state.settings,
        lastSyncedAt: state.lastSyncedAt,
        // Don't persist pending candidates
      }),
    }
  )
);

// ============================================
// SELECTOR HOOKS
// ============================================

export const useMemoryItems = () =>
  useHealthMemoryStore((state) => state.items);

export const useMemorySettings = () =>
  useHealthMemoryStore((state) => state.settings);

export const usePendingCandidates = () =>
  useHealthMemoryStore((state) => state.pendingCandidates);

export const useHasAnyMemory = () =>
  useHealthMemoryStore((state) => state.hasAnyMemory());

export const useMemoryCount = () =>
  useHealthMemoryStore((state) => state.getMemoryCount());

export const useAllergies = () =>
  useHealthMemoryStore((state) => state.getItemsByType('allergy'));

export const useConditions = () =>
  useHealthMemoryStore((state) => state.getItemsByType('condition'));

export const useMedications = () =>
  useHealthMemoryStore((state) => state.getItemsByType('medication'));
