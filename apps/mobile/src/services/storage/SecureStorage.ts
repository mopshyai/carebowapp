/**
 * SecureStorage Service
 * Handles sensitive data with iOS Keychain / Android Keystore.
 *
 * Production invariant: authentication tokens, encryption keys, PINs, and
 * biometric credentials must never silently fall back to AsyncStorage.
 * Development builds may use the fallback so simulators remain usable.
 */

import * as Keychain from 'react-native-keychain';
import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { allowInsecureStorageFallback } from './storageSecurityPolicy';

const FALLBACK_PREFIX = '@carebow_secure_fallback:';
const DEFAULT_SERVICE = 'com.carebow.app';

export interface SecureStorageOptions {
  service?: string;
  accessControl?: Keychain.ACCESS_CONTROL;
  accessible?: Keychain.ACCESSIBLE;
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

const getDefaultOptions = (): SecureStorageOptions => ({
  service: DEFAULT_SERVICE,
  accessible: Keychain.ACCESSIBLE?.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  securityLevel: Keychain.SECURITY_LEVEL?.SECURE_HARDWARE,
});

const getBiometricOptions = (): SecureStorageOptions => ({
  ...getDefaultOptions(),
  accessControl: Keychain.ACCESS_CONTROL?.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
});

const canUseInsecureFallback = (): boolean => allowInsecureStorageFallback(__DEV__);

class SecureStorageService {
  private keychainAvailable: boolean | null = null;
  private hasLoggedStorageFailure = false;

  private logStorageUnavailable(reason?: unknown): void {
    if (this.hasLoggedStorageFailure) return;
    this.hasLoggedStorageFailure = true;

    if (canUseInsecureFallback()) {
      console.warn(
        '[SecureStorage] Native secure storage is unavailable. Using the development-only ' +
          'AsyncStorage fallback. Never ship a production build in this state.',
        reason ?? ''
      );
      return;
    }

    console.error(
      '[SecureStorage] Native secure storage is unavailable in production. ' +
        'Refusing to persist or retrieve sensitive data through AsyncStorage.',
      reason ?? ''
    );
  }

  private fallbackKey(key: SecureStorageKey): string {
    return `${FALLBACK_PREFIX}${key}`;
  }

  private async setFallback(key: SecureStorageKey, value: string): Promise<boolean> {
    if (!canUseInsecureFallback()) {
      this.logStorageUnavailable();
      return false;
    }

    try {
      await AsyncStorage.setItem(this.fallbackKey(key), value);
      if (__DEV__) console.log(`[SecureStorage] Stored (development fallback): ${key}`);
      return true;
    } catch (error) {
      console.error(`[SecureStorage] Development fallback write failed for ${key}:`, error);
      return false;
    }
  }

  private async getFallback(key: SecureStorageKey): Promise<string | null> {
    if (!canUseInsecureFallback()) {
      this.logStorageUnavailable();
      return null;
    }

    try {
      const value = await AsyncStorage.getItem(this.fallbackKey(key));
      if (__DEV__ && value) {
        console.log(`[SecureStorage] Retrieved (development fallback): ${key}`);
      }
      return value;
    } catch (error) {
      if (__DEV__) console.log(`[SecureStorage] Development fallback read failed for ${key}:`, error);
      return null;
    }
  }

  /** Remove any legacy/development plaintext copy. Safe in every build. */
  private async removeFallback(key: SecureStorageKey): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(this.fallbackKey(key));
      return true;
    } catch (error) {
      console.error(`[SecureStorage] Failed to remove fallback copy for ${key}:`, error);
      return false;
    }
  }

  private async isKeychainWorking(): Promise<boolean> {
    if (this.keychainAvailable !== null) return this.keychainAvailable;

    const nativeModule = NativeModules.RNKeychainManager;
    if (!nativeModule) {
      this.keychainAvailable = false;
      this.logStorageUnavailable('RNKeychainManager is not linked');
      return false;
    }

    if (!Keychain || typeof Keychain.getSupportedBiometryType !== 'function') {
      this.keychainAvailable = false;
      this.logStorageUnavailable('react-native-keychain API is unavailable');
      return false;
    }

    try {
      await Keychain.getSupportedBiometryType();
      this.keychainAvailable = true;
      return true;
    } catch (error) {
      this.keychainAvailable = false;
      this.logStorageUnavailable(error);
      return false;
    }
  }

  async checkAvailability(): Promise<boolean> {
    if (!(await this.isKeychainWorking())) return false;

    try {
      await Keychain.getSupportedBiometryType();
      return true;
    } catch (error) {
      this.keychainAvailable = false;
      this.logStorageUnavailable(error);
      return false;
    }
  }

  async setItem(
    key: SecureStorageKey,
    value: string,
    options?: SecureStorageOptions
  ): Promise<boolean> {
    if (!(await this.isKeychainWorking())) {
      return this.setFallback(key, value);
    }

    const mergedOptions = { ...getDefaultOptions(), ...options };

    try {
      await Keychain.setGenericPassword(key, value, {
        service: `${mergedOptions.service}.${key}`,
        accessible: mergedOptions.accessible,
        accessControl: mergedOptions.accessControl,
        securityLevel: mergedOptions.securityLevel,
      });

      // A previous development build or old app version may have left a copy.
      await this.removeFallback(key);
      if (__DEV__) console.log(`[SecureStorage] Stored securely: ${key}`);
      return true;
    } catch (error) {
      const errorMessage = String(error);

      const isCryptoFailure =
        errorMessage.includes('CryptoFailedException') ||
        errorMessage.includes('security guarantee') ||
        errorMessage.includes('Cannot generate keys');
      const askedForSecureHardware =
        (options?.securityLevel ?? getDefaultOptions().securityLevel) ===
        Keychain.SECURITY_LEVEL?.SECURE_HARDWARE;

      // Falling back from hardware-backed to OS software-backed Keychain/Keystore
      // is acceptable; both remain native secure storage. AsyncStorage is not.
      if (isCryptoFailure && askedForSecureHardware && Keychain.SECURITY_LEVEL?.ANY) {
        try {
          await Keychain.setGenericPassword(key, value, {
            service: `${mergedOptions.service}.${key}`,
            accessible: mergedOptions.accessible,
            accessControl: mergedOptions.accessControl,
            securityLevel: Keychain.SECURITY_LEVEL.ANY,
          });
          await this.removeFallback(key);
          if (__DEV__) console.log(`[SecureStorage] Stored securely (software-backed): ${key}`);
          return true;
        } catch (retryError) {
          this.logStorageUnavailable(retryError);
          return this.setFallback(key, value);
        }
      }

      if (errorMessage.includes('null') || errorMessage.includes('undefined')) {
        this.keychainAvailable = false;
      }
      this.logStorageUnavailable(error);
      return this.setFallback(key, value);
    }
  }

  async getItem(key: SecureStorageKey, options?: SecureStorageOptions): Promise<string | null> {
    if (!(await this.isKeychainWorking())) {
      return this.getFallback(key);
    }

    try {
      const mergedOptions = { ...getDefaultOptions(), ...options };
      const credentials = await Keychain.getGenericPassword({
        service: `${mergedOptions.service}.${key}`,
        accessControl: mergedOptions.accessControl,
      });

      if (credentials && credentials.password) {
        await this.removeFallback(key);
        if (__DEV__) console.log(`[SecureStorage] Retrieved securely: ${key}`);
        return credentials.password;
      }

      // Only development builds may consult a plaintext fallback bucket.
      return this.getFallback(key);
    } catch (error) {
      const errorMessage = String(error);
      if (errorMessage.includes('null') || errorMessage.includes('undefined')) {
        this.keychainAvailable = false;
      }
      this.logStorageUnavailable(error);
      return this.getFallback(key);
    }
  }

  async removeItem(key: SecureStorageKey, options?: SecureStorageOptions): Promise<boolean> {
    const fallbackRemoved = await this.removeFallback(key);
    const keychainWorks = await this.isKeychainWorking();

    if (!keychainWorks) {
      // In production, inability to reach Keychain means we cannot prove the
      // secure copy was deleted. Report failure rather than pretending logout
      // cleanup succeeded.
      return canUseInsecureFallback() ? fallbackRemoved : false;
    }

    try {
      const mergedOptions = { ...getDefaultOptions(), ...options };
      await Keychain.resetGenericPassword({
        service: `${mergedOptions.service}.${key}`,
      });
      if (__DEV__) console.log(`[SecureStorage] Removed securely: ${key}`);
      return fallbackRemoved;
    } catch (error) {
      const errorMessage = String(error);
      if (errorMessage.includes('null') || errorMessage.includes('undefined')) {
        this.keychainAvailable = false;
      }
      this.logStorageUnavailable(error);
      return false;
    }
  }

  async hasItem(key: SecureStorageKey, options?: SecureStorageOptions): Promise<boolean> {
    if (!(await this.isKeychainWorking())) {
      if (!canUseInsecureFallback()) return false;
      return (await this.getFallback(key)) !== null;
    }

    try {
      const mergedOptions = { ...getDefaultOptions(), ...options };
      const credentials = await Keychain.getGenericPassword({
        service: `${mergedOptions.service}.${key}`,
      });
      if (credentials && credentials.password) return true;
      return canUseInsecureFallback() && (await this.getFallback(key)) !== null;
    } catch (error) {
      this.logStorageUnavailable(error);
      return canUseInsecureFallback() && (await this.getFallback(key)) !== null;
    }
  }

  async clearAll(): Promise<boolean> {
    const keys: SecureStorageKey[] = [
      'auth_access_token',
      'auth_refresh_token',
      'biometric_enabled',
      'encryption_key',
      'user_pin',
      'session_id',
    ];

    const results = await Promise.all(keys.map((key) => this.removeItem(key)));
    return results.every(Boolean);
  }

  async setItemWithBiometrics(key: SecureStorageKey, value: string): Promise<boolean> {
    return this.setItem(key, value, getBiometricOptions());
  }

  async getItemWithBiometrics(key: SecureStorageKey): Promise<string | null> {
    return this.getItem(key, getBiometricOptions());
  }

  async setAuthTokens(accessToken: string, refreshToken: string): Promise<boolean> {
    try {
      const [accessResult, refreshResult] = await Promise.all([
        this.setItem('auth_access_token', accessToken),
        this.setItem('auth_refresh_token', refreshToken),
      ]);

      if (accessResult && refreshResult) return true;

      // Never leave a half-written session behind.
      await Promise.all([
        this.removeItem('auth_access_token'),
        this.removeItem('auth_refresh_token'),
      ]);
      return false;
    } catch (error) {
      console.error('[SecureStorage] Failed to store auth tokens:', error);
      await Promise.all([
        this.removeItem('auth_access_token'),
        this.removeItem('auth_refresh_token'),
      ]);
      return false;
    }
  }

  async getAuthTokens(): Promise<{
    accessToken: string | null;
    refreshToken: string | null;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.getItem('auth_access_token'),
      this.getItem('auth_refresh_token'),
    ]);

    // A session is only valid when both halves exist.
    if (!accessToken || !refreshToken) {
      if (accessToken || refreshToken) {
        await Promise.all([
          this.removeItem('auth_access_token'),
          this.removeItem('auth_refresh_token'),
        ]);
      }
      return { accessToken: null, refreshToken: null };
    }

    return { accessToken, refreshToken };
  }

  async clearAuthTokens(): Promise<boolean> {
    const results = await Promise.all([
      this.removeItem('auth_access_token'),
      this.removeItem('auth_refresh_token'),
      this.removeItem('session_id'),
    ]);
    return results.every(Boolean);
  }

  async enableBiometrics(pin?: string): Promise<boolean> {
    const enabledStored = await this.setItem('biometric_enabled', 'true');
    if (!enabledStored) return false;

    if (pin) {
      const pinStored = await this.setItemWithBiometrics('user_pin', pin);
      if (!pinStored) {
        await this.removeItem('biometric_enabled');
        return false;
      }
    }

    return true;
  }

  async disableBiometrics(): Promise<boolean> {
    const results = await Promise.all([
      this.removeItem('biometric_enabled'),
      this.removeItem('user_pin'),
    ]);
    return results.every(Boolean);
  }

  async isBiometricsEnabled(): Promise<boolean> {
    return (await this.getItem('biometric_enabled')) === 'true';
  }

  async getBiometricType(): Promise<Keychain.BIOMETRY_TYPE | null> {
    if (!(await this.isKeychainWorking())) return null;

    try {
      return await Keychain.getSupportedBiometryType();
    } catch (error) {
      this.logStorageUnavailable(error);
      return null;
    }
  }

  async authenticateWithBiometrics(
    _promptMessage: string = 'Authenticate to continue'
  ): Promise<boolean> {
    if (!(await this.isKeychainWorking())) {
      // Simulator convenience is allowed only in development. Production
      // security failures must never be interpreted as successful auth.
      return canUseInsecureFallback();
    }

    try {
      await this.getItemWithBiometrics('user_pin');
      return true;
    } catch (error) {
      if (__DEV__) console.log('[SecureStorage] Biometric auth failed:', error);
      return false;
    }
  }
}

export const SecureStorage = new SecureStorageService();

export const setSecureItem = SecureStorage.setItem.bind(SecureStorage);
export const getSecureItem = SecureStorage.getItem.bind(SecureStorage);
export const removeSecureItem = SecureStorage.removeItem.bind(SecureStorage);
export const setAuthTokens = SecureStorage.setAuthTokens.bind(SecureStorage);
export const getAuthTokens = SecureStorage.getAuthTokens.bind(SecureStorage);
export const clearAuthTokens = SecureStorage.clearAuthTokens.bind(SecureStorage);

export default SecureStorage;
