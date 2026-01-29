/**
 * QuickOptionButtons Component
 * Displays quick response options for the user to select
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { QuickOption } from '../../types/askCarebow';
import { colors, spacing, radius, typography, shadows } from '../../theme';

interface QuickOptionButtonsProps {
  options: QuickOption[];
  onSelect: (option: QuickOption) => void;
  disabled?: boolean;
}

export function QuickOptionButtons({ options, onSelect, disabled }: QuickOptionButtonsProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.button, disabled && styles.buttonDisabled]}
            onPress={() => onSelect(option)}
            disabled={disabled}
            activeOpacity={0.7}
          >
            <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.xs,
    gap: spacing.xs,
  },
  button: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.accent,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    ...shadows.subtle,
  },
  buttonDisabled: {
    borderColor: colors.border,
    backgroundColor: colors.surface2,
  },
  buttonText: {
    ...typography.label,
    color: colors.accent,
  },
  buttonTextDisabled: {
    color: colors.textTertiary,
  },
});
