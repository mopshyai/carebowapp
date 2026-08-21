/**
 * Security policy for storage fallbacks.
 *
 * AsyncStorage is not an acceptable persistence layer for authentication
 * secrets or other sensitive material in a production build. The fallback is
 * intentionally limited to development/simulator environments where native
 * Keychain/Keystore may be unavailable.
 */
export function allowInsecureStorageFallback(isDevelopmentBuild: boolean): boolean {
  return isDevelopmentBuild;
}
