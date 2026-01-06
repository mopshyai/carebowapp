/**
 * SOS Button Component
 * Large, accessible emergency button with haptic feedback
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  AccessibilityInfo,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '@/theme';
import { triggerLightHaptic } from '../services/sosService';

// ============================================
// TYPES
// ============================================

interface SOSButtonProps {
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function SOSButton({ onPress, disabled = false, isLoading = false }: SOSButtonProps) {
  const handlePress = useCallback(async () => {
    if (disabled || isLoading) return;

    // Haptic feedback on press
    await triggerLightHaptic();
    onPress();
  }, [onPress, disabled, isLoading]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          disabled && styles.buttonDisabled,
          isLoading && styles.buttonLoading,
        ]}
        onPress={handlePress}
        disabled={disabled || isLoading}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel="Emergency SOS button. Double tap to trigger emergency alert"
        accessibilityRole="button"
        accessibilityHint="Sends emergency alert to your emergency contacts"
      >
        <View style={styles.innerRing}>
          <View style={styles.iconContainer}>
            <Icon
              name="alert-circle"
              size={40}
              color={colors.white}
            />
          </View>
          <Text style={styles.buttonText}>SOS</Text>
          <Text style={styles.subText}>Emergency</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.instructionText}>
        Tap to send emergency alert
      </Text>
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  button: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.error,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  buttonDisabled: {
    backgroundColor: colors.textTertiary,
    shadowOpacity: 0.1,
  },
  buttonLoading: {
    opacity: 0.7,
  },
  innerRing: {
    width: 144,
    height: 144,
    borderRadius: 72,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xxs,
  },
  buttonText: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 2,
  },
  subText: {
    ...typography.caption,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: spacing.xxs,
  },
  instructionText: {
    ...typography.bodySmall,
    color: colors.textTertiary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
