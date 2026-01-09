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

import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
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
import { MemoryCandidate } from '../types/healthMemory';
import type { ImageAttachment } from '../components/askCarebow/ImageUploadBottomSheet';

// AI Engine
import { processUserInput } from '../lib/askCarebow';
import { sendAskCareBowMessage, createMessagePayload } from '../lib/askCarebow/apiClient';

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
import { EnhancedChatBubble, EnhancedResponse, DEFAULT_ACTION_BUTTONS } from '../components/askCarebow/EnhancedChatBubble';
import { MemoryCandidateCard } from '../components/askCarebow/MemoryCandidateCard';
import { getTriageLevel, TriageLevel } from '../utils/triageCTAMapping';
import { useEpisodeStore } from '../store/episodeStore';
import { useFollowUpStore, useHasScheduledFollowUp } from '../store/followUpStore';
import { getAgeGroupFromAge } from '../utils/episodeTitleGenerator';
import { formatFollowUpDate } from '../types/followUp';
import { resetShownExplanations } from '../utils/questionExplanations';
import { detectMissingInfo } from '../utils/missingInfoDetector';

export default function ConversationScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation() as AppNavigationProp;
  const route = useRoute();
  const params = (route.params as Record<string, string>) || {};
  const scrollViewRef = useRef<ScrollView>(null);

  // Parse attached images from params
  const attachedImages = useMemo<ImageAttachment[]>(() => {
    try {
      return params.attachedImages ? JSON.parse(params.attachedImages) : [];
    } catch {
      return [];
    }
  }, [params.attachedImages]);

  // State for enhanced responses
  const [enhancedResponses, setEnhancedResponses] = useState<Record<string, EnhancedResponse>>({});
  const [showActionButtons, setShowActionButtons] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [triageLevel, setTriageLevel] = useState<TriageLevel | null>(null);
  const [currentEpisodeId, setCurrentEpisodeId] = useState<string | null>(params.episodeId || null);

  // Episode store
  const {
    startEpisode,
    addMessage: addEpisodeMessage,
    setTriageLevel: setEpisodeTriageLevel,
    getActiveEpisode,
    getEpisode,
  } = useEpisodeStore();

  // Follow-up store
  const { scheduleFollowUp, getFollowUpsForEpisode } = useFollowUpStore();
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
  const {
    addPendingCandidates,
    saveCandidate,
    dismissCandidate,
    clearPendingCandidates,
    getMemorySnapshot,
  } = useHealthMemoryStore();
  const pendingCandidates = usePendingCandidates();

  // Initialize session on mount
  useEffect(() => {
    if (!currentSession) {
      // Reset question explanations for new conversation
      resetShownExplanations();

      // Start a new session with the initial symptom
      const session = startNewSession('user_1', 'member_1', params.memberName as string);

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
    async (text: string, images?: ImageAttachment[]) => {
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
        // Get memory snapshot for personalization
        const memorySnapshot = getMemorySnapshot(
          params.context === 'family' ? 'family' : 'me'
        );

        // Parse caregiver presence from params
        const isCaregiverPresent = params.caregiverPresent === 'true';

        // Create API payload
        const payload = createMessagePayload(
          'user_1',
          text,
          {
            forWhom: (params.context as 'me' | 'family') || 'me',
            ageGroup: params.age,
            relationship: params.relation,
            caregiverPresent: params.context === 'family' ? isCaregiverPresent : undefined,
          },
          images || [],
          memorySnapshot,
          conversationId || undefined
        );

        // Send to API (mock in dev)
        const apiResponse = await sendAskCareBowMessage(payload);

        // Update conversation ID
        if (apiResponse.conversationId) {
          setConversationId(apiResponse.conversationId);
        }

        // Process through existing AI engine for backward compatibility
        const response = await processUserInput(
          text,
          currentSession.conversationState.phase,
          currentSession.healthContext,
          currentSession.conversationState.questionsAsked
        );

        // Hide typing indicator
        setIsTyping(false);

        // Add assistant messages with enhanced response
        const lastMessageId = `msg_${Date.now()}`;
        for (const msg of response.messages) {
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
          if (response.messages.length > 1) {
            await new Promise((resolve) => setTimeout(resolve, 300));
          }
        }

        // Store enhanced response for the last message
        if (apiResponse.enhancedResponse) {
          setEnhancedResponses((prev) => ({
            ...prev,
            [lastMessageId]: apiResponse.enhancedResponse!,
          }));
        }

        // Calculate and set triage level
        if (apiResponse.triageLevel) {
          setTriageLevel(apiResponse.triageLevel as TriageLevel);
          setShowActionButtons(true);
          // Save to episode
          if (currentEpisodeId) {
            setEpisodeTriageLevel(currentEpisodeId, apiResponse.triageLevel as TriageLevel);
          }
        } else if (response.urgencyLevel) {
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

        // Add memory candidates if any
        if (apiResponse.memoryCandidates && apiResponse.memoryCandidates.length > 0) {
          addPendingCandidates(apiResponse.memoryCandidates);
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
        console.error('Error processing message:', error);
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
    [currentSession, isProcessing, conversationId, params, trial, startTrial]
  );

  // Handle action button press
  const handleActionPress = useCallback((action: string, buttonId: string) => {
    switch (action) {
      case 'connect_doctor':
        navigation.navigate('Services' as never, { category: 'video-consult' });
        break;
      case 'book_home_visit':
        navigation.navigate('Services' as never, { category: 'doctor-visit' });
        break;
      case 'save_summary':
        Alert.alert(
          'Summary Saved',
          'Your conversation summary has been saved. You can view it in your Health Memory.',
          [{ text: 'OK' }]
        );
        break;
      default:
        break;
    }
  }, [navigation]);

  // Handle memory candidate save
  const handleSaveMemoryCandidate = useCallback((candidateId: string) => {
    saveCandidate(candidateId, currentSession?.id);
  }, [saveCandidate, currentSession?.id]);

  // Handle memory candidate edit
  const handleEditMemoryCandidate = useCallback((candidateId: string, newValue: string) => {
    // For now, just save with the new value
    // In a full implementation, you'd update the candidate first
    saveCandidate(candidateId, currentSession?.id);
  }, [saveCandidate, currentSession?.id]);

  // Handle quick option selection
  const handleQuickOptionSelect = (option: QuickOption) => {
    handleSendMessage(option.value);
  };

  // Handle follow-up scheduling
  const handleScheduleFollowUp = useCallback((days: number) => {
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
  }, [currentEpisodeId, getEpisode, scheduleFollowUp]);

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
            {currentSession?.healthContext && (() => {
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
            onSubscribe={() => navigation.navigate('PlanDetails' as never, { id: 'ask-carebow' })}
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

function MessageRenderer({ message, onBookService, urgencyLevel, episodeId }: MessageRendererProps) {
  switch (message.contentType) {
    case 'emergency_alert':
      return <EmergencyAlert message={message.text} />;

    case 'guidance':
      return message.guidance ? (
        <GuidanceCard
          guidance={message.guidance}
          urgencyLevel={urgencyLevel as any}
        />
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
    ...typography.label,
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
