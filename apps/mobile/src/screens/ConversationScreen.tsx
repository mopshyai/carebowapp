/**
 * Ask CareBow Conversation Screen
 * AI-powered health assistant conversation interface
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  Alert,
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

import { useAskCarebowStore } from '../store/askCarebowStore';
import { useHealthMemoryStore, usePendingCandidates } from '../store/healthMemoryStore';
import { useAuthStore } from '../store/useAuthStore';
import { useProfileStore } from '../store/useProfileStore';
import { Message, QuickOption } from '../types/askCarebow';
import type { ImageAttachment } from '../components/askCarebow/ImageUploadBottomSheet';

import { processUserInput } from '../lib/askCarebow';
import { askCareBowApi } from '../services/api/endpoints/askCareBow';
import {
  askCarebowEntitlementApi,
  type AskCarebowEntitlement,
} from '../services/api/endpoints/askCarebowEntitlement';
import { ApiError } from '../services/api/types';
import { streamOrchestratorReply } from '../lib/askCarebow/orchestratorClient';
import {
  resolveConversationAgeGroup,
  resolveConversationMemberId,
} from '../lib/askCarebow/patientContext';
import { createAskCarebowTurnRequestId } from '../lib/askCarebow/turnRequestId';
import { ensureBackendProfile } from '../lib/profileSync';
import { ASK_CAREBOW_ORCHESTRATOR_ENABLED } from '../config/featureFlags';
import { createLogger } from '../utils/logger';

const logger = createLogger('Conversation');

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

function isSafetyBypass(response: {
  isEmergency?: boolean;
  urgencyLevel?: string;
}): boolean {
  return (
    response.isEmergency === true ||
    response.urgencyLevel === 'emergency' ||
    response.urgencyLevel === 'urgent'
  );
}

export default function ConversationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;
  const route = useRoute();
  const params = (route.params as Record<string, string>) || {};
  const conversationContext = params.context === 'family' ? 'family' : 'me';
  const scrollViewRef = useRef<ScrollView>(null);

  const [showActionButtons, setShowActionButtons] = useState(false);
  const [triageLevel, setTriageLevel] = useState<TriageLevel | null>(null);
  const [lastTurnUsedOrchestrator, setLastTurnUsedOrchestrator] = useState(false);
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(params.episodeId || null);
  const [streamingText, setStreamingText] = useState<string | null>(null);
  const [entitlement, setEntitlement] = useState<AskCarebowEntitlement | null>(null);
  const [accessBlocked, setAccessBlocked] = useState(false);

  const authUserId = useAuthStore((state) => state.user?.id);

  const selfMember = useProfileStore((state) =>
    state.members.find((member) => member.relationship === 'self')
  );
  const selectedFamilyMember = useProfileStore((state) => {
    if (conversationContext !== 'family' || !params.memberId) return undefined;
    return state.members.find(
      (member) => member.id === params.memberId || member.backendId === params.memberId
    );
  });

  const {
    startEpisode,
    addMessage: addEpisodeMessage,
    setTriageLevel: setEpisodeTriageLevel,
    getEpisode,
  } = useEpisodeStore();

  const { scheduleFollowUp } = useFollowUpStore();
  const hasScheduledFollowUp = useHasScheduledFollowUp(currentEpisodeId || '');
  const [followUpScheduledLabel, setFollowUpScheduledLabel] = useState<string | null>(null);

  const {
    currentSession,
    isTyping,
    isProcessing,
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
  } = useAskCarebowStore();

  const { saveCandidate, dismissCandidate, clearPendingCandidates } = useHealthMemoryStore();
  const pendingCandidates = usePendingCandidates();
  const pendingInitialSymptomRef = useRef<string | null>(null);

  const refreshEntitlement = useCallback(async (): Promise<AskCarebowEntitlement> => {
    const current = await askCarebowEntitlementApi.get();
    setEntitlement(current);
    setAccessBlocked(!current.canAsk);
    return current;
  }, []);

  useEffect(() => {
    void refreshEntitlement().catch((error) => {
      logger.warn('Ask CareBow entitlement prefetch unavailable', error);
    });
  }, [refreshEntitlement]);

  useEffect(() => {
    if (!currentSession) {
      resetShownExplanations();

      const memberId = resolveConversationMemberId(
        conversationContext,
        selfMember,
        selectedFamilyMember
      );
      startNewSession(authUserId ?? '', memberId, params.memberName as string);

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

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [currentSession?.messages, isTyping]);

  const handleSendMessage = useCallback(
    async (text: string, _images?: ImageAttachment[]) => {
      if (!currentSession || isProcessing) return;

      setIsProcessing(true);
      const requestId = createAskCarebowTurnRequestId();

      try {
        // Safety classification happens before monetization. Emergency/urgent
        // guidance is never suppressed because a trial or quota ended.
        const response = await processUserInput(
          text,
          currentSession.conversationState.phase,
          currentSession.healthContext,
          currentSession.conversationState.questionsAsked
        );
        const safetyBypass = isSafetyBypass(response);

        if (!safetyBypass) {
          let currentAccess: AskCarebowEntitlement;
          try {
            currentAccess = await refreshEntitlement();
          } catch (error) {
            logger.warn('Unable to verify Ask CareBow entitlement', error);
            Alert.alert(
              'Could not verify Ask CareBow access',
              'Please check your connection and try again. Emergency guidance remains available.'
            );
            return;
          }

          if (!currentAccess.canAsk) {
            setAccessBlocked(true);
            return;
          }
        }

        addUserMessage(text);
        if (currentEpisodeId) {
          addEpisodeMessage({
            episodeId: currentEpisodeId,
            role: 'user',
            text,
          });
        }

        setIsTyping(true);

        let displayMessages = response.messages;
        const draftResponse = response.messages
          .map((message) => message.text)
          .filter(Boolean)
          .join('\n\n');

        let usedOrchestrator = false;
        let serverDeniedTurn = false;

        if (
          ASK_CAREBOW_ORCHESTRATOR_ENABLED &&
          response.intent === 'symptom_help' &&
          draftResponse &&
          currentSession.memberId
        ) {
          try {
            const backendProfileId = await ensureBackendProfile(currentSession.memberId);

            setStreamingText('');
            const orchestratorReply = await streamOrchestratorReply({
              localSessionId: currentSession.id,
              profileId: backendProfileId,
              text,
              requestId,
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
            logger.warn(
              'Ask CareBow orchestrator unavailable for the resolved patient profile',
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
              requestId,
            });
            if (liveResponse.entitlement) {
              setEntitlement(liveResponse.entitlement);
              setAccessBlocked(!liveResponse.entitlement.canAsk);
            }
            if (liveResponse.success && liveResponse.assistantMessage) {
              displayMessages = response.messages.map((message, index) =>
                index === 0 ? { ...message, text: liveResponse.assistantMessage } : message
              );
            }
          } catch (apiError) {
            if (apiError instanceof ApiError && apiError.status === 402 && !safetyBypass) {
              serverDeniedTurn = true;
              setAccessBlocked(true);
              displayMessages = [];
              void refreshEntitlement().catch(() => {});
            } else {
              // For a true safety bypass the deterministic response remains the
              // source of truth even if the network/AI writer is unavailable.
              logger.warn('Ask CareBow rewrite unavailable; using deterministic response', apiError);
            }
          }
        }

        setLastTurnUsedOrchestrator(usedOrchestrator);
        setIsTyping(false);

        if (serverDeniedTurn) {
          addAssistantMessage({
            role: 'assistant',
            contentType: 'text',
            text: 'Your Ask CareBow access limit has been reached. View Care Plans to continue. Emergency guidance remains available.',
          });
          return;
        }

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

        if (response.phaseUpdate) updateConversationPhase(response.phaseUpdate);
        if (response.healthContextUpdates) updateHealthContext(response.healthContextUpdates);
        if (response.urgencyLevel) setUrgencyLevel(response.urgencyLevel);
        if (response.questionAsked) markQuestionAsked(response.questionAsked);
        if (response.serviceRecommendations) {
          for (const rec of response.serviceRecommendations) addServiceRecommendation(rec);
        }

        if (!safetyBypass) {
          void refreshEntitlement().catch(() => {});
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
        setIsTyping(false);
        setIsProcessing(false);
      }
    },
    [currentSession, isProcessing, currentEpisodeId, conversationContext, refreshEntitlement]
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

  const handleDismissFollowUp = useCallback(() => {}, []);

  const handleBookService = (serviceId: string) => {
    navigation.navigate('Services' as never, { recommended: serviceId });
  };

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

        {accessBlocked && entitlement && (
          <SubscriptionGate
            entitlement={entitlement}
            onViewPlans={() => navigation.navigate('CarePlans')}
          />
        )}
      </ScrollView>

      {!accessBlocked && (
        <View style={[styles.inputWrapper, { paddingBottom: insets.bottom }]}>
          <ChatInput
            onSend={handleSendMessage}
            disabled={isProcessing}
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
