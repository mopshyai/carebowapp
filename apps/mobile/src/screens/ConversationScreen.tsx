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
import { Message, QuickOption } from '../types/askCarebow';
import type { ImageAttachment } from '../components/askCarebow/ImageUploadBottomSheet';

// AI Engine
import { processUserInput } from '../lib/askCarebow';
import { askCareBowApi } from '../services/api/endpoints/askCareBow';
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
  const scrollViewRef = useRef<ScrollView>(null);

  const [showActionButtons, setShowActionButtons] = useState(false);
  const [triageLevel, setTriageLevel] = useState<TriageLevel | null>(null);
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(params.episodeId || null);

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

  // Initialize session on mount
  useEffect(() => {
    if (!currentSession) {
      // Reset question explanations for new conversation
      resetShownExplanations();

      // Start a new session with the initial symptom
      startNewSession('user_1', 'member_1', params.memberName as string);

      // If initial symptom provided, process it
      const initialSymptom = params.symptom as string;
      if (initialSymptom) {
        // Create episode if not resuming an existing one
        let episodeId = currentEpisodeId;
        if (!episodeId) {
          const episode = startEpisode({
            symptomText: initialSymptom,
            forWhom: (params.context as 'me' | 'family') || 'me',
            age: params.age,
            relationship: params.relation,
          });
          episodeId = episode.id;
          setCurrentEpisodeId(episode.id);
        }

        // Defer message sending to avoid setState during render
        setTimeout(() => {
          handleSendMessage(initialSymptom);
        }, 0);
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

      // Check subscription/free limit
      if (!canAskQuestion()) {
        return;
      }

      // Auto-start trial on first message if not already started
      if (!trial.hasUsedTrial && !trial.trialStartDate) {
        startTrial();
      }

      // Add user message
      addUserMessage(text);
      incrementFreeQuestions();

      // Save to episode
      if (currentEpisodeId) {
        addEpisodeMessage({
          episodeId: currentEpisodeId,
          role: 'user',
          text,
        });
      }

      // Show typing indicator
      setIsTyping(true);
      setIsProcessing(true);

      try {
        // The deterministic on-device safety engine always creates the medical
        // guidance first. The authenticated backend may improve wording, but it
        // cannot remove safety advice or introduce new medical claims.
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
        if (draftResponse) {
          try {
            const liveResponse = await askCareBowApi.rewrite({
              messageText: text,
              draftResponse,
              forWhom: params.context === 'family' ? 'family' : 'me',
            });
            if (liveResponse.success && liveResponse.assistantMessage) {
              displayMessages = response.messages.map((message, index) =>
                index === 0 ? { ...message, text: liveResponse.assistantMessage } : message
              );
            }
          } catch (apiError) {
            // Network/backend failure degrades to the local safety response.
            logger.warn('Ask CareBow rewrite unavailable; using safety response', apiError);
          }
        }

        // Hide typing indicator
        setIsTyping(false);

        // Add assistant messages with enhanced response
        for (const msg of displayMessages) {
          addAssistantMessage(msg);

          // Save to episode
          if (currentEpisodeId && msg.text) {
            addEpisodeMessage({
              episodeId: currentEpisodeId,
              role: 'assistant',
              text: msg.text,
            });
          }

          // Small delay between multiple messages
          if (displayMessages.length > 1) {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        }

        // Calculate and set triage level
        if (response.urgencyLevel) {
          // Fallback: calculate from local response
          const calculatedTriage = getTriageLevel({
            urgencyLevel: response.urgencyLevel,
            hasRedFlags: (currentSession?.healthContext.riskFactors?.length ?? 0) > 0,
            severity: currentSession?.healthContext.severity,
          });
          setTriageLevel(calculatedTriage);
          setShowActionButtons(true);
          // Save to episode
          if (currentEpisodeId) {
            setEpisodeTriageLevel(currentEpisodeId, calculatedTriage);
          }
        }

        // Update conversation state
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

  // Handle memory candidate save
  const handleSaveMemoryCandidate = useCallback(
    (candidateId: string) => {
      saveCandidate(candidateId, currentSession?.id);
    },
    [saveCandidate, currentSession?.id]
  );

  // Handle memory candidate edit
  const handleEditMemoryCandidate = useCallback(
    (candidateId: string, _newValue: string) => {
      // For now, just save with the new value
      // In a full implementation, you'd update the candidate first
      saveCandidate(candidateId, currentSession?.id);
    },
    [saveCandidate, currentSession?.id]
  );

  // Handle quick option selection
  const handleQuickOptionSelect = (option: QuickOption) => {
    handleSendMessage(option.value);
  };

  // Handle follow-up scheduling
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
    // Just dismiss the UI, don't store anything
  }, []);

  // Handle service booking
  const handleBookService = (serviceId: string) => {
    navigation.navigate('Services' as never, { recommended: serviceId });
  };

  // Check if user can ask more questions
  const userCanAsk = canAskQuestion();

  // Get messages from current session
  const messages = currentSession?.messages ?? [];

  // Get the last message to check for quick options
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

        {/* Typing Indicator */}
        {isTyping && <TypingIndicator />}

        {/* Quick Options */}
        {showQuickOptions && lastMessage.quickOptions && (
          <QuickOptionButtons
            options={lastMessage.quickOptions}
            onSelect={handleQuickOptionSelect}
            disabled={isProcessing}
          />
        )}

        {/* Memory Candidate Card - shown after AI response with learned info */}
        {pendingCandidates.length > 0 && !isTyping && (
          <MemoryCandidateCard
            candidates={pendingCandidates}
            onSave={handleSaveMemoryCandidate}
            onEdit={handleEditMemoryCandidate}
            onDismiss={dismissCandidate}
            onDismissAll={clearPendingCandidates}
          />
        )}

        {/* Triage Action Bar - shown after assessment */}
        {showActionButtons && triageLevel && !isTyping && (
          <>
            <TriageActionBar
              triageLevel={triageLevel}
              episodeId={currentEpisodeId || undefined}
              onAction={(action) => {
                if (action === 'connect_doctor' || action === 'schedule_teleconsult') {
                  navigation.navigate('Services' as never, { category: 'video-consult' });
                } else if (action === 'book_home_visit' || action === 'home_visit_options') {
                  navigation.navigate('Services' as never, { category: 'doctor-visit' });
                }
              }}
            />
            {/* Still Need Card - shows missing info */}
            {currentSession?.healthContext &&
              (() => {
                const missingField = detectMissingInfo(currentSession.healthContext);
                return missingField ? <StillNeedCard missingField={missingField} /> : null;
              })()}
            {/* Follow-up Check-in */}
            <FollowUpCheckIn
              onSchedule={handleScheduleFollowUp}
              onDismiss={handleDismissFollowUp}
              isScheduled={hasScheduledFollowUp || !!followUpScheduledLabel}
              scheduledLabel={followUpScheduledLabel || undefined}
            />
          </>
        )}

        {/* Subscription Gate */}
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

      {/* Chat Input */}
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

// Message Renderer Component
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
