/**
 * Symptom Entry Store (PRD V1 Spec)
 * Zustand store for managing symptom entries with local persistence
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  type SymptomEntry,
  type SymptomDuration,
  type SymptomSeverity,
  generateEntryId,
} from '../types/symptomEntry';
import { performTriage } from '../utils/triageEngine';

// ============================================
// STORE STATE TYPE
// ============================================

interface SymptomEntryState {
  // Data
  entries: SymptomEntry[];
  isLoading: boolean;
  error: string | null;

  // Actions
  addEntry: (
    profileId: string,
    profileName: string,
    profileRelationship: string,
    description: string,
    duration: SymptomDuration,
    severity: SymptomSeverity
  ) => SymptomEntry;
  updateEntry: (id: string, updates: Partial<Pick<SymptomEntry, 'description' | 'duration' | 'severity'>>) => void;
  deleteEntry: (id: string) => void;
  getEntry: (id: string) => SymptomEntry | undefined;
  getEntriesByProfile: (profileId: string) => SymptomEntry[];
  getRecentEntries: (limit?: number) => SymptomEntry[];
  clearAllEntries: () => void;
  setError: (error: string | null) => void;
}

// ============================================
// STORE
// ============================================

export const useSymptomEntryStore = create<SymptomEntryState>()(
  persist(
    (set, get) => ({
      // Initial state
      entries: [],
      isLoading: false,
      error: null,

      // Add new entry
      addEntry: (profileId, profileName, profileRelationship, description, duration, severity) => {
        // Perform triage
        const triageResult = performTriage(description, duration, severity);

        const now = new Date().toISOString();
        const newEntry: SymptomEntry = {
          id: generateEntryId(),
          profileId,
          profileName,
          profileRelationship,
          description,
          duration,
          severity,
          riskLevel: triageResult.riskLevel,
          careSuggestion: triageResult.careSuggestion,
          triageReason: triageResult.reason,
          emergencyKeywordsFound: triageResult.emergencyKeywordsFound,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          entries: [newEntry, ...state.entries],
          error: null,
        }));

        return newEntry;
      },

      // Update existing entry (re-runs triage)
      updateEntry: (id, updates) => {
        set((state) => {
          const entryIndex = state.entries.findIndex((e) => e.id === id);
          if (entryIndex === -1) return state;

          const currentEntry = state.entries[entryIndex];
          const updatedData = {
            description: updates.description ?? currentEntry.description,
            duration: updates.duration ?? currentEntry.duration,
            severity: updates.severity ?? currentEntry.severity,
          };

          // Re-run triage with updated data
          const triageResult = performTriage(
            updatedData.description,
            updatedData.duration,
            updatedData.severity
          );

          const updatedEntry: SymptomEntry = {
            ...currentEntry,
            ...updatedData,
            riskLevel: triageResult.riskLevel,
            careSuggestion: triageResult.careSuggestion,
            triageReason: triageResult.reason,
            emergencyKeywordsFound: triageResult.emergencyKeywordsFound,
            updatedAt: new Date().toISOString(),
          };

          const newEntries = [...state.entries];
          newEntries[entryIndex] = updatedEntry;

          return { entries: newEntries, error: null };
        });
      },

      // Delete entry
      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((e) => e.id !== id),
          error: null,
        }));
      },

      // Get single entry
      getEntry: (id) => {
        return get().entries.find((e) => e.id === id);
      },

      // Get entries for a specific profile
      getEntriesByProfile: (profileId) => {
        return get().entries.filter((e) => e.profileId === profileId);
      },

      // Get recent entries (sorted by date, limited)
      getRecentEntries: (limit = 10) => {
        return get()
          .entries
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, limit);
      },

      // Clear all entries (for testing/reset)
      clearAllEntries: () => {
        set({ entries: [], error: null });
      },

      // Set error
      setError: (error) => {
        set({ error });
      },
    }),
    {
      name: 'carebow-symptom-entries',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        entries: state.entries,
      }),
    }
  )
);

// ============================================
// SELECTORS
// ============================================

export const selectAllEntries = (state: SymptomEntryState) => state.entries;
export const selectRecentEntries = (limit: number) => (state: SymptomEntryState) =>
  state.entries
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
export const selectEntriesByProfile = (profileId: string) => (state: SymptomEntryState) =>
  state.entries.filter((e) => e.profileId === profileId);
export const selectEntryById = (id: string) => (state: SymptomEntryState) =>
  state.entries.find((e) => e.id === id);
export const selectIsLoading = (state: SymptomEntryState) => state.isLoading;
export const selectError = (state: SymptomEntryState) => state.error;
