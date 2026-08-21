/**
 * Ask CareBow Conversation Screen
 * AI-powered health assistant conversation interface
 *
 * Upgrades:
 * - Enhanced chat bubbles with collapsible sections
 * - Memory candidate cards after AI responses
 * - Action buttons (Connect to doctor, Book home visit, Save summary)
 * - Support for image attachments
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { AppNavigationProp } from '../navigation/types';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../theme';

// Store & Types
import { useAskCarebowStore } from '../store/askCarebowStore';
import { useHealthMemoryStore, usePendingCandidates } from '../store/healthMemoryStore';
import { useAuthStore } from '../store/useAuthStore';
import { useProfileStore } from '../store/useProfileStore';
import { Message, QuickOption } from '../types/askCarebow';
import type { ImageAttachment } from '../components/askCarebow/ImageUploadBottomSheet';

// AI Engine
import { processUserInput } from '../lib/askCarebow';
import { askCareBowApi } from '../services/api/endpoints/askCareBow';
import { streamOrchestratorReply } from '../lib/askCarebow/orchestratorClient';
import {
  resolveConversationAgeGroup,
  resolveConversationMemberId,
} from '../lib/askCarebow/patientContext';
import { ensureBackendProfile } from '../lib/profileSync';
import { ASK_CAREBOW_ORCHESTRATOR_ENABLED } from '../config/featureFlags';
import { createLogger } from '../utils/logger';

const logger = createLogger('Conversation');

// Components
import {
  ChatBubble,
  ChatInput,
  QuickOptionButtons,
  EmergencyAlert,
  GuidanceCard,
  ServiceRecommendationCard,
  TypingIndicator,
  SubscriptionGate,
  TriageActionBar,
  FollowUpCheckIn,
  StillNeedCard,
} from '../components/askCarebow';
import { MemoryCandidateCard } from '../components/askCarebow/MemoryCandidateCard';
import { getTriageLevel, TriageLevel } from '../utils/triageCTAMapping';
import { useEpisodeStore } from '../store/episodeStore';
import { useFollowUpStore, useHasScheduledFollowUp } from '../store/followUpStore';
import { formatFollowUpDate } from '../types/followUp';
import { resetShownExplanations } from '../utils/questionExplanations';
import { detectMissingInfo } from '../utils/missingInfoDetector';

export default function ConversationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;
  const route = useRoute();
  const params = (route.params as Record<string, string>) || {};
  const conversationContext = params.context === 'family' ? 'family' : 'me';
  const scrollViewRef = useRef<ScrollView>(null);

  const [showActionButtons, setShowActionButtons] = useState(false);
  const [triageLevel, setTriageLevel] = useState<TriageLevel | null>(null);
  // The orchestrator runs its own intake/follow-ups. Track whether it drove the
  // latest turn so local intake scaffolding does not contradict it.
  const [lastTurnUsedOrchestrator, setLastTurnUsedOrchestrator] = useState(false);
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(params.episodeId || null);
  // E4: the medical agent's answer as it streams in, token by token.
  const [streamingText, setStreamingText] = useState<string | null>(null);

  const authUserId = useAuthStore((state) => state.user?.id);

  // Identity is explicit. "Default" is a preference and may be Mom, so it is
  // not proof of self. Family mode receives a memberId only when AskScreen made
  // the user explicitly choose a saved non-self profile.
  const selfMember = useProfileStore((state) =>
    state.members.find((member) => member.relationship === 'self')
  );
  const selectedFamilyMember = useProfileStore((state) => {
    if (conversationContext !== 'family' || !params.memberId) return undefined;
    return state.members.find(
      (member) => member.id === params.memberId || member.backendId === params.memberId
    );
  });

  // Episode store
  const {
    startEpisode,
    addMessage: addEpisodeMessage,
    setTriageLevel: setEpisodeTriageLevel,
    getEpisode,
  } = useEpisodeStore();

  // Follow-up store
  const { scheduleFollowUp } = useFollowUpStore();
  const hasScheduledFollowUp = useHasScheduledFollowUp(currentEpisodeId || '');
  const [followUpScheduledLabel, setFollowUpScheduledLabel] = useState<string | null>(null);

  // Store state and actions
  const {
    currentSession,
    isTyping,
    isProcessing,
    hasSubscription,
    freeQuestionsUsed,
    maxFreeQuestions,
    trial,
    startNewSession,
    addUserMessage,
    addAssistantMessage,
    updateConversationPhase,
    markQuestionAsked,
    updateHealthContext,
    setUrgencyLevel,
    addServiceRecommendation,
    setIsTyping,
    setIsProcessing,
    incrementFreeQuestions,
    canAskQuestion,
    startTrial,
  } = useAskCarebowStore();

  // Health memory store
  const { saveCandidate, dismissCandidate, clearPendingCandidates } = useHealthMemoryStore();
  const pendingCandidates = usePendingCandidates();

  // Holds the initial symptom until currentSession has rendered into scope.
  const pendingInitialSymptomRef = useRef<string | null>(null);

  // Initialize session on mount
  useEffect(() => {
    if (!currentSession) {
      resetShownExplanations();

      // A resolved id exists only for explicit self or an explicitly selected
      // saved family patient. Ad-hoc family intake deliberately stays unbound.
      const memberId = resolveConversationMemberId(
        conversationContext,
        selfMember,
        selectedFamilyMember
      );
      startNewSession(authUserId ?? '', memberId, params.memberName as string);

      // Family age is supplied by AskScreen. For a saved family member it was
      // derived from exact DOB; for ad-hoc intake it is the user's entered age.
      // Self age always comes from the saved self DOB.
      const ageGroup = resolveConversationAgeGroup(
        conversationContext,
        params.age,
        selfMember?.dateOfBirth
      );
      if (ageGroup) {
        updateHealthContext({ ageGroup });
      }

      const initialSymptom = params.symptom as string;
      if (initialSymptom) {
        let episodeId = currentEpisodeId;
        if (!episodeId) {
          const episode = startEpisode({
            symptomText: initialSymptom,
            forWhom: conversationContext,
            age: params.age,
            relationship: params.relation,
          });
          episodeId = episode.id;
          setCurrentEpisodeId(episode.id);
        }

        pendingInitialSymptomRef.current = initialSymptom;
      }
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [currentSession?.messages, isTyping]);

  // Handle sending a message
  const handleSendMessage = useCallback(
    async (text: string, _images?: ImageAttachment[]) => {
      if (!currentSession || isProcessing) return;

      // This local gate is retained until the server entitlement P0 replaces it.
      if (!canAskQuestion()) {
        return;
      }

      if (!trial.hasUsedTrial && !trial.trialStartDate) {
        startTrial();
      }

      addUserMessage(text);
      incrementFreeQuestions();

      if (currentEpisodeId) {
        addEpisodeMessage({
          episodeId: currentEpisodeId,
          role: 'user',
          text,
        });
      }

      setIsTyping(true);
      setIsProcessing(true);

      try {
        // Deterministic safety logic runs before any LLM path.
        const response = await processUserInput(
          text,
          currentSession.conversationState.phase,
          currentSession.healthContext,
          currentSession.conversationState.questionsAsked
        );

        let displayMessages = response.messages;
        const draftResponse = response.messages
          .map((message) => message.text)
          .filter(Boolean)
          .join('\n\n');

        // RAG/orchestrator is allowed for any symptom-help turn that has a
        // resolved patient id: explicit self or explicit saved family profile.
        // Ad-hoc family intake has memberId='' and therefore cannot enter here.
        let usedOrchestrator = false;
        if (
          ASK_CAREBOW_ORCHESTRATOR_ENABLED &&
          response.intent === 'symptom_help' &&
          draftResponse &&
          currentSession.memberId
        ) {
          try {
            // If the exact selected saved profile is still local-only, validate
            // and repair that profile before the backend ever sees an id.
            const backendProfileId = await ensureBackendProfile(currentSession.memberId);

            setStreamingText('');
            const orchestratorReply = await streamOrchestratorReply({
              localSessionId: currentSession.id,
              profileId: backendProfileId,
              text,
              onTextDelta: (delta) => setStreamingText((prev) => (prev ?? '') + delta),
            });
            if (orchestratorReply) {
              displayMessages = [
                {
                  role: 'assistant',
                  contentType: 'text',
                  text: orchestratorReply.text,
                },
              ];
              usedOrchestrator = true;
            }
          } catch (profileOrOrchestratorError) {
            // Never try a different profile. Degrade to deterministic safety.
            logger.warn(
              'Ask CareBow orchestrator unavailable for the resolved patient profile; using safety response',
              profileOrOrchestratorError
            );
          } finally {
            setStreamingText(null);
          }
        }

        if (!usedOrchestrator && draftResponse) {
          try {
            const liveResponse = await askCareBowApi.rewrite({
              messageText: text,
              draftResponse,
              forWhom: conversationContext,
            });
            if (liveResponse.success && liveResponse.assistantMessage) {
              displayMessages = response.messages.map((message, index) =>
                index === 0 ? { ...message, text: liveResponse.assistantMessage } : message
              );
            }
          } catch (apiError) {
            logger.warn('Ask CareBow rewrite unavailable; using safety response', apiError);
          }
        }

        setLastTurnUsedOrchestrator(usedOrchestrator);
        setIsTyping(false);

        for (const msg of displayMessages) {
          addAssistantMessage(msg);

          if (currentEpisodeId && msg.text) {
            addEpisodeMessage({
              episodeId: currentEpisodeId,
              role: 'assistant',
              text: msg.text,
            });
          }

          if (displayMessages.length > 1) {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        }

        if (response.urgencyLevel) {
          const calculatedTriage = getTriageLevel({
            urgencyLevel: response.urgencyLevel,
            hasRedFlags: (currentSession?.healthContext.riskFactors?.length ?? 0) > 0,
            severity: currentSession?.healthContext.severity,
          });
          setTriageLevel(calculatedTriage);
          setShowActionButtons(true);
          if (currentEpisodeId) {
            setEpisodeTriageLevel(currentEpisodeId, calculatedTriage);
          }
        }

        if (response.phaseUpdate) {
          updateConversationPhase(response.phaseUpdate);
        }

        if (response.healthContextUpdates) {
          updateHealthContext(response.healthContextUpdates);
        }

        if (response.urgencyLevel) {
          setUrgencyLevel(response.urgencyLevel);
        }

        if (response.questionAsked) {
          markQuestionAsked(response.questionAsked);
        }

        if (response.serviceRecommendations) {
          for (const rec of response.serviceRecommendations) {
            addServiceRecommendation(rec);
          }
        }
      } catch (error) {
        logger.error('Error processing message', error);
        setIsTyping(false);
        setStreamingText(null);
        addAssistantMessage({
          role: 'assistant',
          contentType: 'text',
          text: "I'm having trouble processing your message. Please try again.",
        });
      } finally {
        setIsProcessing(false);
      }
    },
    [currentSession, isProcessing, params, trial, startTrial]
  );

  useEffect(() => {
    if (currentSession && pendingInitialSymptomRef.current) {
      const symptom = pendingInitialSymptomRef.current;
      pendingInitialSymptomRef.current = null;
      handleSendMessage(symptom);
    }
  }, [currentSession, handleSendMessage]);

  const handleSaveMemoryCandidate = useCallback(
    (candidateId: string) => {
      saveCandidate(candidateId, currentSession?.id);
    },
    [saveCandidate, currentSession?.id]
  );

  const handleEditMemoryCandidate = useCallback(
    (candidateId: string, _newValue: string) => {
      saveCandidate(candidateId, currentSession?.id);
    },
    [saveCandidate, currentSession?.id]
  );

  const handleQuickOptionSelect = (option: QuickOption) => {
    handleSendMessage(option.label);
  };

  const handleScheduleFollowUp = useCallback(
    (days: number) => {
      if (!currentEpisodeId) return;

      const episode = getEpisode(currentEpisodeId);
      if (!episode) return;

      const followUp = scheduleFollowUp({
        episodeId: currentEpisodeId,
        episodeTitle: episode.title,
        daysFromNow: days,
        reasonSnippet: episode.lastMessageSnippet,
      });

      setFollowUpScheduledLabel(formatFollowUpDate(followUp.followUpAt));
    },
    [currentEpisodeId, getEpisode, scheduleFollowUp]
  );

  const handleDismissFollowUp = useCallback(() => {
    // Dismiss UI only.
  }, []);

  const handleBookService = (serviceId: string) => {
    navigation.navigate('Services' as never, { recommended: serviceId });
  };

  const userCanAsk = canAskQuestion();
  const messages = currentSession?.messages ?? [];
  const lastMessage = messages[messages.length - 1];
  const showQuickOptions =
    lastMessage?.role === 'assistant' &&
    lastMessage?.contentType === 'question' &&
    lastMessage?.quickOptions &&
    !isTyping;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View style={styles.headerIcon}>
            <Icon name="heart" size={18} color={colors.textInverse} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Ask CareBow</Text>
            <Text style={styles.headerSubtitle}>AI Health Assistant</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.menuButton}>
          <Icon name="ellipsis-vertical" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={[styles.messagesContent, { paddingBottom: insets.bottom + 120 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((message) => (
          <MessageRenderer
            key={message.id}
            message={message}
            onBookService={handleBookService}
            urgencyLevel={currentSession?.urgencyLevel}
            episodeId={currentEpisodeId || undefined}
          />
        ))}

        {isTyping && !streamingText && <TypingIndicator />}

        {!!streamingText && (
          <ChatBubble
            message={{
              id: 'streaming-preview',
              role: 'assistant',
              contentType: 'text',
              text: streamingText,
              timestamp: new Date().toISOString(),
            }}
            episodeId={currentEpisodeId || undefined}
          />
        )}

        {showQuickOptions && lastMessage.quickOptions && (
          <QuickOptionButtons
            options={lastMessage.quickOptions}
            onSelect={handleQuickOptionSelect}
            disabled={isProcessing}
          />
        )}

        {pendingCandidates.length > 0 && !isTyping && (
          <MemoryCandidateCard
            candidates={pendingCandidates}
            onSave={handleSaveMemoryCandidate}
            onEdit={handleEditMemoryCandidate}
            onDismiss={dismissCandidate}
            onDismissAll={clearPendingCandidates}
          />
        )}

        {showActionButtons && triageLevel && !isTyping && (
          <>
            <TriageActionBar
              triageLevel={triageLevel}
              episodeId={currentEpisodeId || undefined}
              symptoms={[
                currentSession?.healthContext.primarySymptom,
                ...(currentSession?.healthContext.associatedSymptoms ?? []),
              ].filter((s): s is string => Boolean(s))}
              profileId={currentSession?.memberId || undefined}
              onAction={(action) => {
                if (action === 'connect_doctor' || action === 'schedule_teleconsult') {
                  navigation.navigate('Services' as never, { category: 'video-consult' });
                } else if (action === 'book_home_visit' || action === 'home_visit_options') {
                  navigation.navigate('Services' as never, { category: 'doctor-visit' });
                }
              }}
            />
            {!lastTurnUsedOrchestrator &&
              currentSession?.healthContext &&
              (() => {
                const missingField = detectMissingInfo(currentSession.healthContext);
                return missingField ? <StillNeedCard missingField={missingField} /> : null;
              })()}
            <FollowUpCheckIn
              onSchedule={handleScheduleFollowUp}
              onDismiss={handleDismissFollowUp}
              isScheduled={hasScheduledFollowUp || !!followUpScheduledLabel}
              scheduledLabel={followUpScheduledLabel || undefined}
            />
          </>
        )}

        {/* Existing local subscription gate; server-authoritative entitlement is
            the next monetization P0 and will replace this device-local gate. */}
        {!userCanAsk && !hasSubscription && (
          <SubscriptionGate
            freeQuestionsUsed={freeQuestionsUsed}
            maxFreeQuestions={maxFreeQuestions}
            onSubscribe={() =>
              navigation.navigate('PlanDetails' as never, { id: 'ask_carebow' } as never)
            }
            onViewPlans={() => navigation.navigate('Services')}
          />
        )}
      </ScrollView>

      {userCanAsk && (
        <View style={[styles.inputWrapper, { paddingBottom: insets.bottom }]}>
          <ChatInput
            onSend={handleSendMessage}
            disabled={isProcessing || !userCanAsk}
            placeholder={
              currentSession?.conversationState.phase === 'initial'
                ? 'Describe your symptoms...'
                : 'Type your response...'
            }
          />
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

interface MessageRendererProps {
  message: Message;
  onBookService: (serviceId: string) => void;
  urgencyLevel?: string;
  episodeId?: string;
}

function MessageRenderer({
  message,
  onBookService,
  urgencyLevel,
  episodeId,
}: MessageRendererProps) {
  switch (message.contentType) {
    case 'emergency_alert':
      return <EmergencyAlert message={message.text} />;

    case 'guidance':
      return message.guidance ? (
        <GuidanceCard guidance={message.guidance} urgencyLevel={urgencyLevel as any} />
      ) : (
        <ChatBubble message={message} episodeId={episodeId} />
      );

    case 'service_recommendation':
      return message.serviceRecommendation ? (
        <ServiceRecommendationCard
          recommendation={message.serviceRecommendation}
          onBook={() => onBookService(message.serviceRecommendation!.serviceId)}
        />
      ) : (
        <ChatBubble message={message} episodeId={episodeId} />
      );

    case 'text':
    case 'question':
    default:
      return <ChatBubble message={message} episodeId={episodeId} />;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.button,
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: colors.textTertiary,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  inputWrapper: {
    backgroundColor: colors.background,
  },
});
