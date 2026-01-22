/**
 * BiometricLock Component
 * Full-screen lock that requires biometric authentication to dismiss
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius } from '@/theme';
import { useBiometrics } from '@/hooks/useBiometrics';
import { Button } from '@/components/ui/Button';

// ============================================
// TYPES
// ============================================

export interface BiometricLockProps {
  /** Called when authentication succeeds */
  onUnlock: () => void;
  /** Called when user chooses to use passcode/PIN instead */
  onUsePasscode?: () => void;
  /** Show option to use passcode */
  showPasscodeOption?: boolean;
  /** Auto-prompt for biometrics on mount */
  autoPrompt?: boolean;
  /** Custom title */
  title?: string;
  /** Custom subtitle */
  subtitle?: string;
}

// ============================================
// COMPONENT
// ============================================

export function BiometricLock({
  onUnlock,
  onUsePasscode,
  showPasscodeOption = true,
  autoPrompt = true,
  title = 'CareBow',
  subtitle = 'Authenticate to continue',
}: BiometricLockProps) {
  const insets = useSafeAreaInsets();
  const {
    isAvailable,
    biometryType,
    biometryLabel,
    isAuthenticating,
    authenticate,
  } = useBiometrics();

  /**
   * Handle biometric authentication
   */
  const handleAuthenticate = useCallback(async () => {
    if (isAuthenticating) return;

    const success = await authenticate('Unlock CareBow');

    if (success) {
      onUnlock();
    }
  }, [authenticate, isAuthenticating, onUnlock]);

  // Auto-prompt on mount
  useEffect(() => {
    if (autoPrompt && isAvailable) {
      // Small delay to ensure component is fully mounted
      const timer = setTimeout(handleAuthenticate, 500);
      return () => clearTimeout(timer);
    }
  }, [autoPrompt, isAvailable, handleAuthenticate]);

  /**
   * Get icon name based on biometry type
   */
  const getBiometryIcon = (): string => {
    switch (biometryType) {
      case 'FaceID':
        return 'scan-outline';
      case 'TouchID':
      case 'Fingerprint':
        return 'finger-print-outline';
      case 'Iris':
        return 'eye-outline';
      default:
        return 'lock-closed-outline';
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.accent} />

      {/* Logo/Brand */}
      <View style={styles.brandSection}>
        <View style={styles.logoContainer}>
          <Icon name="heart" size={48} color={colors.white} />
        </View>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      {/* Biometric Prompt Area */}
      <View style={styles.authSection}>
        {isAvailable ? (
          <>
            <TouchableOpacity
              style={[
                styles.biometricButton,
                isAuthenticating && styles.biometricButtonActive,
              ]}
              onPress={handleAuthenticate}
              disabled={isAuthenticating}
              activeOpacity={0.8}
            >
              <Icon
                name={getBiometryIcon()}
                size={64}
                color={isAuthenticating ? colors.accent : colors.white}
              />
            </TouchableOpacity>

            <Text style={styles.biometricLabel}>
              {isAuthenticating ? 'Authenticating...' : `Tap to use ${biometryLabel}`}
            </Text>

            <Button
              title={`Use ${biometryLabel}`}
              onPress={handleAuthenticate}
              variant="outline"
              loading={isAuthenticating}
              style={styles.unlockButton}
            />
          </>
        ) : (
          <View style={styles.unavailableSection}>
            <Icon name="lock-closed-outline" size={64} color={colors.textTertiary} />
            <Text style={styles.unavailableText}>
              Biometric authentication is not available on this device
            </Text>
          </View>
        )}
      </View>

      {/* Passcode Option */}
      {showPasscodeOption && onUsePasscode && (
        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
          <TouchableOpacity
            style={styles.passcodeButton}
            onPress={onUsePasscode}
          >
            <Icon name="keypad-outline" size={20} color={colors.white} />
            <Text style={styles.passcodeText}>Use Passcode Instead</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.accent,
  },
  brandSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  authSection: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  biometricButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  biometricButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderColor: colors.accent,
  },
  biometricLabel: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.xl,
  },
  unlockButton: {
    minWidth: 200,
    borderColor: colors.white,
  },
  unavailableSection: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  unavailableText: {
    ...typography.body,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  passcodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  passcodeText: {
    ...typography.body,
    color: colors.white,
    marginLeft: spacing.sm,
  },
});

export default BiometricLock;
