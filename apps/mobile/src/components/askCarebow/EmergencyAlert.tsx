/**
 * EmergencyAlert Component
 * Displays emergency alert with prominent styling and call-to-action
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../../theme';

interface EmergencyAlertProps {
  message: string;
  detectedSymptoms?: string[];
}

export function EmergencyAlert({ message, detectedSymptoms }: EmergencyAlertProps) {
  const handleCallEmergency = () => {
    const phoneNumber = Platform.OS === 'ios' ? 'tel://911' : 'tel:911';
    Linking.openURL(phoneNumber);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon name="warning" size={24} color={colors.error} />
        </View>
        <Text style={styles.title}>Emergency Alert</Text>
      </View>

      <Text style={styles.message}>{message}</Text>

      {detectedSymptoms && detectedSymptoms.length > 0 && (
        <View style={styles.symptomsContainer}>
          <Text style={styles.symptomsLabel}>Detected concerns:</Text>
          {detectedSymptoms.map((symptom, index) => (
            <Text key={index} style={styles.symptom}>
              {symptom}
            </Text>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.emergencyButton}
          onPress={handleCallEmergency}
          activeOpacity={0.8}
        >
          <Icon name="call" size={20} color={colors.textInverse} />
          <Text style={styles.emergencyButtonText}>Call 911</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.instructions}>
        <Text style={styles.instructionsTitle}>While waiting for help:</Text>
        <View style={styles.instructionItem}>
          <Icon name="checkmark-circle" size={16} color={colors.accent} />
          <Text style={styles.instructionText}>Stay calm and try to remain still</Text>
        </View>
        <View style={styles.instructionItem}>
          <Icon name="checkmark-circle" size={16} color={colors.accent} />
          <Text style={styles.instructionText}>Have someone stay with you if possible</Text>
        </View>
        <View style={styles.instructionItem}>
          <Icon name="checkmark-circle" size={16} color={colors.accent} />
          <Text style={styles.instructionText}>Don't drive yourself to the hospital</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.errorSoft,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.error,
    padding: spacing.md,
    marginVertical: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  title: {
    ...typography.h3,
    color: colors.error,
    flex: 1,
  },
  message: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  symptomsContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  symptomsLabel: {
    ...typography.labelSmall,
    color: colors.textSecondary,
    marginBottom: spacing.xxs,
  },
  symptom: {
    ...typography.body,
    color: colors.error,
  },
  actions: {
    marginBottom: spacing.md,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    gap: spacing.xs,
    ...shadows.button,
  },
  emergencyButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
  instructions: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  instructionsTitle: {
    ...typography.label,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  instructionText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
});
