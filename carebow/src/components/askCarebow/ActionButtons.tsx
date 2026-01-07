/**
 * ActionButtons Component
 * Displays actionable buttons based on suggested actions from guidance
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { SuggestedAction, ActionType, urgencyConfig } from '../../types/askCarebow';
import { colors, spacing, radius, typography, shadows } from '../../theme';

interface ActionButtonsProps {
  actions: SuggestedAction[];
  onActionPress: (action: SuggestedAction) => void;
}

const actionIcons: Record<ActionType, string> = {
  book_doctor: 'medical',
  request_nurse: 'person',
  rent_equipment: 'hardware-chip',
  book_lab_test: 'flask',
  video_consult: 'videocam',
  call_emergency: 'call',
  monitor_at_home: 'eye',
  no_action_needed: 'checkmark-circle',
};

const actionColors: Record<ActionType, { bg: string; text: string; icon: string }> = {
  call_emergency: {
    bg: colors.error,
    text: colors.textInverse,
    icon: colors.textInverse,
  },
  book_doctor: {
    bg: colors.accent,
    text: colors.textInverse,
    icon: colors.textInverse,
  },
  request_nurse: {
    bg: colors.accent,
    text: colors.textInverse,
    icon: colors.textInverse,
  },
  video_consult: {
    bg: colors.info,
    text: colors.textInverse,
    icon: colors.textInverse,
  },
  book_lab_test: {
    bg: colors.accent,
    text: colors.textInverse,
    icon: colors.textInverse,
  },
  rent_equipment: {
    bg: colors.surface,
    text: colors.textPrimary,
    icon: colors.accent,
  },
  monitor_at_home: {
    bg: colors.surface,
    text: colors.textPrimary,
    icon: colors.accent,
  },
  no_action_needed: {
    bg: colors.surface,
    text: colors.textSecondary,
    icon: colors.success,
  },
};

export function ActionButtons({ actions, onActionPress }: ActionButtonsProps) {
  const handlePress = (action: SuggestedAction) => {
    // Handle emergency call directly
    if (action.type === 'call_emergency') {
      const phoneNumber = Platform.OS === 'ios' ? 'tel://911' : 'tel:911';
      Linking.openURL(phoneNumber);
      return;
    }

    onActionPress(action);
  };

  // Prioritize primary action (first one)
  const primaryAction = actions[0];
  const secondaryActions = actions.slice(1);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recommended Next Steps</Text>

      {/* Primary Action */}
      {primaryAction && (
        <TouchableOpacity
          style={[
            styles.primaryButton,
            { backgroundColor: actionColors[primaryAction.type].bg },
            primaryAction.type === 'call_emergency' && styles.emergencyButton,
          ]}
          onPress={() => handlePress(primaryAction)}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <Icon
              name={actionIcons[primaryAction.type]}
              size={24}
              color={actionColors[primaryAction.type].icon}
            />
            <View style={styles.buttonText}>
              <Text
                style={[
                  styles.primaryButtonLabel,
                  { color: actionColors[primaryAction.type].text },
                ]}
              >
                {primaryAction.label}
              </Text>
              <Text
                style={[
                  styles.primaryButtonDescription,
                  {
                    color:
                      primaryAction.type === 'call_emergency'
                        ? 'rgba(255,255,255,0.8)'
                        : colors.textSecondary,
                  },
                ]}
              >
                {primaryAction.description}
              </Text>
            </View>
          </View>
          <Icon
            name="arrow-forward"
            size={20}
            color={actionColors[primaryAction.type].icon}
          />
        </TouchableOpacity>
      )}

      {/* Secondary Actions */}
      {secondaryActions.length > 0 && (
        <View style={styles.secondaryContainer}>
          {secondaryActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.secondaryButton,
                { backgroundColor: actionColors[action.type].bg },
                actionColors[action.type].bg === colors.surface && styles.secondaryButtonBordered,
              ]}
              onPress={() => handlePress(action)}
              activeOpacity={0.7}
            >
              <Icon
                name={actionIcons[action.type]}
                size={20}
                color={actionColors[action.type].icon}
              />
              <Text
                style={[
                  styles.secondaryButtonLabel,
                  { color: actionColors[action.type].text },
                ]}
              >
                {action.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  title: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.lg,
    ...shadows.button,
  },
  emergencyButton: {
    borderWidth: 2,
    borderColor: colors.error,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  buttonText: {
    flex: 1,
  },
  primaryButtonLabel: {
    ...typography.labelLarge,
  },
  primaryButtonDescription: {
    ...typography.caption,
    marginTop: spacing.xxs,
  },
  secondaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  secondaryButtonBordered: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonLabel: {
    ...typography.label,
  },
});
