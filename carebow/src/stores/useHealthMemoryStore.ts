/**
 * Health Memory Store
 * Persistent storage for health context that builds over time
 *
 * Layer 7: Memory & Continuity from Ask CareBow specification
 * Stores: chronic conditions, medications, allergies, patterns, conversation history
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// TYPES
// ============================================

export type ConditionSource = 'user_reported' | 'conversation_extracted' | 'doctor_confirmed';
export type ConditionSeverity = 'mild' | 'moderate' | 'severe';

export interface HealthCondition {
  id: string;
  condition: string;
  diagnosedDate?: string;
  source: ConditionSource;
  severity?: ConditionSeverity;
  lastMentioned: string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dosage?: string;
  frequency?: string;
  forCondition?: string;
  startDate?: string;
  endDate?: string;
  source: ConditionSource;
  lastMentioned: string;
  instructions?: string;
}

export type AllergySeverity = 'mild' | 'moderate' | 'severe' | 'life_threatening';

export interface Allergy {
  id: string;
  allergen: string;
  reaction?: string;
  severity: AllergySeverity;
  source: ConditionSource;
  discoveredDate?: string;
}

export type HealthEventType = 'symptom' | 'diagnosis' | 'treatment' | 'hospitalization' | 'surgery' | 'test_result';

export interface HealthEvent {
  id: string;
  type: HealthEventType;
  description: string;
  date: string;
  outcome?: string;
  relatedConversationId?: string;
  provider?: string;
  notes?: string;
}

export type PatternFrequency = 'once' | 'occasional' | 'frequent' | 'chronic';

export interface HealthPattern {
  id: string;
  observation: string;
  firstNoticed: string;
  lastNoticed: string;
  frequency: PatternFrequency;
  triggers?: string[];
  relievedBy?: string[];
  relatedSymptoms?: string[];
}

export interface ConversationSummary {
  id: string;
  memberId: string;
  date: string;
  primarySymptom: string;
  urgencyLevel: string;
  outcome?: string;
  recommendedActions: string[];
  serviceBooked?: string;
}

export interface MemoryCandidate {
  id: string;
  type: 'condition' | 'medication' | 'allergy' | 'symptom_pattern' | 'family_history';
  content: string;
  confidence: number;
  extractedFrom: string;
  timestamp: string;
  processed: boolean;
  acceptedByUser?: boolean;
}

// ============================================
// STORE STATE
// ============================================

interface HealthMemoryState {
  // Member-specific health data (keyed by memberId)
  memberHealth: Record<string, {
    conditions: HealthCondition[];
    medications: Medication[];
    allergies: Allergy[];
    recentEvents: HealthEvent[];
    patterns: HealthPattern[];
  }>;

  // Conversation history (last 30 days)
  recentConversations: ConversationSummary[];

  // Pending memory candidates awaiting user confirmation
  memoryCandidates: MemoryCandidate[];

  // Last sync timestamp
  lastSyncAt: string | null;
}

interface HealthMemoryActions {
  // Conditions
  addCondition: (memberId: string, condition: Omit<HealthCondition, 'id' | 'lastMentioned'>) => HealthCondition;
  updateCondition: (memberId: string, conditionId: string, updates: Partial<HealthCondition>) => void;
  removeCondition: (memberId: string, conditionId: string) => void;
  getConditions: (memberId: string) => HealthCondition[];

  // Medications
  addMedication: (memberId: string, medication: Omit<Medication, 'id' | 'lastMentioned'>) => Medication;
  updateMedication: (memberId: string, medicationId: string, updates: Partial<Medication>) => void;
  removeMedication: (memberId: string, medicationId: string) => void;
  getMedications: (memberId: string) => Medication[];

  // Allergies
  addAllergy: (memberId: string, allergy: Omit<Allergy, 'id'>) => Allergy;
  updateAllergy: (memberId: string, allergyId: string, updates: Partial<Allergy>) => void;
  removeAllergy: (memberId: string, allergyId: string) => void;
  getAllergies: (memberId: string) => Allergy[];

  // Health Events
  addHealthEvent: (memberId: string, event: Omit<HealthEvent, 'id'>) => HealthEvent;
  getRecentEvents: (memberId: string, limit?: number) => HealthEvent[];

  // Patterns
  addPattern: (memberId: string, pattern: Omit<HealthPattern, 'id' | 'lastNoticed'>) => HealthPattern;
  updatePattern: (memberId: string, patternId: string, updates: Partial<HealthPattern>) => void;
  getPatterns: (memberId: string) => HealthPattern[];

  // Conversations
  addConversationSummary: (summary: Omit<ConversationSummary, 'id'>) => ConversationSummary;
  getRecentConversations: (memberId: string, days?: number) => ConversationSummary[];
  getConversationById: (conversationId: string) => ConversationSummary | undefined;

  // Memory Candidates
  addMemoryCandidate: (candidate: Omit<MemoryCandidate, 'id' | 'timestamp' | 'processed'>) => MemoryCandidate;
  processMemoryCandidate: (candidateId: string, accepted: boolean) => void;
  getPendingCandidates: () => MemoryCandidate[];

  // Utilities
  getMemberHealthContext: (memberId: string) => {
    conditions: HealthCondition[];
    medications: Medication[];
    allergies: Allergy[];
    recentEvents: HealthEvent[];
    patterns: HealthPattern[];
    recentConversations: ConversationSummary[];
  };
  initializeMemberHealth: (memberId: string) => void;
  clearMemberHealth: (memberId: string) => void;
  resetStore: () => void;
}

// ============================================
// HELPERS
// ============================================

const generateId = () => `hm_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

const getInitialMemberHealth = () => ({
  conditions: [],
  medications: [],
  allergies: [],
  recentEvents: [],
  patterns: [],
});

// ============================================
// INITIAL STATE
// ============================================

const initialState: HealthMemoryState = {
  memberHealth: {},
  recentConversations: [],
  memoryCandidates: [],
  lastSyncAt: null,
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useHealthMemoryStore = create<HealthMemoryState & HealthMemoryActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========== CONDITIONS ==========
      addCondition: (memberId, conditionData) => {
        const condition: HealthCondition = {
          ...conditionData,
          id: generateId(),
          lastMentioned: new Date().toISOString(),
        };

        set((state) => {
          const memberData = state.memberHealth[memberId] || getInitialMemberHealth();
          return {
            memberHealth: {
              ...state.memberHealth,
              [memberId]: {
                ...memberData,
                conditions: [...memberData.conditions, condition],
              },
            },
          };
        });

        return condition;
      },

      updateCondition: (memberId, conditionId, updates) => {
        set((state) => {
          const memberData = state.memberHealth[memberId];
          if (!memberData) return state;

          return {
            memberHealth: {
              ...state.memberHealth,
              [memberId]: {
                ...memberData,
                conditions: memberData.conditions.map((c) =>
                  c.id === conditionId
                    ? { ...c, ...updates, lastMentioned: new Date().toISOString() }
                    : c
                ),
              },
            },
          };
        });
      },

      removeCondition: (memberId, conditionId) => {
        set((state) => {
          const memberData = state.memberHealth[memberId];
          if (!memberData) return state;

          return {
            memberHealth: {
              ...state.memberHealth,
              [memberId]: {
                ...memberData,
                conditions: memberData.conditions.filter((c) => c.id !== conditionId),
              },
            },
          };
        });
      },

      getConditions: (memberId) => {
        return get().memberHealth[memberId]?.conditions || [];
      },

      // ========== MEDICATIONS ==========
      addMedication: (memberId, medicationData) => {
        const medication: Medication = {
          ...medicationData,
          id: generateId(),
          lastMentioned: new Date().toISOString(),
        };

        set((state) => {
          const memberData = state.memberHealth[memberId] || getInitialMemberHealth();
          return {
            memberHealth: {
              ...state.memberHealth,
              [memberId]: {
                ...memberData,
                medications: [...memberData.medications, medication],
              },
            },
          };
        });

        return medication;
      },

      updateMedication: (memberId, medicationId, updates) => {
        set((state) => {
          const memberData = state.memberHealth[memberId];
          if (!memberData) return state;

          return {
            memberHealth: {
              ...state.memberHealth,
              [memberId]: {
                ...memberData,
                medications: memberData.medications.map((m) =>
                  m.id === medicationId
                    ? { ...m, ...updates, lastMentioned: new Date().toISOString() }
                    : m
                ),
              },
            },
          };
        });
      },

      removeMedication: (memberId, medicationId) => {
        set((state) => {
          const memberData = state.memberHealth[memberId];
          if (!memberData) return state;

          return {
            memberHealth: {
              ...state.memberHealth,
              [memberId]: {
                ...memberData,
                medications: memberData.medications.filter((m) => m.id !== medicationId),
              },
            },
          };
        });
      },

      getMedications: (memberId) => {
        return get().memberHealth[memberId]?.medications || [];
      },

      // ========== ALLERGIES ==========
      addAllergy: (memberId, allergyData) => {
        const allergy: Allergy = {
          ...allergyData,
          id: generateId(),
        };

        set((state) => {
          const memberData = state.memberHealth[memberId] || getInitialMemberHealth();
          return {
            memberHealth: {
              ...state.memberHealth,
              [memberId]: {
                ...memberData,
                allergies: [...memberData.allergies, allergy],
              },
            },
          };
        });

        return allergy;
      },

      updateAllergy: (memberId, allergyId, updates) => {
        set((state) => {
          const memberData = state.memberHealth[memberId];
          if (!memberData) return state;

          return {
            memberHealth: {
              ...state.memberHealth,
              [memberId]: {
                ...memberData,
                allergies: memberData.allergies.map((a) =>
                  a.id === allergyId ? { ...a, ...updates } : a
                ),
              },
            },
          };
        });
      },

      removeAllergy: (memberId, allergyId) => {
        set((state) => {
          const memberData = state.memberHealth[memberId];
          if (!memberData) return state;

          return {
            memberHealth: {
              ...state.memberHealth,
              [memberId]: {
                ...memberData,
                allergies: memberData.allergies.filter((a) => a.id !== allergyId),
              },
            },
          };
        });
      },

      getAllergies: (memberId) => {
        return get().memberHealth[memberId]?.allergies || [];
      },

      // ========== HEALTH EVENTS ==========
      addHealthEvent: (memberId, eventData) => {
        const event: HealthEvent = {
          ...eventData,
          id: generateId(),
        };

        set((state) => {
          const memberData = state.memberHealth[memberId] || getInitialMemberHealth();
          const events = [event, ...memberData.recentEvents].slice(0, 50); // Keep last 50 events

          return {
            memberHealth: {
              ...state.memberHealth,
              [memberId]: {
                ...memberData,
                recentEvents: events,
              },
            },
          };
        });

        return event;
      },

      getRecentEvents: (memberId, limit = 10) => {
        return (get().memberHealth[memberId]?.recentEvents || []).slice(0, limit);
      },

      // ========== PATTERNS ==========
      addPattern: (memberId, patternData) => {
        const pattern: HealthPattern = {
          ...patternData,
          id: generateId(),
          lastNoticed: new Date().toISOString(),
        };

        set((state) => {
          const memberData = state.memberHealth[memberId] || getInitialMemberHealth();
          return {
            memberHealth: {
              ...state.memberHealth,
              [memberId]: {
                ...memberData,
                patterns: [...memberData.patterns, pattern],
              },
            },
          };
        });

        return pattern;
      },

      updatePattern: (memberId, patternId, updates) => {
        set((state) => {
          const memberData = state.memberHealth[memberId];
          if (!memberData) return state;

          return {
            memberHealth: {
              ...state.memberHealth,
              [memberId]: {
                ...memberData,
                patterns: memberData.patterns.map((p) =>
                  p.id === patternId
                    ? { ...p, ...updates, lastNoticed: new Date().toISOString() }
                    : p
                ),
              },
            },
          };
        });
      },

      getPatterns: (memberId) => {
        return get().memberHealth[memberId]?.patterns || [];
      },

      // ========== CONVERSATIONS ==========
      addConversationSummary: (summaryData) => {
        const summary: ConversationSummary = {
          ...summaryData,
          id: generateId(),
        };

        set((state) => {
          // Keep last 30 days of conversations
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const recentConversations = [summary, ...state.recentConversations]
            .filter((c) => new Date(c.date) >= thirtyDaysAgo)
            .slice(0, 100); // Max 100 conversations

          return { recentConversations };
        });

        return summary;
      },

      getRecentConversations: (memberId, days = 30) => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return get().recentConversations.filter(
          (c) => c.memberId === memberId && new Date(c.date) >= cutoffDate
        );
      },

      getConversationById: (conversationId) => {
        return get().recentConversations.find((c) => c.id === conversationId);
      },

      // ========== MEMORY CANDIDATES ==========
      addMemoryCandidate: (candidateData) => {
        const candidate: MemoryCandidate = {
          ...candidateData,
          id: generateId(),
          timestamp: new Date().toISOString(),
          processed: false,
        };

        set((state) => ({
          memoryCandidates: [...state.memoryCandidates, candidate],
        }));

        return candidate;
      },

      processMemoryCandidate: (candidateId, accepted) => {
        set((state) => ({
          memoryCandidates: state.memoryCandidates.map((c) =>
            c.id === candidateId
              ? { ...c, processed: true, acceptedByUser: accepted }
              : c
          ),
        }));
      },

      getPendingCandidates: () => {
        return get().memoryCandidates.filter((c) => !c.processed);
      },

      // ========== UTILITIES ==========
      getMemberHealthContext: (memberId) => {
        const memberData = get().memberHealth[memberId] || getInitialMemberHealth();
        const recentConversations = get().getRecentConversations(memberId);

        return {
          ...memberData,
          recentConversations,
        };
      },

      initializeMemberHealth: (memberId) => {
        set((state) => {
          if (state.memberHealth[memberId]) return state;

          return {
            memberHealth: {
              ...state.memberHealth,
              [memberId]: getInitialMemberHealth(),
            },
          };
        });
      },

      clearMemberHealth: (memberId) => {
        set((state) => {
          const { [memberId]: _, ...rest } = state.memberHealth;
          return { memberHealth: rest };
        });
      },

      resetStore: () => {
        set(initialState);
      },
    }),
    {
      name: 'carebow-health-memory',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        memberHealth: state.memberHealth,
        recentConversations: state.recentConversations,
        memoryCandidates: state.memoryCandidates.filter((c) => !c.processed),
        lastSyncAt: state.lastSyncAt,
      }),
    }
  )
);

// ============================================
// SELECTOR HOOKS
// ============================================

export const useHealthConditions = (memberId: string) =>
  useHealthMemoryStore((state) => state.memberHealth[memberId]?.conditions || []);

export const useMedications = (memberId: string) =>
  useHealthMemoryStore((state) => state.memberHealth[memberId]?.medications || []);

export const useAllergies = (memberId: string) =>
  useHealthMemoryStore((state) => state.memberHealth[memberId]?.allergies || []);

export const useHealthPatterns = (memberId: string) =>
  useHealthMemoryStore((state) => state.memberHealth[memberId]?.patterns || []);

export const usePendingMemoryCandidates = () =>
  useHealthMemoryStore((state) => state.memoryCandidates.filter((c) => !c.processed));
