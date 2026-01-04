/**
 * ChatBubble Component
 * Displays individual messages in the Ask CareBow chat
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '@/types/askCarebow';
import { colors, spacing, radius, typography, shadows } from '@/theme';

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.text}
        </Text>
      </View>
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
});
