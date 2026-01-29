/**
 * Ask CareBow Store
 * Zustand store for AI Health Assistant state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AskCarebowSession,
  Message,
  HealthContext,
  ConversationState,
  ConversationPhase,
  UrgencyLevel,
  ServiceRecommendation,
  FollowUpQuestionType,
  SessionFeedback,
  SessionSummary,
  generateSessionId,
  createEmptyHealthContext,
  createMessage,
  generateSessionSummary,
  formatSessionForDoctorNotes,
  formatSessionForExport,
} from '@/types/askCarebow';

// ============================================
// STORE TYPES
// ============================================

// ============================================
// TRIAL SYSTEM TYPES
// ============================================

type TrialState = {
  trialStartDate: string | null;  // ISO date - set when user clicks "Start Trial"
  trialEndDate: string | null;    // ISO date (startDate + 3 days)
  hasUsedTrial: boolean;          // true once trial started (can't restart)
};

type AskCarebowState = {
  // Current active session
  currentSession: AskCarebowSession | null;

  // Session history
  sessions: AskCarebowSession[];

  // UI State
  isTyping: boolean;
  isProcessing: boolean;

  // Subscription state (simplified - would connect to real subscription service)
  hasSubscription: boolean;
  freeQuestionsUsed: number;
  maxFreeQuestions: number;

  // Trial state
  trial: TrialState;
};

type AskCarebowActions = {
  // Session management
  startNewSession: (userId: string, memberId: string, memberName?: string) => AskCarebowSession;
  endSession: () => void;
  resumeSession: (sessionId: string) => void;

  // Message handling
  addUserMessage: (text: string) => void;
  addAssistantMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;

  // Conversation state
  updateConversationPhase: (phase: ConversationPhase) => void;
  markQuestionAsked: (questionType: FollowUpQuestionType) => void;
  setCurrentQuestion: (questionType: FollowUpQuestionType | null) => void;

  // Health context
  updateHealthContext: (updates: Partial<HealthContext>) => void;
  addAssociatedSymptom: (symptom: string) => void;
  addRiskFactor: (factor: string) => void;
  addChronicCondition: (condition: string) => void;

  // Assessment
  setUrgencyLevel: (level: UrgencyLevel) => void;
  addServiceRecommendation: (recommendation: ServiceRecommendation) => void;
  markGuidanceProvided: () => void;

  // Feedback
  provideFeedback: (rating: 1 | 2 | 3 | 4 | 5) => void;

  // UI State
  setIsTyping: (isTyping: boolean) => void;
  setIsProcessing: (isProcessing: boolean) => void;

  // Subscription
  setHasSubscription: (has: boolean) => void;
  incrementFreeQuestions: () => void;
  canAskQuestion: () => boolean;

  // Trial system
  startTrial: () => void;
  isTrialActive: () => boolean;
  getTrialDaysRemaining: () => number;
  canAccessPremiumFeatures: () => boolean;

  // Enhanced session logging
  finalizeSession: () => void;
  provideDetailedFeedback: (feedback: Omit<SessionFeedback, 'feedbackTimestamp'>) => void;
  linkOrderToSession: (orderId: string) => void;
  linkRequestToSession: (requestId: string) => void;
  scheduleFollowUp: (scheduledFor: string, reminderId?: string) => void;
  cancelFollowUp: () => void;
  markDoctorNotesSent: (recipient: string) => void;
  exportSession: (format: 'pdf' | 'text' | 'json', destination: 'email' | 'share' | 'download') => void;
  getSessionExportText: (sessionId?: string) => string | null;
  getSessionExportJson: (sessionId?: string) => object | null;
  setRiskLevel: (level: 'low' | 'moderate' | 'high' | 'critical') => void;
  setTriggeredEmergencyFlow: (triggered: boolean) => void;
  addDetectedSymptom: (symptom: string) => void;

  // Cleanup
  clearCurrentSession: () => void;
  clearAllSessions: () => void;

  // Getters
  getSessionById: (id: string) => AskCarebowSession | undefined;
  getSessionsForMember: (memberId: string) => AskCarebowSession[];
  getRecentSessions: (limit?: number) => AskCarebowSession[];
  getSessionsWithFeedback: () => AskCarebowSession[];
  getEmergencySessions: () => AskCarebowSession[];
};

// ============================================
// INITIAL STATE
// ============================================

const createInitialConversationState = (): ConversationState => ({
  phase: 'initial',
  questionsAsked: [],
  questionsRemaining: [
    'duration',
    'severity',
    'frequency',
    'associated_symptoms',
    'recent_events',
  ],
  healthContext: createEmptyHealthContext(),
  hasProvidedGuidance: false,
});

const createNewSession = (
  userId: string,
  memberId: string,
  memberName?: string
): AskCarebowSession => {
  const now = new Date().toISOString();
  return {
    id: generateSessionId(),
    userId,
    memberId,
    memberName,
    messages: [],
    conversationState: createInitialConversationState(),
    healthContext: createEmptyHealthContext(),
    recommendedServices: [],
    createdAt: now,
    updatedAt: now,
    isActive: true,
    // Traceability fields
    detectedSymptoms: [],
    suggestedActions: [],
  };
};

// ============================================
// STORE IMPLEMENTATION
// ============================================

export const useAskCarebowStore = create<AskCarebowState & AskCarebowActions>()(
  persist(
    (set, get) => ({
      // Initial state
      currentSession: null,
      sessions: [],
      isTyping: false,
      isProcessing: false,
      hasSubscription: false,
      freeQuestionsUsed: 0,
      maxFreeQuestions: 3,
      trial: {
        trialStartDate: null,
        trialEndDate: null,
        hasUsedTrial: false,
      },

      // Session management
      startNewSession: (userId, memberId, memberName) => {
        const session = createNewSession(userId, memberId, memberName);

        // Add opening message
        const openingMessage = createMessage(
          'assistant',
          "Hello, I'm here to help you understand your health concerns. Tell me what's going on - you can describe any symptoms, concerns, or how you're feeling.",
          'text'
        );
        session.messages.push(openingMessage);

        set((state) => ({
          currentSession: session,
          sessions: [session, ...state.sessions],
        }));

        return session;
      },

      endSession: () => {
        set((state) => {
          if (!state.currentSession) return state;

          const updatedSession = {
            ...state.currentSession,
            isActive: false,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: null,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      resumeSession: (sessionId) => {
        const session = get().sessions.find((s) => s.id === sessionId);
        if (session) {
          set({ currentSession: { ...session, isActive: true } });
        }
      },

      // Message handling
      addUserMessage: (text) => {
        set((state) => {
          if (!state.currentSession) return state;

          const message = createMessage('user', text, 'text');
          const updatedSession = {
            ...state.currentSession,
            messages: [...state.currentSession.messages, message],
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      addAssistantMessage: (messageData) => {
        set((state) => {
          if (!state.currentSession) return state;

          const message: Message = {
            ...messageData,
            id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            timestamp: new Date().toISOString(),
          };

          const updatedSession = {
            ...state.currentSession,
            messages: [...state.currentSession.messages, message],
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      // Conversation state
      updateConversationPhase: (phase) => {
        set((state) => {
          if (!state.currentSession) return state;

          const updatedSession = {
            ...state.currentSession,
            conversationState: {
              ...state.currentSession.conversationState,
              phase,
            },
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      markQuestionAsked: (questionType) => {
        set((state) => {
          if (!state.currentSession) return state;

          const { questionsAsked, questionsRemaining } = state.currentSession.conversationState;

          const updatedSession = {
            ...state.currentSession,
            conversationState: {
              ...state.currentSession.conversationState,
              questionsAsked: [...questionsAsked, questionType],
              questionsRemaining: questionsRemaining.filter((q) => q !== questionType),
            },
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      setCurrentQuestion: (questionType) => {
        set((state) => {
          if (!state.currentSession) return state;

          const updatedSession = {
            ...state.currentSession,
            conversationState: {
              ...state.currentSession.conversationState,
              currentQuestion: questionType ? { type: questionType } as any : undefined,
            },
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      // Health context
      updateHealthContext: (updates) => {
        set((state) => {
          if (!state.currentSession) return state;

          const updatedSession = {
            ...state.currentSession,
            healthContext: {
              ...state.currentSession.healthContext,
              ...updates,
            },
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      addAssociatedSymptom: (symptom) => {
        set((state) => {
          if (!state.currentSession) return state;

          const currentSymptoms = state.currentSession.healthContext.associatedSymptoms;
          if (currentSymptoms.includes(symptom)) return state;

          const updatedSession = {
            ...state.currentSession,
            healthContext: {
              ...state.currentSession.healthContext,
              associatedSymptoms: [...currentSymptoms, symptom],
            },
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      addRiskFactor: (factor) => {
        set((state) => {
          if (!state.currentSession) return state;

          const currentFactors = state.currentSession.healthContext.riskFactors;
          if (currentFactors.includes(factor)) return state;

          const updatedSession = {
            ...state.currentSession,
            healthContext: {
              ...state.currentSession.healthContext,
              riskFactors: [...currentFactors, factor],
            },
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      addChronicCondition: (condition) => {
        set((state) => {
          if (!state.currentSession) return state;

          const currentConditions = state.currentSession.healthContext.chronicConditions;
          if (currentConditions.includes(condition)) return state;

          const updatedSession = {
            ...state.currentSession,
            healthContext: {
              ...state.currentSession.healthContext,
              chronicConditions: [...currentConditions, condition],
            },
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      // Assessment
      setUrgencyLevel: (level) => {
        set((state) => {
          if (!state.currentSession) return state;

          const updatedSession = {
            ...state.currentSession,
            urgencyLevel: level,
            conversationState: {
              ...state.currentSession.conversationState,
              urgencyLevel: level,
            },
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      addServiceRecommendation: (recommendation) => {
        set((state) => {
          if (!state.currentSession) return state;

          const updatedSession = {
            ...state.currentSession,
            recommendedServices: [
              ...state.currentSession.recommendedServices,
              recommendation,
            ],
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      markGuidanceProvided: () => {
        set((state) => {
          if (!state.currentSession) return state;

          const updatedSession = {
            ...state.currentSession,
            conversationState: {
              ...state.currentSession.conversationState,
              hasProvidedGuidance: true,
              phase: 'guidance' as ConversationPhase,
            },
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      // Feedback
      provideFeedback: (rating) => {
        set((state) => {
          if (!state.currentSession) return state;

          const updatedSession = {
            ...state.currentSession,
            feedbackProvided: true,
            feedbackRating: rating,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      // UI State
      setIsTyping: (isTyping) => set({ isTyping }),
      setIsProcessing: (isProcessing) => set({ isProcessing }),

      // Subscription
      setHasSubscription: (has) => set({ hasSubscription: has }),

      incrementFreeQuestions: () => {
        set((state) => ({
          freeQuestionsUsed: state.freeQuestionsUsed + 1,
        }));
      },

      canAskQuestion: () => {
        const state = get();
        if (state.hasSubscription) return true;
        // Also allow during active trial
        if (get().isTrialActive()) return true;
        // Allow if trial hasn't been used yet (will be auto-started on first message)
        if (!state.trial.hasUsedTrial && !state.trial.trialStartDate) {
          return true;
        }
        // Fallback to free questions limit after trial expires
        return state.freeQuestionsUsed < state.maxFreeQuestions;
      },

      // Trial system
      startTrial: () => {
        const state = get();
        // Can't restart trial if already used
        if (state.trial.hasUsedTrial) return;

        const now = new Date();
        const endDate = new Date(now);
        endDate.setDate(endDate.getDate() + 3); // 3 days from now

        set({
          trial: {
            trialStartDate: now.toISOString(),
            trialEndDate: endDate.toISOString(),
            hasUsedTrial: true,
          },
        });
      },

      isTrialActive: () => {
        const state = get();
        if (!state.trial.trialStartDate || !state.trial.trialEndDate) {
          return false;
        }

        const now = new Date();
        const endDate = new Date(state.trial.trialEndDate);
        return now < endDate;
      },

      getTrialDaysRemaining: () => {
        const state = get();
        if (!state.trial.trialEndDate) return 0;

        const now = new Date();
        const endDate = new Date(state.trial.trialEndDate);

        if (now >= endDate) return 0;

        const diffMs = endDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
      },

      canAccessPremiumFeatures: () => {
        const state = get();
        return state.hasSubscription || get().isTrialActive();
      },

      // Enhanced session logging
      finalizeSession: () => {
        set((state) => {
          if (!state.currentSession) return state;

          // Generate session summary
          const sessionSummary = generateSessionSummary(state.currentSession);

          const updatedSession = {
            ...state.currentSession,
            sessionSummary,
            isActive: false,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: null,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      provideDetailedFeedback: (feedback) => {
        set((state) => {
          if (!state.currentSession) return state;

          const fullFeedback: SessionFeedback = {
            ...feedback,
            feedbackTimestamp: new Date().toISOString(),
          };

          const updatedSession = {
            ...state.currentSession,
            feedback: fullFeedback,
            feedbackProvided: true,
            feedbackRating: feedback.rating,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      linkOrderToSession: (orderId) => {
        set((state) => {
          if (!state.currentSession) return state;

          const updatedSession = {
            ...state.currentSession,
            linkedOrderId: orderId,
            updatedAt: new Date().toISOString(),
          };

          // Also update session summary if exists
          if (updatedSession.sessionSummary) {
            updatedSession.sessionSummary = {
              ...updatedSession.sessionSummary,
              actualActionTaken: `Booked service (Order: ${orderId})`,
            };
          }

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      linkRequestToSession: (requestId) => {
        set((state) => {
          if (!state.currentSession) return state;

          const updatedSession = {
            ...state.currentSession,
            linkedRequestId: requestId,
            updatedAt: new Date().toISOString(),
          };

          // Also update session summary if exists
          if (updatedSession.sessionSummary) {
            updatedSession.sessionSummary = {
              ...updatedSession.sessionSummary,
              actualActionTaken: `Submitted service request (Request: ${requestId})`,
            };
          }

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      scheduleFollowUp: (scheduledFor, reminderId) => {
        set((state) => {
          if (!state.currentSession) return state;

          const updatedSession = {
            ...state.currentSession,
            followUpScheduled: true,
            followUpScheduledFor: scheduledFor,
            followUpReminderId: reminderId,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      cancelFollowUp: () => {
        set((state) => {
          if (!state.currentSession) return state;

          const updatedSession = {
            ...state.currentSession,
            followUpScheduled: false,
            followUpScheduledFor: undefined,
            followUpReminderId: undefined,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      markDoctorNotesSent: (recipient) => {
        set((state) => {
          if (!state.currentSession) return state;

          const updatedSession = {
            ...state.currentSession,
            doctorNotesSent: true,
            doctorNotesSentAt: new Date().toISOString(),
            doctorNotesRecipient: recipient,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      exportSession: (format, destination) => {
        set((state) => {
          if (!state.currentSession) return state;

          const exportEntry = {
            exportedAt: new Date().toISOString(),
            exportFormat: format,
            exportedTo: destination,
          };

          const updatedSession = {
            ...state.currentSession,
            exportHistory: [
              ...(state.currentSession.exportHistory || []),
              exportEntry,
            ],
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      getSessionExportText: (sessionId) => {
        const state = get();
        const session = sessionId
          ? state.sessions.find((s) => s.id === sessionId)
          : state.currentSession;

        if (!session) return null;
        return formatSessionForDoctorNotes(session);
      },

      getSessionExportJson: (sessionId) => {
        const state = get();
        const session = sessionId
          ? state.sessions.find((s) => s.id === sessionId)
          : state.currentSession;

        if (!session) return null;
        return formatSessionForExport(session);
      },

      setRiskLevel: (level) => {
        set((state) => {
          if (!state.currentSession) return state;

          const updatedSession = {
            ...state.currentSession,
            riskLevel: level,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      setTriggeredEmergencyFlow: (triggered) => {
        set((state) => {
          if (!state.currentSession) return state;

          const updatedSession = {
            ...state.currentSession,
            triggeredEmergencyFlow: triggered,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      addDetectedSymptom: (symptom) => {
        set((state) => {
          if (!state.currentSession) return state;

          const currentSymptoms = state.currentSession.detectedSymptoms || [];
          if (currentSymptoms.includes(symptom)) return state;

          const updatedSession = {
            ...state.currentSession,
            detectedSymptoms: [...currentSymptoms, symptom],
            updatedAt: new Date().toISOString(),
          };

          return {
            currentSession: updatedSession,
            sessions: state.sessions.map((s) =>
              s.id === updatedSession.id ? updatedSession : s
            ),
          };
        });
      },

      // Cleanup
      clearCurrentSession: () => set({ currentSession: null }),

      clearAllSessions: () => set({ sessions: [], currentSession: null }),

      // Getters
      getSessionById: (id) => {
        return get().sessions.find((s) => s.id === id);
      },

      getSessionsForMember: (memberId) => {
        return get().sessions.filter((s) => s.memberId === memberId);
      },

      getRecentSessions: (limit = 10) => {
        return get().sessions.slice(0, limit);
      },

      getSessionsWithFeedback: () => {
        return get().sessions.filter((s) => s.feedbackProvided);
      },

      getEmergencySessions: () => {
        return get().sessions.filter((s) => s.triggeredEmergencyFlow);
      },
    }),
    {
      name: 'ask-carebow-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        freeQuestionsUsed: state.freeQuestionsUsed,
        hasSubscription: state.hasSubscription,
        trial: state.trial,
      }),
    }
  )
);

// ============================================
// SELECTOR HOOKS
// ============================================

export const useCurrentSession = () =>
  useAskCarebowStore((state) => state.currentSession);

export const useMessages = () =>
  useAskCarebowStore((state) => state.currentSession?.messages ?? []);

export const useHealthContext = () =>
  useAskCarebowStore((state) => state.currentSession?.healthContext);

export const useConversationPhase = () =>
  useAskCarebowStore((state) => state.currentSession?.conversationState.phase ?? 'initial');

export const useIsTyping = () =>
  useAskCarebowStore((state) => state.isTyping);

export const useCanAskQuestion = () =>
  useAskCarebowStore((state) => state.canAskQuestion());

// Trial selectors
export const useTrialState = () =>
  useAskCarebowStore((state) => state.trial);

export const useIsTrialActive = () =>
  useAskCarebowStore((state) => state.isTrialActive());

export const useTrialDaysRemaining = () =>
  useAskCarebowStore((state) => state.getTrialDaysRemaining());

export const useCanAccessPremiumFeatures = () =>
  useAskCarebowStore((state) => state.canAccessPremiumFeatures());

// Session logging selectors
export const useSessionSummary = () =>
  useAskCarebowStore((state) => state.currentSession?.sessionSummary);

export const useSessionFeedback = () =>
  useAskCarebowStore((state) => state.currentSession?.feedback);

export const useHasProvidedFeedback = () =>
  useAskCarebowStore((state) => state.currentSession?.feedbackProvided ?? false);

export const useLinkedOrderId = () =>
  useAskCarebowStore((state) => state.currentSession?.linkedOrderId);

export const useLinkedRequestId = () =>
  useAskCarebowStore((state) => state.currentSession?.linkedRequestId);

export const useFollowUpStatus = () =>
  useAskCarebowStore((state) => ({
    scheduled: state.currentSession?.followUpScheduled ?? false,
    scheduledFor: state.currentSession?.followUpScheduledFor,
    reminderId: state.currentSession?.followUpReminderId,
  }));

export const useSessionRiskLevel = () =>
  useAskCarebowStore((state) => state.currentSession?.riskLevel);

export const useDetectedSymptoms = () =>
  useAskCarebowStore((state) => state.currentSession?.detectedSymptoms ?? []);

export const useMemberSessions = (memberId: string) =>
  useAskCarebowStore((state) => state.getSessionsForMember(memberId));

export const useRecentSessions = (limit?: number) =>
  useAskCarebowStore((state) => state.getRecentSessions(limit));

export const useEmergencySessions = () =>
  useAskCarebowStore((state) => state.getEmergencySessions());

export const useSessionsWithFeedback = () =>
  useAskCarebowStore((state) => state.getSessionsWithFeedback());
