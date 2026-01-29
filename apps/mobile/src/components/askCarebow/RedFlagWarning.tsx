/**
 * Red Flag Warning Component
 * Inline calm warning shown when user types urgent symptoms
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography } from '../../theme';

// Red flag keywords that trigger the warning
export const RED_FLAG_KEYWORDS = [
  // Cardiac
  'chest pain',
  'heart attack',
  'heart pain',
  'cardiac',
  // Breathing
  'trouble breathing',
  'can\'t breathe',
  'difficulty breathing',
  'shortness of breath',
  'choking',
  // Stroke
  'stroke',
  'face drooping',
  'arm weakness',
  'slurred speech',
  'sudden numbness',
  // Bleeding
  'severe bleeding',
  'heavy bleeding',
  'won\'t stop bleeding',
  // Neurological
  'seizure',
  'convulsion',
  'unconscious',
  'passed out',
  'fainting',
  'fainted',
  'head injury',
  'head trauma',
  // Mental health
  'suicidal',
  'suicide',
  'want to die',
  'kill myself',
  'end my life',
  // Overdose/Poisoning
  'overdose',
  'poisoning',
  'swallowed',
  // Allergic reaction
  'anaphylaxis',
  'severe allergic',
  'throat swelling',
  'can\'t swallow',
  // Infant-specific
  'infant fever',
  'baby fever',
  'newborn fever',
  'infant not breathing',
  'baby not breathing',
  // Burns/Shock
  'severe burns',
  'electric shock',
];

type RedFlagWarningProps = {
  visible: boolean;
  style?: object;
};

export function RedFlagWarning({ visible, style }: RedFlagWarningProps) {
  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Icon name="alert-circle" size={16} color={colors.warning} />
      </View>
      <Text style={styles.text}>
        If this feels sudden or severe, please seek urgent care now.{' '}
        <Text style={styles.secondaryText}>
          I can still help you think through next steps.
        </Text>
      </Text>
    </Animated.View>
  );
}

/**
 * Check if input text contains red flag keywords
 */
export function detectRedFlags(text: string): boolean {
  const lowerText = text.toLowerCase();
  return RED_FLAG_KEYWORDS.some((keyword) => lowerText.includes(keyword));
}

/**
 * Get matched red flag keywords from input
 */
export function getMatchedRedFlags(text: string): string[] {
  const lowerText = text.toLowerCase();
  return RED_FLAG_KEYWORDS.filter((keyword) => lowerText.includes(keyword));
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.warning,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  iconContainer: {
    marginTop: 2,
  },
  text: {
    flex: 1,
    ...typography.caption,
    color: colors.textPrimary,
    lineHeight: 18,
  },
  secondaryText: {
    color: colors.textSecondary,
  },
});

export default RedFlagWarning;
