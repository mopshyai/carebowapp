/**
 * RequestTextArea Component
 * Multi-line text input for service requests
 */

import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { colors, spacing, radius, typography } from '../../theme';

interface RequestTextAreaProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  maxLength?: number;
}

export function RequestTextArea({
  value,
  onChangeText,
  placeholder = 'Describe your request...',
  label = 'Your Request',
  maxLength = 500,
}: RequestTextAreaProps) {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={maxLength}
        />
        <Text style={styles.charCount}>
          {value.length}/{maxLength}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  textInput: {
    minHeight: 120,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  charCount: {
    ...typography.tiny,
    color: colors.textTertiary,
    textAlign: 'right',
    paddingRight: spacing.sm,
    paddingBottom: spacing.sm,
  },
});
