/**
 * Environment Variables Type Declarations
 * Type definitions for @env module (react-native-dotenv)
 */

declare module '@env' {
  // App Configuration
  export const APP_ENV: string;
  export const APP_NAME: string;

  // API Configuration
  export const API_BASE_URL: string;
  export const API_TIMEOUT: string;

  // Ask CareBow AI Configuration
  export const ASK_CAREBOW_API_URL: string;
  export const ASK_CAREBOW_API_KEY: string;

  // Analytics (optional)
  export const ANALYTICS_KEY: string | undefined;

  // Sentry Error Tracking (optional)
  export const SENTRY_DSN: string | undefined;

  // Feature Flags
  export const FEATURE_HEALTH_MEMORY: string;
  export const FEATURE_IMAGE_UPLOAD: string;
  export const FEATURE_VOICE_INPUT: string;
}
