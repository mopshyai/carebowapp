/**
 * useBiometrics Hook
 * Provides biometric authentication functionality for app unlock and secure actions
 */

import { useState, useEffect, useCallback } from 'react';
import * as Keychain from 'react-native-keychain';
import { Alert, Platform } from 'react-native';
import { SecureStorage } from '@/services/storage/SecureStorage';

// ============================================
// TYPES
// ============================================

export type BiometryType = 'FaceID' | 'TouchID' | 'Fingerprint' | 'Iris' | null;

export interface BiometricState {
  /** Is biometric hardware available */
  isAvailable: boolean;
  /** Type of biometric available */
  biometryType: BiometryType;
  /** Is biometric enabled by user */
  isEnabled: boolean;
  /** Is currently authenticating */
  isAuthenticating: boolean;
  /** Display name for the biometric type */
  biometryLabel: string;
}

export interface UseBiometricsReturn extends BiometricState {
  /** Check if biometrics are available and enabled */
  checkBiometrics: () => Promise<void>;
  /** Enable biometric authentication */
  enableBiometrics: () => Promise<boolean>;
  /** Disable biometric authentication */
  disableBiometrics: () => Promise<boolean>;
  /** Authenticate using biometrics */
  authenticate: (reason?: string) => Promise<boolean>;
  /** Get human-readable biometry name */
  getBiometryLabel: () => string;
}

// ============================================
// CONSTANTS
// ============================================

const BIOMETRY_LABELS: Record<string, string> = {
  FaceID: 'Face ID',
  TouchID: 'Touch ID',
  Fingerprint: 'Fingerprint',
  Iris: 'Iris',
};

// ============================================
// HOOK IMPLEMENTATION
// ============================================

export function useBiometrics(): UseBiometricsReturn {
  const [state, setState] = useState<BiometricState>({
    isAvailable: false,
    biometryType: null,
    isEnabled: false,
    isAuthenticating: false,
    biometryLabel: 'Biometrics',
  });

  /**
   * Check device capabilities and user preferences
   */
  const checkBiometrics = useCallback(async () => {
    try {
      // Check what biometry is available on device
      const biometryType = await Keychain.getSupportedBiometryType();

      // Check if user has enabled biometrics in app
      const isEnabled = await SecureStorage.isBiometricsEnabled();

      const typeName = biometryType as BiometryType;
      const label = typeName ? BIOMETRY_LABELS[typeName] || 'Biometrics' : 'Biometrics';

      setState({
        isAvailable: biometryType !== null,
        biometryType: typeName,
        isEnabled,
        isAuthenticating: false,
        biometryLabel: label,
      });

      if (__DEV__) {
        console.log('[Biometrics] Available:', biometryType, 'Enabled:', isEnabled);
      }
    } catch (error) {
      console.error('[Biometrics] Check failed:', error);
      setState(prev => ({
        ...prev,
        isAvailable: false,
        biometryType: null,
      }));
    }
  }, []);

  /**
   * Enable biometric authentication
   */
  const enableBiometrics = useCallback(async (): Promise<boolean> => {
    if (!state.isAvailable) {
      Alert.alert(
        'Biometrics Unavailable',
        `${state.biometryLabel} is not available on this device.`,
        [{ text: 'OK' }]
      );
      return false;
    }

    try {
      setState(prev => ({ ...prev, isAuthenticating: true }));

      // First, verify biometrics work by triggering a prompt
      const credentials = await Keychain.setGenericPassword(
        'biometric_test',
        'enabled',
        {
          service: 'com.carebow.app.biometric_check',
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }
      );

      if (credentials) {
        // Successfully authenticated, enable biometrics
        await SecureStorage.enableBiometrics();

        setState(prev => ({
          ...prev,
          isEnabled: true,
          isAuthenticating: false,
        }));

        if (__DEV__) {
          console.log('[Biometrics] Enabled successfully');
        }

        return true;
      }

      setState(prev => ({ ...prev, isAuthenticating: false }));
      return false;
    } catch (error) {
      console.error('[Biometrics] Enable failed:', error);
      setState(prev => ({ ...prev, isAuthenticating: false }));

      // Show error to user
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (!errorMessage.includes('cancel')) {
        Alert.alert(
          'Setup Failed',
          `Could not enable ${state.biometryLabel}. Please try again.`,
          [{ text: 'OK' }]
        );
      }

      return false;
    }
  }, [state.isAvailable, state.biometryLabel]);

  /**
   * Disable biometric authentication
   */
  const disableBiometrics = useCallback(async (): Promise<boolean> => {
    try {
      await SecureStorage.disableBiometrics();

      // Clean up test credential
      await Keychain.resetGenericPassword({
        service: 'com.carebow.app.biometric_check',
      });

      setState(prev => ({
        ...prev,
        isEnabled: false,
      }));

      if (__DEV__) {
        console.log('[Biometrics] Disabled successfully');
      }

      return true;
    } catch (error) {
      console.error('[Biometrics] Disable failed:', error);
      return false;
    }
  }, []);

  /**
   * Authenticate with biometrics
   */
  const authenticate = useCallback(
    async (reason?: string): Promise<boolean> => {
      if (!state.isAvailable) {
        if (__DEV__) {
          console.log('[Biometrics] Not available for authentication');
        }
        return false;
      }

      try {
        setState(prev => ({ ...prev, isAuthenticating: true }));

        // Try to access a biometric-protected credential
        const credentials = await Keychain.getGenericPassword({
          service: 'com.carebow.app.biometric_check',
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
          authenticationPrompt: {
            title: reason || 'Authenticate',
            subtitle: `Use ${state.biometryLabel} to continue`,
            description: Platform.OS === 'android' ? 'Confirm your identity' : undefined,
            cancel: 'Cancel',
          },
        });

        setState(prev => ({ ...prev, isAuthenticating: false }));

        if (credentials) {
          if (__DEV__) {
            console.log('[Biometrics] Authentication successful');
          }
          return true;
        }

        return false;
      } catch (error) {
        setState(prev => ({ ...prev, isAuthenticating: false }));

        const errorMessage = error instanceof Error ? error.message : '';

        // User cancelled - don't show error
        if (
          errorMessage.includes('cancel') ||
          errorMessage.includes('Cancel') ||
          errorMessage.includes('user canceled')
        ) {
          if (__DEV__) {
            console.log('[Biometrics] User cancelled authentication');
          }
          return false;
        }

        // Too many attempts
        if (errorMessage.includes('locked') || errorMessage.includes('disabled')) {
          Alert.alert(
            'Biometrics Locked',
            `${state.biometryLabel} is temporarily locked. Please use your device passcode.`,
            [{ text: 'OK' }]
          );
          return false;
        }

        if (__DEV__) {
          console.log('[Biometrics] Authentication failed:', errorMessage);
        }

        return false;
      }
    },
    [state.isAvailable, state.biometryLabel]
  );

  /**
   * Get human-readable biometry label
   */
  const getBiometryLabel = useCallback((): string => {
    return state.biometryLabel;
  }, [state.biometryLabel]);

  // Check biometrics on mount
  useEffect(() => {
    checkBiometrics();
  }, [checkBiometrics]);

  return {
    ...state,
    checkBiometrics,
    enableBiometrics,
    disableBiometrics,
    authenticate,
    getBiometryLabel,
  };
}

export default useBiometrics;
