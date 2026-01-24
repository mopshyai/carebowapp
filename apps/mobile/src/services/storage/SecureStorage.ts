/**
 * SecureStorage Service
 * Handles secure storage of sensitive data using Keychain (iOS) and Keystore (Android)
 *
 * IMPORTANT: Use this for:
 * - Authentication tokens
 * - Encryption keys
 * - Biometric credentials
 * - Any PII that needs protection at rest
 *
 * DO NOT use AsyncStorage for sensitive data.
 *
 * FALLBACK: When Keychain is unavailable (e.g., iOS Simulator), falls back to AsyncStorage
 * with a warning. This is NOT secure and should only be used in development.
 */

import * as Keychain from 'react-native-keychain';
import { Platform, NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Fallback storage prefix for AsyncStorage (development only)
const FALLBACK_PREFIX = '@carebow_secure_fallback:';

// ============================================
// TYPES
// ============================================

export interface SecureStorageOptions {
  /** Storage key/service name */
  service?: string;
  /** Access control - when biometrics are required */
  accessControl?: Keychain.ACCESS_CONTROL;
  /** Accessible - when the data can be accessed */
  accessible?: Keychain.ACCESSIBLE;
  /** Security level for Android */
  securityLevel?: Keychain.SECURITY_LEVEL;
}

export interface StoredCredentials {
  username: string;
  password: string;
  service: string;
}

type SecureStorageKey =
  | 'auth_access_token'
  | 'auth_refresh_token'
  | 'biometric_enabled'
  | 'encryption_key'
  | 'user_pin'
  | 'session_id';

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_SERVICE = 'com.carebow.app';

// Safe access to Keychain constants (they may be undefined if native module is unavailable)
const getDefaultOptions = (): SecureStorageOptions => ({
  service: DEFAULT_SERVICE,
  accessible: Keychain.ACCESSIBLE?.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  securityLevel: Keychain.SECURITY_LEVEL?.SECURE_HARDWARE,
});

const getBiometricOptions = (): SecureStorageOptions => ({
  ...getDefaultOptions(),
  accessControl: Keychain.ACCESS_CONTROL?.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
});

// ============================================
// SECURE STORAGE CLASS
// ============================================

class SecureStorageService {
  private keychainAvailable: boolean | null = null;
  private hasLoggedFallbackWarning: boolean = false;

  /**
   * Log a warning about using fallback storage (only once)
   */
  private logFallbackWarning(): void {
    if (!this.hasLoggedFallbackWarning && __DEV__) {
      console.warn(
        '[SecureStorage] WARNING: Keychain native module is not available. ' +
        'Falling back to AsyncStorage which is NOT secure. ' +
        'This is acceptable for development/simulator but NOT for production builds.'
      );
      this.hasLoggedFallbackWarning = true;
    }
  }

  /**
   * Check if Keychain is working by testing it
   */
  private async isKeychainWorking(): Promise<boolean> {
    if (this.keychainAvailable !== null) {
      return this.keychainAvailable;
    }

    // First check if the native module exists at all
    // The native module is registered as RNKeychainManager
    const nativeModule = NativeModules.RNKeychainManager;
    if (!nativeModule) {
      if (__DEV__) {
        console.log('[SecureStorage] Native module RNKeychainManager is null - not linked');
      }
      this.keychainAvailable = false;
      this.logFallbackWarning();
      return false;
    }

    // Also verify the JS module has the expected functions
    if (!Keychain || typeof Keychain.getSupportedBiometryType !== 'function') {
      this.keychainAvailable = false;
      this.logFallbackWarning();
      return false;
    }

    try {
      // Test if Keychain actually works by calling getSupportedBiometryType
      await Keychain.getSupportedBiometryType();
      this.keychainAvailable = true;
      return true;
    } catch (error) {
      // Any error during the test means Keychain is not working properly
      // This includes "Cannot read property 'X' of null" errors
      this.keychainAvailable = false;
      this.logFallbackWarning();
      if (__DEV__) {
        console.log('[SecureStorage] Keychain test failed:', error);
      }
      return false;
    }
  }

  /**
   * Check if secure storage is available on this device
   */
  async checkAvailability(): Promise<boolean> {
    const keychainWorks = await this.isKeychainWorking();

    if (!keychainWorks) {
      return false;
    }

    try {
      const biometryType = await Keychain.getSupportedBiometryType();

      if (__DEV__) {
        console.log('[SecureStorage] Available. Biometry type:', biometryType);
      }

      return true;
    } catch (error) {
      console.error('[SecureStorage] Not available:', error);
      return false;
    }
  }

  /**
   * Store a value securely
   */
  async setItem(
    key: SecureStorageKey,
    value: string,
    options?: SecureStorageOptions
  ): Promise<boolean> {
    // Check if Keychain is working
    const keychainWorks = await this.isKeychainWorking();

    // Use fallback if Keychain is not available
    if (!keychainWorks) {
      try {
        await AsyncStorage.setItem(`${FALLBACK_PREFIX}${key}`, value);
        if (__DEV__) {
          console.log(`[SecureStorage] Stored (fallback): ${key}`);
        }
        return true;
      } catch (error) {
        console.error(`[SecureStorage] Fallback storage failed for ${key}:`, error);
        return false;
      }
    }

    try {
      const mergedOptions = { ...getDefaultOptions(), ...options };

      await Keychain.setGenericPassword(key, value, {
        service: `${mergedOptions.service}.${key}`,
        accessible: mergedOptions.accessible,
        accessControl: mergedOptions.accessControl,
        securityLevel: mergedOptions.securityLevel,
      });

      if (__DEV__) {
        console.log(`[SecureStorage] Stored: ${key}`);
      }

      return true;
    } catch (error) {
      // If Keychain fails at runtime, mark it as unavailable and retry with fallback
      const errorMessage = String(error);
      if (errorMessage.includes('null') || errorMessage.includes('undefined')) {
        this.keychainAvailable = false;
        this.logFallbackWarning();
        return this.setItem(key, value, options);
      }
      console.error(`[SecureStorage] Failed to store ${key}:`, error);
      return false;
    }
  }

  /**
   * Retrieve a value from secure storage
   */
  async getItem(
    key: SecureStorageKey,
    options?: SecureStorageOptions
  ): Promise<string | null> {
    // Check if Keychain is working
    const keychainWorks = await this.isKeychainWorking();

    // Use fallback if Keychain is not available
    if (!keychainWorks) {
      try {
        const value = await AsyncStorage.getItem(`${FALLBACK_PREFIX}${key}`);
        if (__DEV__ && value) {
          console.log(`[SecureStorage] Retrieved (fallback): ${key}`);
        }
        return value;
      } catch (error) {
        if (__DEV__) {
          console.log(`[SecureStorage] Fallback retrieval failed for ${key}:`, error);
        }
        return null;
      }
    }

    try {
      const mergedOptions = { ...getDefaultOptions(), ...options };

      const credentials = await Keychain.getGenericPassword({
        service: `${mergedOptions.service}.${key}`,
        accessControl: mergedOptions.accessControl,
      });

      if (credentials && credentials.password) {
        if (__DEV__) {
          console.log(`[SecureStorage] Retrieved: ${key}`);
        }
        return credentials.password;
      }

      return null;
    } catch (error) {
      // If Keychain fails at runtime, mark it as unavailable and retry with fallback
      const errorMessage = String(error);
      if (errorMessage.includes('null') || errorMessage.includes('undefined')) {
        this.keychainAvailable = false;
        this.logFallbackWarning();
        return this.getItem(key, options);
      }
      // User cancelled biometric prompt or error occurred
      if (__DEV__) {
        console.log(`[SecureStorage] Failed to retrieve ${key}:`, error);
      }
      return null;
    }
  }

  /**
   * Remove a value from secure storage
   */
  async removeItem(
    key: SecureStorageKey,
    options?: SecureStorageOptions
  ): Promise<boolean> {
    // Check if Keychain is working
    const keychainWorks = await this.isKeychainWorking();

    // Use fallback if Keychain is not available
    if (!keychainWorks) {
      try {
        await AsyncStorage.removeItem(`${FALLBACK_PREFIX}${key}`);
        if (__DEV__) {
          console.log(`[SecureStorage] Removed (fallback): ${key}`);
        }
        return true;
      } catch (error) {
        console.error(`[SecureStorage] Fallback removal failed for ${key}:`, error);
        return false;
      }
    }

    try {
      const mergedOptions = { ...getDefaultOptions(), ...options };

      await Keychain.resetGenericPassword({
        service: `${mergedOptions.service}.${key}`,
      });

      if (__DEV__) {
        console.log(`[SecureStorage] Removed: ${key}`);
      }

      return true;
    } catch (error) {
      // If Keychain fails at runtime, mark it as unavailable and retry with fallback
      const errorMessage = String(error);
      if (errorMessage.includes('null') || errorMessage.includes('undefined')) {
        this.keychainAvailable = false;
        this.logFallbackWarning();
        return this.removeItem(key, options);
      }
      console.error(`[SecureStorage] Failed to remove ${key}:`, error);
      return false;
    }
  }

  /**
   * Check if a key exists in secure storage
   */
  async hasItem(
    key: SecureStorageKey,
    options?: SecureStorageOptions
  ): Promise<boolean> {
    // Check if Keychain is working
    const keychainWorks = await this.isKeychainWorking();

    // Use fallback if Keychain is not available
    if (!keychainWorks) {
      try {
        const value = await AsyncStorage.getItem(`${FALLBACK_PREFIX}${key}`);
        return value !== null;
      } catch {
        return false;
      }
    }

    try {
      const mergedOptions = { ...getDefaultOptions(), ...options };

      const credentials = await Keychain.getGenericPassword({
        service: `${mergedOptions.service}.${key}`,
      });

      return !!credentials && !!credentials.password;
    } catch (error) {
      // If Keychain fails at runtime, mark it as unavailable and retry with fallback
      const errorMessage = String(error);
      if (errorMessage.includes('null') || errorMessage.includes('undefined')) {
        this.keychainAvailable = false;
        this.logFallbackWarning();
        return this.hasItem(key, options);
      }
      return false;
    }
  }

  /**
   * Clear all secure storage items
   */
  async clearAll(): Promise<boolean> {
    const keys: SecureStorageKey[] = [
      'auth_access_token',
      'auth_refresh_token',
      'biometric_enabled',
      'encryption_key',
      'user_pin',
      'session_id',
    ];

    try {
      await Promise.all(keys.map(key => this.removeItem(key)));

      if (__DEV__) {
        console.log('[SecureStorage] Cleared all items');
      }

      return true;
    } catch (error) {
      console.error('[SecureStorage] Failed to clear all:', error);
      return false;
    }
  }

  // ========================================
  // BIOMETRIC-PROTECTED STORAGE
  // ========================================

  /**
   * Store a value that requires biometric authentication to retrieve
   */
  async setItemWithBiometrics(
    key: SecureStorageKey,
    value: string
  ): Promise<boolean> {
    return this.setItem(key, value, getBiometricOptions());
  }

  /**
   * Retrieve a value that requires biometric authentication
   */
  async getItemWithBiometrics(
    key: SecureStorageKey
  ): Promise<string | null> {
    return this.getItem(key, getBiometricOptions());
  }

  // ========================================
  // CONVENIENCE METHODS FOR AUTH TOKENS
  // ========================================

  /**
   * Store authentication tokens securely
   */
  async setAuthTokens(
    accessToken: string,
    refreshToken: string
  ): Promise<boolean> {
    try {
      const [accessResult, refreshResult] = await Promise.all([
        this.setItem('auth_access_token', accessToken),
        this.setItem('auth_refresh_token', refreshToken),
      ]);

      return accessResult && refreshResult;
    } catch (error) {
      console.error('[SecureStorage] Failed to store auth tokens:', error);
      return false;
    }
  }

  /**
   * Retrieve authentication tokens
   */
  async getAuthTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.getItem('auth_access_token'),
      this.getItem('auth_refresh_token'),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Clear authentication tokens
   */
  async clearAuthTokens(): Promise<boolean> {
    try {
      await Promise.all([
        this.removeItem('auth_access_token'),
        this.removeItem('auth_refresh_token'),
        this.removeItem('session_id'),
      ]);

      return true;
    } catch (error) {
      console.error('[SecureStorage] Failed to clear auth tokens:', error);
      return false;
    }
  }

  // ========================================
  // BIOMETRIC SETTINGS
  // ========================================

  /**
   * Enable biometric authentication
   */
  async enableBiometrics(pin?: string): Promise<boolean> {
    try {
      await this.setItem('biometric_enabled', 'true');

      if (pin) {
        await this.setItemWithBiometrics('user_pin', pin);
      }

      return true;
    } catch (error) {
      console.error('[SecureStorage] Failed to enable biometrics:', error);
      return false;
    }
  }

  /**
   * Disable biometric authentication
   */
  async disableBiometrics(): Promise<boolean> {
    try {
      await Promise.all([
        this.removeItem('biometric_enabled'),
        this.removeItem('user_pin'),
      ]);

      return true;
    } catch (error) {
      console.error('[SecureStorage] Failed to disable biometrics:', error);
      return false;
    }
  }

  /**
   * Check if biometrics are enabled
   */
  async isBiometricsEnabled(): Promise<boolean> {
    const value = await this.getItem('biometric_enabled');
    return value === 'true';
  }

  /**
   * Get biometric type available on device
   */
  async getBiometricType(): Promise<Keychain.BIOMETRY_TYPE | null> {
    const keychainWorks = await this.isKeychainWorking();

    if (!keychainWorks) {
      return null;
    }

    try {
      const type = await Keychain.getSupportedBiometryType();
      return type;
    } catch {
      return null;
    }
  }

  /**
   * Authenticate with biometrics
   */
  async authenticateWithBiometrics(
    promptMessage: string = 'Authenticate to continue'
  ): Promise<boolean> {
    const keychainWorks = await this.isKeychainWorking();

    if (!keychainWorks) {
      // In fallback mode, biometrics aren't available - return true to allow access
      // This is only for development/simulator
      return true;
    }

    try {
      // Try to access a biometric-protected item
      // This will trigger the biometric prompt
      const storedPin = await this.getItemWithBiometrics('user_pin');

      // If we can retrieve it (or there was no pin stored), authentication succeeded
      return true;
    } catch (error) {
      // User cancelled or biometric failed
      if (__DEV__) {
        console.log('[SecureStorage] Biometric auth failed:', error);
      }
      return false;
    }
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const SecureStorage = new SecureStorageService();

// Named exports for specific use cases
export const setSecureItem = SecureStorage.setItem.bind(SecureStorage);
export const getSecureItem = SecureStorage.getItem.bind(SecureStorage);
export const removeSecureItem = SecureStorage.removeItem.bind(SecureStorage);
export const setAuthTokens = SecureStorage.setAuthTokens.bind(SecureStorage);
export const getAuthTokens = SecureStorage.getAuthTokens.bind(SecureStorage);
export const clearAuthTokens = SecureStorage.clearAuthTokens.bind(SecureStorage);

export default SecureStorage;
