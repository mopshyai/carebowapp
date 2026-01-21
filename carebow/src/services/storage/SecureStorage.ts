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
 */

import * as Keychain from 'react-native-keychain';
import { Platform } from 'react-native';

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

const DEFAULT_OPTIONS: SecureStorageOptions = {
  service: DEFAULT_SERVICE,
  accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
};

const BIOMETRIC_OPTIONS: SecureStorageOptions = {
  ...DEFAULT_OPTIONS,
  accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
};

// ============================================
// SECURE STORAGE CLASS
// ============================================

class SecureStorageService {
  private isAvailable: boolean | null = null;

  /**
   * Check if secure storage is available on this device
   */
  async checkAvailability(): Promise<boolean> {
    if (this.isAvailable !== null) {
      return this.isAvailable;
    }

    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      this.isAvailable = true;

      if (__DEV__) {
        console.log('[SecureStorage] Available. Biometry type:', biometryType);
      }

      return true;
    } catch (error) {
      console.error('[SecureStorage] Not available:', error);
      this.isAvailable = false;
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
    try {
      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

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
    try {
      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

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
    try {
      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

      await Keychain.resetGenericPassword({
        service: `${mergedOptions.service}.${key}`,
      });

      if (__DEV__) {
        console.log(`[SecureStorage] Removed: ${key}`);
      }

      return true;
    } catch (error) {
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
    try {
      const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

      const credentials = await Keychain.getGenericPassword({
        service: `${mergedOptions.service}.${key}`,
      });

      return !!credentials && !!credentials.password;
    } catch {
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
    return this.setItem(key, value, BIOMETRIC_OPTIONS);
  }

  /**
   * Retrieve a value that requires biometric authentication
   */
  async getItemWithBiometrics(
    key: SecureStorageKey
  ): Promise<string | null> {
    return this.getItem(key, BIOMETRIC_OPTIONS);
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
