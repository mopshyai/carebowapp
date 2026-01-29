/**
 * Disclaimer Footer Component (PRD V1 Spec)
 * Global footer disclaimer for symptom-related screens
 * Provides legal/medical disclaimer in a consistent format
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography } from '@/theme';
import { SYMPTOM_DISCLAIMER } from '@/types/symptomEntry';

type DisclaimerType = 'short' | 'full' | 'emergency';

interface DisclaimerFooterProps {
  /**
   * Type of disclaimer to show
   * - short: Brief one-liner (default)
   * - full: Complete medical disclaimer
   * - emergency: Emergency-focused disclaimer with call button
   */
  type?: DisclaimerType;

  /**
   * Whether to show the emergency call button (only for emergency type)
   */
  showEmergencyButton?: boolean;

  /**
   * Custom disclaimer text (overrides type-based text)
   */
  customText?: string;

  /**
   * Additional styles for the container
   */
  style?: object;
}

export default function DisclaimerFooter({
  type = 'short',
  showEmergencyButton = false,
  customText,
  style,
}: DisclaimerFooterProps) {
  const handleEmergencyCall = () => {
    Linking.openURL('tel:911');
  };

  const disclaimerText = customText || SYMPTOM_DISCLAIMER[type];
  const isEmergencyType = type === 'emergency';

  if (isEmergencyType && showEmergencyButton) {
    return (
      <View style={[styles.emergencyContainer, style]}>
        <View style={styles.emergencyHeader}>
          <Icon name="warning" size={20} color={colors.error} />
          <Text style={styles.emergencyTitle}>Medical Emergency?</Text>
        </View>
        <Text style={styles.emergencyText}>{disclaimerText}</Text>
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={handleEmergencyCall}
          activeOpacity={0.8}
        >
          <Icon name="call" size={18} color={colors.white} />
          <Text style={styles.emergencyButtonText}>Call 911</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, type === 'full' && styles.containerFull, style]}>
      <Icon
        name="information-circle-outline"
        size={type === 'full' ? 20 : 16}
        color={colors.textTertiary}
      />
      <Text style={[styles.text, type === 'full' && styles.textFull]}>
        {disclaimerText}
      </Text>
    </View>
  );
}

/**
 * Compact inline disclaimer for use within cards
 */
export function DisclaimerInline({ text }: { text?: string }) {
  return (
    <View style={styles.inlineContainer}>
      <Icon name="information-circle-outline" size={14} color={colors.textTertiary} />
      <Text style={styles.inlineText}>{text || SYMPTOM_DISCLAIMER.short}</Text>
    </View>
  );
}

/**
 * Banner-style disclaimer for critical screens
 */
export function DisclaimerBanner({
  type = 'full',
  onDismiss,
}: {
  type?: DisclaimerType;
  onDismiss?: () => void;
}) {
  return (
    <View style={styles.bannerContainer}>
      <View style={styles.bannerContent}>
        <Icon name="shield-checkmark-outline" size={24} color={colors.info} />
        <View style={styles.bannerTextContainer}>
          <Text style={styles.bannerTitle}>Important Notice</Text>
          <Text style={styles.bannerText}>{SYMPTOM_DISCLAIMER[type]}</Text>
        </View>
      </View>
      {onDismiss && (
        <TouchableOpacity style={styles.bannerDismiss} onPress={onDismiss}>
          <Icon name="close" size={20} color={colors.textTertiary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Standard Container
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface2,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  containerFull: {
    borderRadius: radius.lg,
    padding: spacing.lg,
  },
  text: {
    flex: 1,
    ...typography.caption,
    color: colors.textTertiary,
    lineHeight: 18,
  },
  textFull: {
    ...typography.bodySmall,
    lineHeight: 20,
  },

  // Inline variant
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    opacity: 0.8,
  },
  inlineText: {
    ...typography.tiny,
    color: colors.textTertiary,
  },

  // Emergency variant
  emergencyContainer: {
    backgroundColor: colors.errorSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.error,
    padding: spacing.lg,
    gap: spacing.md,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  emergencyTitle: {
    ...typography.h4,
    color: colors.error,
  },
  emergencyText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  emergencyButtonText: {
    ...typography.labelLarge,
    color: colors.white,
  },

  // Banner variant
  bannerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.infoSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.info,
    padding: spacing.lg,
  },
  bannerContent: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.md,
  },
  bannerTextContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  bannerTitle: {
    ...typography.label,
    color: colors.info,
  },
  bannerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bannerDismiss: {
    padding: spacing.xxs,
    marginLeft: spacing.sm,
  },
});
