/**
 * Ask CareBow Store Tests
 * Tests for the AI health assistant state management
 */

import { act, renderHook } from '@testing-library/react-native';
import { useAskCarebowStore } from './askCarebowStore';

// Helper to reset store state between tests
const resetStore = () => {
  useAskCarebowStore.setState({
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
  });
};

describe('askCarebowStore', () => {
  beforeEach(() => {
    resetStore();
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('starts with null current session', () => {
      const { result } = renderHook(() => useAskCarebowStore());
      expect(result.current.currentSession).toBeNull();
    });

    it('starts with empty sessions array', () => {
      const { result } = renderHook(() => useAskCarebowStore());
      expect(result.current.sessions).toEqual([]);
    });

    it('starts with isTyping false', () => {
      const { result } = renderHook(() => useAskCarebowStore());
      expect(result.current.isTyping).toBe(false);
    });

    it('starts with isProcessing false', () => {
      const { result } = renderHook(() => useAskCarebowStore());
      expect(result.current.isProcessing).toBe(false);
    });

    it('starts without subscription', () => {
      const { result } = renderHook(() => useAskCarebowStore());
      expect(result.current.hasSubscription).toBe(false);
    });

    it('starts with 0 free questions used', () => {
      const { result } = renderHook(() => useAskCarebowStore());
      expect(result.current.freeQuestionsUsed).toBe(0);
    });

    it('starts with trial not started', () => {
      const { result } = renderHook(() => useAskCarebowStore());
      expect(result.current.trial.trialStartDate).toBeNull();
      expect(result.current.trial.trialEndDate).toBeNull();
      expect(result.current.trial.hasUsedTrial).toBe(false);
    });
  });

  describe('Session Management', () => {
    it('startNewSession creates a new session', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      let session: any;
      act(() => {
        session = result.current.startNewSession('user-1', 'member-1', 'Test Member');
      });

      expect(result.current.currentSession).not.toBeNull();
      expect(session.userId).toBe('user-1');
      expect(session.memberId).toBe('member-1');
      expect(session.memberName).toBe('Test Member');
      expect(session.isActive).toBe(true);
      expect(session.messages).toHaveLength(1); // Opening message
    });

    it('startNewSession adds opening message', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      expect(result.current.currentSession?.messages[0].role).toBe('assistant');
      expect(result.current.currentSession?.messages[0].text).toContain("I'm here to help");
    });

    it('startNewSession adds session to sessions array', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      expect(result.current.sessions).toHaveLength(1);
    });

    it('endSession clears current session and marks it inactive', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.endSession();
      });

      expect(result.current.currentSession).toBeNull();
      expect(result.current.sessions[0].isActive).toBe(false);
    });

    it('resumeSession reactivates a session', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      let session: any;
      act(() => {
        session = result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.endSession();
      });

      expect(result.current.currentSession).toBeNull();

      act(() => {
        result.current.resumeSession(session.id);
      });

      expect(result.current.currentSession).not.toBeNull();
      expect(result.current.currentSession?.id).toBe(session.id);
    });

    it('resumeSession does nothing for non-existent session', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.resumeSession('non-existent-id');
      });

      expect(result.current.currentSession).toBeNull();
    });
  });

  describe('Message Handling', () => {
    it('addUserMessage adds user message to current session', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.addUserMessage('I have a headache');
      });

      const messages = result.current.currentSession?.messages || [];
      expect(messages).toHaveLength(2); // Opening + user message
      expect(messages[1].role).toBe('user');
      expect(messages[1].text).toBe('I have a headache');
    });

    it('addUserMessage does nothing without current session', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.addUserMessage('I have a headache');
      });

      expect(result.current.currentSession).toBeNull();
    });

    it('addAssistantMessage adds assistant message to current session', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.addAssistantMessage({
          role: 'assistant',
          text: 'How long have you had this headache?',
          contentType: 'text',
        });
      });

      const messages = result.current.currentSession?.messages || [];
      expect(messages).toHaveLength(2); // Opening + assistant message
      expect(messages[1].role).toBe('assistant');
      expect(messages[1].text).toBe('How long have you had this headache?');
    });

    it('addAssistantMessage does nothing without current session', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.addAssistantMessage({
          role: 'assistant',
          text: 'Test',
          contentType: 'text',
        });
      });

      expect(result.current.currentSession).toBeNull();
    });
  });

  describe('Conversation State', () => {
    it('updateConversationPhase updates the phase', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.updateConversationPhase('gathering');
      });

      expect(result.current.currentSession?.conversationState.phase).toBe('gathering');
    });

    it('markQuestionAsked moves question to asked list', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      const initialRemaining = result.current.currentSession?.conversationState.questionsRemaining.length || 0;

      act(() => {
        result.current.markQuestionAsked('duration');
      });

      expect(result.current.currentSession?.conversationState.questionsAsked).toContain('duration');
      expect(result.current.currentSession?.conversationState.questionsRemaining).not.toContain('duration');
      expect(result.current.currentSession?.conversationState.questionsRemaining.length).toBe(initialRemaining - 1);
    });

    it('setCurrentQuestion sets the current question type', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.setCurrentQuestion('severity');
      });

      expect(result.current.currentSession?.conversationState.currentQuestion?.type).toBe('severity');
    });

    it('markGuidanceProvided sets guidance flag and phase', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.markGuidanceProvided();
      });

      expect(result.current.currentSession?.conversationState.hasProvidedGuidance).toBe(true);
      expect(result.current.currentSession?.conversationState.phase).toBe('guidance');
    });
  });

  describe('Health Context', () => {
    it('updateHealthContext updates health context fields', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.updateHealthContext({
          primarySymptom: 'Headache',
          duration: '3 days',
          severity: 7,
        });
      });

      expect(result.current.currentSession?.healthContext.primarySymptom).toBe('Headache');
      expect(result.current.currentSession?.healthContext.duration).toBe('3 days');
      expect(result.current.currentSession?.healthContext.severity).toBe(7);
    });

    it('addAssociatedSymptom adds symptom to list', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.addAssociatedSymptom('nausea');
      });

      expect(result.current.currentSession?.healthContext.associatedSymptoms).toContain('nausea');
    });

    it('addAssociatedSymptom does not add duplicates', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.addAssociatedSymptom('nausea');
        result.current.addAssociatedSymptom('nausea');
      });

      const symptoms = result.current.currentSession?.healthContext.associatedSymptoms.filter(s => s === 'nausea');
      expect(symptoms).toHaveLength(1);
    });

    it('addRiskFactor adds factor to list', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.addRiskFactor('high blood pressure');
      });

      expect(result.current.currentSession?.healthContext.riskFactors).toContain('high blood pressure');
    });

    it('addChronicCondition adds condition to list', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.addChronicCondition('diabetes');
      });

      expect(result.current.currentSession?.healthContext.chronicConditions).toContain('diabetes');
    });
  });

  describe('Assessment', () => {
    it('setUrgencyLevel sets the urgency level', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.setUrgencyLevel('high');
      });

      expect(result.current.currentSession?.urgencyLevel).toBe('high');
    });

    it('addServiceRecommendation adds recommendation', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.addServiceRecommendation({
          serviceId: 'service-1',
          serviceName: 'Doctor consultation',
          reason: 'Persistent symptoms',
          priority: 'high',
        });
      });

      expect(result.current.currentSession?.recommendedServices).toHaveLength(1);
      expect(result.current.currentSession?.recommendedServices[0].serviceName).toBe('Doctor consultation');
    });

    it('setRiskLevel sets the risk level', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.setRiskLevel('moderate');
      });

      expect(result.current.currentSession?.riskLevel).toBe('moderate');
    });

    it('setTriggeredEmergencyFlow sets the flag', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.setTriggeredEmergencyFlow(true);
      });

      expect(result.current.currentSession?.triggeredEmergencyFlow).toBe(true);
    });

    it('addDetectedSymptom adds symptom to detected list', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.addDetectedSymptom('chest pain');
      });

      expect(result.current.currentSession?.detectedSymptoms).toContain('chest pain');
    });
  });

  describe('Feedback', () => {
    it('provideFeedback sets rating and feedback flag', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.provideFeedback(4);
      });

      expect(result.current.currentSession?.feedbackProvided).toBe(true);
      expect(result.current.currentSession?.feedbackRating).toBe(4);
    });

    it('provideDetailedFeedback sets full feedback object', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.provideDetailedFeedback({
          rating: 5,
          wasHelpful: true,
          wouldRecommend: true,
          comment: 'Very helpful!',
        });
      });

      expect(result.current.currentSession?.feedback?.rating).toBe(5);
      expect(result.current.currentSession?.feedback?.wasHelpful).toBe(true);
      expect(result.current.currentSession?.feedback?.comment).toBe('Very helpful!');
    });
  });

  describe('UI State', () => {
    it('setIsTyping updates typing state', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.setIsTyping(true);
      });

      expect(result.current.isTyping).toBe(true);
    });

    it('setIsProcessing updates processing state', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.setIsProcessing(true);
      });

      expect(result.current.isProcessing).toBe(true);
    });
  });

  describe('Subscription', () => {
    it('setHasSubscription updates subscription state', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.setHasSubscription(true);
      });

      expect(result.current.hasSubscription).toBe(true);
    });

    it('incrementFreeQuestions increments counter', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.incrementFreeQuestions();
      });

      expect(result.current.freeQuestionsUsed).toBe(1);
    });

    it('canAskQuestion returns true with subscription', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.setHasSubscription(true);
      });

      expect(result.current.canAskQuestion()).toBe(true);
    });

    it('canAskQuestion returns true when free questions available', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      // Trial not started, so should be allowed
      expect(result.current.canAskQuestion()).toBe(true);
    });

    it('canAskQuestion returns false when free questions exhausted and trial expired', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      // Exhaust free questions
      act(() => {
        result.current.incrementFreeQuestions();
        result.current.incrementFreeQuestions();
        result.current.incrementFreeQuestions();
      });

      // Mark trial as used but expired
      useAskCarebowStore.setState({
        trial: {
          trialStartDate: '2020-01-01T00:00:00.000Z',
          trialEndDate: '2020-01-04T00:00:00.000Z', // Expired in 2020
          hasUsedTrial: true,
        },
      });

      expect(result.current.canAskQuestion()).toBe(false);
    });
  });

  describe('Trial System', () => {
    it('startTrial sets trial dates', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startTrial();
      });

      expect(result.current.trial.trialStartDate).not.toBeNull();
      expect(result.current.trial.trialEndDate).not.toBeNull();
      expect(result.current.trial.hasUsedTrial).toBe(true);
    });

    it('startTrial cannot be called twice', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startTrial();
      });

      const firstEndDate = result.current.trial.trialEndDate;

      act(() => {
        result.current.startTrial();
      });

      // End date should not change
      expect(result.current.trial.trialEndDate).toBe(firstEndDate);
    });

    it('isTrialActive returns true during active trial', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startTrial();
      });

      expect(result.current.isTrialActive()).toBe(true);
    });

    it('isTrialActive returns false when no trial started', () => {
      const { result } = renderHook(() => useAskCarebowStore());
      expect(result.current.isTrialActive()).toBe(false);
    });

    it('getTrialDaysRemaining returns correct days', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startTrial();
      });

      const daysRemaining = result.current.getTrialDaysRemaining();
      expect(daysRemaining).toBeGreaterThanOrEqual(2); // At least 2 days (could be 3)
      expect(daysRemaining).toBeLessThanOrEqual(3);
    });

    it('getTrialDaysRemaining returns 0 when no trial', () => {
      const { result } = renderHook(() => useAskCarebowStore());
      expect(result.current.getTrialDaysRemaining()).toBe(0);
    });

    it('canAccessPremiumFeatures returns true with subscription', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.setHasSubscription(true);
      });

      expect(result.current.canAccessPremiumFeatures()).toBe(true);
    });

    it('canAccessPremiumFeatures returns true during trial', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startTrial();
      });

      expect(result.current.canAccessPremiumFeatures()).toBe(true);
    });

    it('canAccessPremiumFeatures returns false without subscription or trial', () => {
      const { result } = renderHook(() => useAskCarebowStore());
      expect(result.current.canAccessPremiumFeatures()).toBe(false);
    });
  });

  describe('Session Linking', () => {
    it('linkOrderToSession links an order', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.linkOrderToSession('order-123');
      });

      expect(result.current.currentSession?.linkedOrderId).toBe('order-123');
    });

    it('linkRequestToSession links a request', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.linkRequestToSession('request-456');
      });

      expect(result.current.currentSession?.linkedRequestId).toBe('request-456');
    });

    it('scheduleFollowUp sets follow-up data', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.scheduleFollowUp('2025-02-01T10:00:00.000Z', 'reminder-1');
      });

      expect(result.current.currentSession?.followUpScheduled).toBe(true);
      expect(result.current.currentSession?.followUpScheduledFor).toBe('2025-02-01T10:00:00.000Z');
      expect(result.current.currentSession?.followUpReminderId).toBe('reminder-1');
    });

    it('cancelFollowUp clears follow-up data', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.scheduleFollowUp('2025-02-01T10:00:00.000Z');
      });

      act(() => {
        result.current.cancelFollowUp();
      });

      expect(result.current.currentSession?.followUpScheduled).toBe(false);
      expect(result.current.currentSession?.followUpScheduledFor).toBeUndefined();
    });

    it('markDoctorNotesSent sets notes data', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.markDoctorNotesSent('dr.smith@example.com');
      });

      expect(result.current.currentSession?.doctorNotesSent).toBe(true);
      expect(result.current.currentSession?.doctorNotesRecipient).toBe('dr.smith@example.com');
    });
  });

  describe('Export', () => {
    it('exportSession adds export history entry', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.exportSession('pdf', 'email');
      });

      expect(result.current.currentSession?.exportHistory).toHaveLength(1);
      expect(result.current.currentSession?.exportHistory?.[0].exportFormat).toBe('pdf');
      expect(result.current.currentSession?.exportHistory?.[0].exportedTo).toBe('email');
    });

    it('getSessionExportText returns null without session', () => {
      const { result } = renderHook(() => useAskCarebowStore());
      expect(result.current.getSessionExportText()).toBeNull();
    });

    it('getSessionExportJson returns null without session', () => {
      const { result } = renderHook(() => useAskCarebowStore());
      expect(result.current.getSessionExportJson()).toBeNull();
    });
  });

  describe('Cleanup', () => {
    it('clearCurrentSession clears only current session', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
      });

      act(() => {
        result.current.clearCurrentSession();
      });

      expect(result.current.currentSession).toBeNull();
      expect(result.current.sessions).toHaveLength(1); // Session still in history
    });

    it('clearAllSessions clears everything', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
        result.current.startNewSession('user-1', 'member-2');
      });

      act(() => {
        result.current.clearAllSessions();
      });

      expect(result.current.currentSession).toBeNull();
      expect(result.current.sessions).toHaveLength(0);
    });
  });

  describe('Getters', () => {
    it('getSessionById returns correct session', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      let session: any;
      act(() => {
        session = result.current.startNewSession('user-1', 'member-1');
      });

      const found = result.current.getSessionById(session.id);
      expect(found).toBeDefined();
      expect(found?.id).toBe(session.id);
    });

    it('getSessionById returns undefined for non-existent id', () => {
      const { result } = renderHook(() => useAskCarebowStore());
      const found = result.current.getSessionById('non-existent');
      expect(found).toBeUndefined();
    });

    it('getSessionsForMember returns correct sessions', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
        result.current.endSession();
        result.current.startNewSession('user-1', 'member-2');
        result.current.endSession();
        result.current.startNewSession('user-1', 'member-1');
      });

      const memberSessions = result.current.getSessionsForMember('member-1');
      expect(memberSessions).toHaveLength(2);
    });

    it('getRecentSessions returns limited sessions', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        for (let i = 0; i < 5; i++) {
          result.current.startNewSession('user-1', `member-${i}`);
          result.current.endSession();
        }
      });

      const recent = result.current.getRecentSessions(3);
      expect(recent).toHaveLength(3);
    });

    it('getSessionsWithFeedback returns only sessions with feedback', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
        result.current.provideFeedback(5);
        result.current.endSession();
        result.current.startNewSession('user-1', 'member-2');
        result.current.endSession();
      });

      const withFeedback = result.current.getSessionsWithFeedback();
      expect(withFeedback).toHaveLength(1);
    });

    it('getEmergencySessions returns only emergency sessions', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
        result.current.setTriggeredEmergencyFlow(true);
        result.current.endSession();
        result.current.startNewSession('user-1', 'member-2');
        result.current.endSession();
      });

      const emergency = result.current.getEmergencySessions();
      expect(emergency).toHaveLength(1);
    });
  });

  describe('Finalize Session', () => {
    it('finalizeSession generates summary and ends session', () => {
      const { result } = renderHook(() => useAskCarebowStore());

      act(() => {
        result.current.startNewSession('user-1', 'member-1');
        result.current.addUserMessage('I have a headache');
        result.current.updateHealthContext({ primarySymptom: 'Headache' });
      });

      const sessionId = result.current.currentSession?.id;

      act(() => {
        result.current.finalizeSession();
      });

      expect(result.current.currentSession).toBeNull();
      const finalizedSession = result.current.sessions.find(s => s.id === sessionId);
      expect(finalizedSession?.isActive).toBe(false);
      expect(finalizedSession?.sessionSummary).toBeDefined();
    });
  });
});
