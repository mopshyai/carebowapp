/**
 * Ask CareBow Session Store
 * State management for the AI Health Assistant conversation
 *
 * Manages: conversation state, messages, triage results, service routing
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Message,
  HealthContext,
  UrgencyLevel,
  ConversationPhase,
  ConversationState,
  GuidanceResponse,
  SuggestedAction,
  MemberProfile,
  createEmptyHealthContext,
  generateSessionId,
  generateMessageId,
} from '@/types/askCarebow';

// ============================================
// TYPES
// ============================================

export type TriageLevel = 'self_care' | 'monitor' | 'consult' | 'urgent' | 'emergency';

export interface TriageResult {
  level: TriageLevel;
  urgencyLevel: UrgencyLevel;
  confidence: number;
  reasoning: string[];
  redFlagsDetected: string[];
  riskFactors: string[];
  ageModifierApplied: number;
  timeframe: string;
  displayTitle: string;
  displayDescription: string;
  displayColor: string;
  escalationTriggers: string[];
}

export interface EmergencyState {
  isEmergency: boolean;
  type: 'P1_EMERGENCY' | 'P2_URGENT' | 'SAFE';
  matchedPatterns: string[];
  immediateAction?: string;
  showAlert: boolean;
}

export interface ServiceRecommendation {
  serviceId: string;
  serviceName: string;
  hindiName?: string;
  price: string;
  description: string;
  reason: string;
  priority: number;
  availability: string;
  cta: string;
}

// ============================================
// STORE STATE
// ============================================

interface AskCareBowState {
  // Session
  sessionId: string | null;
  isActive: boolean;
  startedAt: string | null;

  // Context
  selectedMemberId: string | null;
  memberProfile: MemberProfile | null;

  // Conversation
  messages: Message[];
  conversationPhase: ConversationPhase;
  conversationState: ConversationState;

  // Health Context (collected during conversation)
  healthContext: HealthContext;

  // Emergency State
  emergencyState: EmergencyState;

  // Triage Result
  triageResult: TriageResult | null;

  // Guidance
  guidance: GuidanceResponse | null;
  suggestedActions: SuggestedAction[];

  // Service Recommendations
  serviceRecommendations: ServiceRecommendation[];

  // UI State
  isLoading: boolean;
  isTyping: boolean;
  error: string | null;

  // Follow-up
  followUpScheduled: boolean;
  followUpTime: string | null;
}

interface AskCareBowActions {
  // Session Management
  startSession: (memberId: string, memberProfile: MemberProfile) => void;
  endSession: () => void;
  resetSession: () => void;

  // Messages
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => Message;
  addUserMessage: (text: string) => Message;
  addAssistantMessage: (text: string, extras?: Partial<Message>) => Message;
  clearMessages: () => void;

  // Conversation Flow
  setConversationPhase: (phase: ConversationPhase) => void;
  updateConversationState: (updates: Partial<ConversationState>) => void;

  // Health Context
  updateHealthContext: (updates: Partial<HealthContext>) => void;
  setHealthContext: (context: HealthContext) => void;

  // Emergency
  setEmergencyState: (state: EmergencyState) => void;
  clearEmergencyAlert: () => void;

  // Triage
  setTriageResult: (result: TriageResult) => void;

  // Guidance
  setGuidance: (guidance: GuidanceResponse) => void;
  setSuggestedActions: (actions: SuggestedAction[]) => void;

  // Services
  setServiceRecommendations: (recommendations: ServiceRecommendation[]) => void;

  // UI State
  setLoading: (loading: boolean) => void;
  setTyping: (typing: boolean) => void;
  setError: (error: string | null) => void;

  // Follow-up
  scheduleFollowUp: (time: string) => void;
  cancelFollowUp: () => void;

  // Selectors
  getSessionDuration: () => number;
  hasActiveSession: () => boolean;
}

// ============================================
// INITIAL STATE
// ============================================

const initialConversationState: ConversationState = {
  phase: 'initial',
  questionsAsked: [],
  questionsRemaining: [],
  healthContext: createEmptyHealthContext(),
  hasProvidedGuidance: false,
};

const initialEmergencyState: EmergencyState = {
  isEmergency: false,
  type: 'SAFE',
  matchedPatterns: [],
  showAlert: false,
};

const initialState: AskCareBowState = {
  sessionId: null,
  isActive: false,
  startedAt: null,
  selectedMemberId: null,
  memberProfile: null,
  messages: [],
  conversationPhase: 'initial',
  conversationState: initialConversationState,
  healthContext: createEmptyHealthContext(),
  emergencyState: initialEmergencyState,
  triageResult: null,
  guidance: null,
  suggestedActions: [],
  serviceRecommendations: [],
  isLoading: false,
  isTyping: false,
  error: null,
  followUpScheduled: false,
  followUpTime: null,
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useAskCareBowStore = create<AskCareBowState & AskCareBowActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========== SESSION MANAGEMENT ==========
      startSession: (memberId, memberProfile) => {
        set({
          sessionId: generateSessionId(),
          isActive: true,
          startedAt: new Date().toISOString(),
          selectedMemberId: memberId,
          memberProfile,
          messages: [],
          conversationPhase: 'initial',
          conversationState: initialConversationState,
          healthContext: createEmptyHealthContext(),
          emergencyState: initialEmergencyState,
          triageResult: null,
          guidance: null,
          suggestedActions: [],
          serviceRecommendations: [],
          error: null,
        });
      },

      endSession: () => {
        set({
          isActive: false,
          conversationPhase: 'completed',
        });
      },

      resetSession: () => {
        set(initialState);
      },

      // ========== MESSAGES ==========
      addMessage: (messageData) => {
        const message: Message = {
          ...messageData,
          id: generateMessageId(),
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          messages: [...state.messages, message],
        }));

        return message;
      },

      addUserMessage: (text) => {
        return get().addMessage({
          role: 'user',
          contentType: 'text',
          text,
        });
      },

      addAssistantMessage: (text, extras = {}) => {
        return get().addMessage({
          role: 'assistant',
          contentType: 'text',
          text,
          ...extras,
        });
      },

      clearMessages: () => {
        set({ messages: [] });
      },

      // ========== CONVERSATION FLOW ==========
      setConversationPhase: (phase) => {
        set({ conversationPhase: phase });
      },

      updateConversationState: (updates) => {
        set((state) => ({
          conversationState: {
            ...state.conversationState,
            ...updates,
          },
        }));
      },

      // ========== HEALTH CONTEXT ==========
      updateHealthContext: (updates) => {
        set((state) => ({
          healthContext: {
            ...state.healthContext,
            ...updates,
          },
        }));
      },

      setHealthContext: (context) => {
        set({ healthContext: context });
      },

      // ========== EMERGENCY ==========
      setEmergencyState: (emergencyState) => {
        set({ emergencyState });
      },

      clearEmergencyAlert: () => {
        set((state) => ({
          emergencyState: {
            ...state.emergencyState,
            showAlert: false,
          },
        }));
      },

      // ========== TRIAGE ==========
      setTriageResult: (result) => {
        set({ triageResult: result });
      },

      // ========== GUIDANCE ==========
      setGuidance: (guidance) => {
        set({ guidance });
      },

      setSuggestedActions: (actions) => {
        set({ suggestedActions: actions });
      },

      // ========== SERVICES ==========
      setServiceRecommendations: (recommendations) => {
        set({ serviceRecommendations: recommendations });
      },

      // ========== UI STATE ==========
      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      setTyping: (typing) => {
        set({ isTyping: typing });
      },

      setError: (error) => {
        set({ error });
      },

      // ========== FOLLOW-UP ==========
      scheduleFollowUp: (time) => {
        set({
          followUpScheduled: true,
          followUpTime: time,
        });
      },

      cancelFollowUp: () => {
        set({
          followUpScheduled: false,
          followUpTime: null,
        });
      },

      // ========== SELECTORS ==========
      getSessionDuration: () => {
        const { startedAt } = get();
        if (!startedAt) return 0;
        return Date.now() - new Date(startedAt).getTime();
      },

      hasActiveSession: () => {
        return get().isActive && get().sessionId !== null;
      },
    }),
    {
      name: 'carebow-ask-session',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist essential data, not UI state
      partialize: (state) => ({
        sessionId: state.sessionId,
        isActive: state.isActive,
        startedAt: state.startedAt,
        selectedMemberId: state.selectedMemberId,
        messages: state.messages.slice(-50), // Keep last 50 messages
        conversationPhase: state.conversationPhase,
        healthContext: state.healthContext,
        triageResult: state.triageResult,
        followUpScheduled: state.followUpScheduled,
        followUpTime: state.followUpTime,
      }),
    }
  )
);

// ============================================
// SELECTOR HOOKS
// ============================================

export const useMessages = () =>
  useAskCareBowStore((state) => state.messages);

export const useConversationPhase = () =>
  useAskCareBowStore((state) => state.conversationPhase);

export const useHealthContext = () =>
  useAskCareBowStore((state) => state.healthContext);

export const useEmergencyState = () =>
  useAskCareBowStore((state) => state.emergencyState);

export const useTriageResult = () =>
  useAskCareBowStore((state) => state.triageResult);

export const useGuidance = () =>
  useAskCareBowStore((state) => state.guidance);

export const useServiceRecommendations = () =>
  useAskCareBowStore((state) => state.serviceRecommendations);

export const useIsTyping = () =>
  useAskCareBowStore((state) => state.isTyping);

export const useIsLoading = () =>
  useAskCareBowStore((state) => state.isLoading);

export const useSelectedMember = () =>
  useAskCareBowStore((state) => ({
    memberId: state.selectedMemberId,
    profile: state.memberProfile,
  }));
