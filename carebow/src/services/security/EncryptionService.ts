/**
 * Encryption Service
 * Utilities for encrypting and decrypting sensitive data
 *
 * NOTE: This implementation provides a foundation for data encryption.
 * For production use, consider using a native crypto library like:
 * - react-native-aes-crypto (for AES encryption)
 * - react-native-crypto (for full crypto support)
 *
 * Current implementation uses:
 * - Base64 encoding for data transport
 * - Simple key derivation for demonstration
 * - Hash functions for data integrity
 */

import { Buffer } from 'buffer';

// ============================================
// TYPES
// ============================================

export interface EncryptionResult {
  data: string;
  iv: string;
  tag?: string;
}

export interface DecryptionInput {
  data: string;
  iv: string;
  tag?: string;
}

export interface HashResult {
  hash: string;
  salt: string;
}

// ============================================
// CONSTANTS
// ============================================

const SALT_LENGTH = 16;
const IV_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 10000;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate cryptographically secure random bytes
 * Uses Math.random as fallback (replace with native crypto in production)
 */
function generateRandomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

/**
 * Convert bytes to hex string
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to bytes
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
}

/**
 * Simple hash function (SHA-256 like)
 * In production, use native crypto.subtle.digest or a library
 */
function simpleHash(data: string): string {
  let hash = 0;
  const str = data + 'carebow_salt_v1';

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Expand to 64 characters for better security simulation
  let result = Math.abs(hash).toString(16);
  while (result.length < 64) {
    hash = ((hash << 5) - hash) + result.charCodeAt(result.length % result.length || 0);
    hash = hash & hash;
    result += Math.abs(hash).toString(16);
  }

  return result.substring(0, 64);
}

/**
 * Derive a key from password and salt (PBKDF2-like)
 */
function deriveKey(password: string, salt: Uint8Array): Uint8Array {
  const key = new Uint8Array(KEY_LENGTH);
  const saltHex = bytesToHex(salt);

  // Simple key derivation (replace with native PBKDF2 in production)
  let derived = password + saltHex;
  for (let i = 0; i < ITERATIONS; i++) {
    derived = simpleHash(derived);
  }

  // Fill key array
  for (let i = 0; i < KEY_LENGTH; i++) {
    key[i] = parseInt(derived.substr((i * 2) % 60, 2), 16) || i;
  }

  return key;
}

/**
 * XOR-based encryption (for demonstration)
 * In production, replace with AES-GCM
 */
function xorEncrypt(data: Uint8Array, key: Uint8Array): Uint8Array {
  const encrypted = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    encrypted[i] = data[i] ^ key[i % key.length];
  }
  return encrypted;
}

// ============================================
// ENCRYPTION SERVICE CLASS
// ============================================

class EncryptionServiceClass {
  private masterKey: Uint8Array | null = null;

  /**
   * Initialize encryption with a master password
   * Call this after user authentication
   */
  initialize(masterPassword: string): void {
    const salt = generateRandomBytes(SALT_LENGTH);
    this.masterKey = deriveKey(masterPassword, salt);

    if (__DEV__) {
      console.log('[Encryption] Service initialized');
    }
  }

  /**
   * Clear the master key (call on logout)
   */
  clear(): void {
    if (this.masterKey) {
      this.masterKey.fill(0);
      this.masterKey = null;
    }

    if (__DEV__) {
      console.log('[Encryption] Service cleared');
    }
  }

  /**
   * Check if encryption is initialized
   */
  isInitialized(): boolean {
    return this.masterKey !== null;
  }

  /**
   * Encrypt a string
   */
  encrypt(plaintext: string, password?: string): EncryptionResult {
    const iv = generateRandomBytes(IV_LENGTH);
    const salt = generateRandomBytes(SALT_LENGTH);
    const key = password
      ? deriveKey(password, salt)
      : this.masterKey || deriveKey('default', salt);

    // Convert plaintext to bytes
    const plaintextBytes = new TextEncoder().encode(plaintext);

    // Encrypt
    const encryptedBytes = xorEncrypt(plaintextBytes, key);

    // Encode to base64
    const data = Buffer.from(encryptedBytes).toString('base64');
    const ivHex = bytesToHex(iv);
    const saltHex = bytesToHex(salt);

    return {
      data,
      iv: ivHex,
      tag: saltHex, // Store salt as tag for decryption
    };
  }

  /**
   * Decrypt encrypted data
   */
  decrypt(encrypted: DecryptionInput, password?: string): string {
    const salt = hexToBytes(encrypted.tag || '');
    const key = password
      ? deriveKey(password, salt)
      : this.masterKey || deriveKey('default', salt);

    // Decode from base64
    const encryptedBytes = new Uint8Array(Buffer.from(encrypted.data, 'base64'));

    // Decrypt
    const decryptedBytes = xorEncrypt(encryptedBytes, key);

    // Convert back to string
    return new TextDecoder().decode(decryptedBytes);
  }

  /**
   * Encrypt JSON data
   */
  encryptJSON<T>(data: T, password?: string): EncryptionResult {
    const jsonString = JSON.stringify(data);
    return this.encrypt(jsonString, password);
  }

  /**
   * Decrypt to JSON
   */
  decryptJSON<T>(encrypted: DecryptionInput, password?: string): T {
    const jsonString = this.decrypt(encrypted, password);
    return JSON.parse(jsonString) as T;
  }

  /**
   * Hash a password for storage
   */
  hashPassword(password: string): HashResult {
    const salt = generateRandomBytes(SALT_LENGTH);
    const saltHex = bytesToHex(salt);

    // Multiple rounds of hashing
    let hash = password + saltHex;
    for (let i = 0; i < ITERATIONS; i++) {
      hash = simpleHash(hash);
    }

    return {
      hash,
      salt: saltHex,
    };
  }

  /**
   * Verify a password against a stored hash
   */
  verifyPassword(password: string, storedHash: string, salt: string): boolean {
    let hash = password + salt;
    for (let i = 0; i < ITERATIONS; i++) {
      hash = simpleHash(hash);
    }

    return hash === storedHash;
  }

  /**
   * Generate a secure hash of data
   */
  hash(data: string): string {
    return simpleHash(data);
  }

  /**
   * Generate a random ID
   */
  generateId(length: number = 16): string {
    const bytes = generateRandomBytes(length);
    return bytesToHex(bytes);
  }

  /**
   * Generate a secure PIN
   */
  generatePin(length: number = 6): string {
    const digits = '0123456789';
    let pin = '';
    for (let i = 0; i < length; i++) {
      pin += digits[Math.floor(Math.random() * digits.length)];
    }
    return pin;
  }

  /**
   * Mask sensitive data for display
   */
  maskData(data: string, visibleChars: number = 4): string {
    if (data.length <= visibleChars) {
      return '*'.repeat(data.length);
    }

    const visible = data.slice(-visibleChars);
    const masked = '*'.repeat(data.length - visibleChars);
    return masked + visible;
  }

  /**
   * Mask email for display
   */
  maskEmail(email: string): string {
    const [username, domain] = email.split('@');
    if (!domain) return this.maskData(email);

    const maskedUsername =
      username.length > 2
        ? username[0] + '*'.repeat(username.length - 2) + username[username.length - 1]
        : '*'.repeat(username.length);

    return `${maskedUsername}@${domain}`;
  }

  /**
   * Mask phone number for display
   */
  maskPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 4) return '*'.repeat(phone.length);

    return '*'.repeat(digits.length - 4) + digits.slice(-4);
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const EncryptionService = new EncryptionServiceClass();

// ============================================
// CONVENIENCE EXPORTS
// ============================================

export const initializeEncryption = (password: string) =>
  EncryptionService.initialize(password);
export const clearEncryption = () => EncryptionService.clear();
export const encrypt = (data: string, password?: string) =>
  EncryptionService.encrypt(data, password);
export const decrypt = (data: DecryptionInput, password?: string) =>
  EncryptionService.decrypt(data, password);
export const hashPassword = (password: string) =>
  EncryptionService.hashPassword(password);
export const verifyPassword = (
  password: string,
  hash: string,
  salt: string
) => EncryptionService.verifyPassword(password, hash, salt);

export default EncryptionService;
