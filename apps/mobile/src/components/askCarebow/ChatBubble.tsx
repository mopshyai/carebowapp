/**
 * ChatBubble Component
 * Displays individual messages in the Ask CareBow chat
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { Message } from '../../types/askCarebow';
import { colors, spacing, radius, typography, shadows } from '../../theme';
import { getQuestionExplanation } from '../../utils/questionExplanations';
import { FeedbackButtons } from './FeedbackButtons';

interface ChatBubbleProps {
  message: Message;
  episodeId?: string;
  showFeedback?: boolean;
}

export function ChatBubble({ message, episodeId, showFeedback = true }: ChatBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // Get explanation for assistant questions (memoized to avoid recalculation)
  const explanation = useMemo(() => {
    if (isUser) return null;
    return getQuestionExplanation(message.text);
  }, [isUser, message.text]);

  // Only show feedback for assistant messages with sufficient content
  const shouldShowFeedback = useMemo(() => {
    if (!showFeedback || !isAssistant || !episodeId) return false;
    // Only show for messages with substantial content (not just short acknowledgments)
    return message.text.length > 50;
  }, [showFeedback, isAssistant, episodeId, message.text]);

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.text}
        </Text>
      </View>
      {/* "Why I'm asking" explanation for critical questions */}
      {explanation && (
        <View style={styles.explanationContainer}>
          <Icon name="information-circle-outline" size={12} color={colors.textTertiary} />
          <Text style={styles.explanationText}>{explanation}</Text>
        </View>
      )}
      {/* Feedback buttons for assistant messages */}
      {shouldShowFeedback && episodeId && (
        <FeedbackButtons
          episodeId={episodeId}
          messageId={message.id}
          messageSnippet={message.text}
        />
      )}
      <Text style={[styles.timestamp, isUser ? styles.userTimestamp : styles.assistantTimestamp]}>
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xxs,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    ...shadows.subtle,
  },
  userBubble: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: radius.xs,
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: radius.xs,
  },
  text: {
    ...typography.body,
  },
  userText: {
    color: colors.textInverse,
  },
  assistantText: {
    color: colors.textPrimary,
  },
  timestamp: {
    ...typography.tiny,
    marginTop: spacing.xxs,
  },
  userTimestamp: {
    color: colors.textTertiary,
  },
  assistantTimestamp: {
    color: colors.textTertiary,
  },
  explanationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    marginTop: spacing.xxs,
    paddingHorizontal: spacing.xs,
  },
  explanationText: {
    ...typography.tiny,
    color: colors.textTertiary,
    fontStyle: 'italic',
    flex: 1,
  },
});
