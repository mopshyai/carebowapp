/**
 * Sentry Service
 * Crash reporting and performance monitoring
 *
 * Setup:
 * 1. Create a Sentry project at https://sentry.io
 * 2. Get your DSN from Project Settings > Client Keys
 * 3. Add to .env: SENTRY_DSN=your_dsn_here
 *
 * Features:
 * - Automatic crash reporting
 * - Performance monitoring
 * - User context tracking
 * - Custom error logging
 * - Breadcrumb trail
 */

import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

// ============================================
// TYPES
// ============================================

export interface UserContext {
  id: string;
  email?: string;
  username?: string;
}

export interface ErrorContext {
  [key: string]: string | number | boolean | undefined;
}

export type SeverityLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

// ============================================
// CONFIGURATION
// ============================================

// Get DSN from environment (in production, use react-native-config)
const SENTRY_DSN = process.env.SENTRY_DSN || '';

// Enable in production, optionally in development
const SENTRY_ENABLED = !__DEV__ || process.env.SENTRY_DEBUG === 'true';

// App version for release tracking
const APP_VERSION = '1.0.0';
const APP_BUILD = '1';

// ============================================
// SENTRY SERVICE CLASS
// ============================================

class SentryServiceClass {
  private isInitialized = false;

  /**
   * Initialize Sentry SDK
   * Call this early in app startup (before App component)
   */
  initialize(): void {
    if (this.isInitialized) {
      if (__DEV__) {
        console.log('[Sentry] Already initialized');
      }
      return;
    }

    if (!SENTRY_ENABLED) {
      if (__DEV__) {
        console.log('[Sentry] Disabled in development mode');
      }
      return;
    }

    if (!SENTRY_DSN) {
      console.warn('[Sentry] No DSN provided - crash reporting disabled');
      return;
    }

    try {
      Sentry.init({
        dsn: SENTRY_DSN,
        release: `com.carebow.app@${APP_VERSION}+${APP_BUILD}`,
        dist: APP_BUILD,
        environment: __DEV__ ? 'development' : 'production',

        // Performance monitoring
        tracesSampleRate: __DEV__ ? 1.0 : 0.2, // 20% in production
        profilesSampleRate: __DEV__ ? 1.0 : 0.1, // 10% in production

        // Enable native crash reporting
        enableNativeCrashHandling: true,
        enableAutoSessionTracking: true,

        // Breadcrumb settings
        maxBreadcrumbs: 100,

        // Filter sensitive data
        beforeSend: (event) => {
          // Remove sensitive data before sending
          if (event.user) {
            delete event.user.ip_address;
          }

          // Filter out certain error types if needed
          // if (event.exception?.values?.[0]?.type === 'NetworkError') {
          //   return null; // Don't send network errors
          // }

          return event;
        },

        // Add default tags
        integrations: [
          Sentry.reactNativeTracingIntegration(),
        ],
      });

      // Set default tags
      Sentry.setTag('platform', Platform.OS);
      Sentry.setTag('platformVersion', String(Platform.Version));

      this.isInitialized = true;

      if (__DEV__) {
        console.log('[Sentry] Initialized successfully');
      }
    } catch (error) {
      console.error('[Sentry] Initialization failed:', error);
    }
  }

  /**
   * Set user context for error tracking
   */
  setUser(user: UserContext | null): void {
    if (!this.isInitialized) return;

    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
      });

      if (__DEV__) {
        console.log('[Sentry] User set:', user.id);
      }
    } else {
      Sentry.setUser(null);

      if (__DEV__) {
        console.log('[Sentry] User cleared');
      }
    }
  }

  /**
   * Log an error to Sentry
   */
  captureError(
    error: Error,
    context?: ErrorContext,
    severity: SeverityLevel = 'error'
  ): string | undefined {
    if (!this.isInitialized) {
      console.error('[Sentry] Not initialized, logging locally:', error);
      return undefined;
    }

    return Sentry.withScope((scope) => {
      // Set severity level
      scope.setLevel(severity);

      // Add custom context
      if (context) {
        scope.setExtras(context);
      }

      // Capture the error
      return Sentry.captureException(error);
    });
  }

  /**
   * Log a message to Sentry
   */
  captureMessage(
    message: string,
    severity: SeverityLevel = 'info',
    context?: ErrorContext
  ): string | undefined {
    if (!this.isInitialized) {
      console.log('[Sentry] Not initialized, logging locally:', message);
      return undefined;
    }

    return Sentry.withScope((scope) => {
      scope.setLevel(severity);

      if (context) {
        scope.setExtras(context);
      }

      return Sentry.captureMessage(message);
    });
  }

  /**
   * Add a breadcrumb for debugging
   */
  addBreadcrumb(
    message: string,
    category: string = 'app',
    data?: Record<string, unknown>,
    level: SeverityLevel = 'info'
  ): void {
    if (!this.isInitialized) return;

    Sentry.addBreadcrumb({
      message,
      category,
      level,
      data,
      timestamp: Date.now() / 1000,
    });
  }

  /**
   * Start a performance transaction
   */
  startTransaction(
    name: string,
    operation: string
  ): Sentry.Span | undefined {
    if (!this.isInitialized) return undefined;

    return Sentry.startInactiveSpan({
      name,
      op: operation,
    });
  }

  /**
   * Set a custom tag
   */
  setTag(key: string, value: string): void {
    if (!this.isInitialized) return;
    Sentry.setTag(key, value);
  }

  /**
   * Set custom extra data
   */
  setExtra(key: string, value: unknown): void {
    if (!this.isInitialized) return;
    Sentry.setExtra(key, value);
  }

  /**
   * Clear all context (for logout)
   */
  clearContext(): void {
    if (!this.isInitialized) return;

    Sentry.setUser(null);
    Sentry.setTags({});

    if (__DEV__) {
      console.log('[Sentry] Context cleared');
    }
  }

  /**
   * Wrap a component with Sentry error boundary
   */
  wrap<P extends object>(
    Component: React.ComponentType<P>,
    fallback?: React.ReactNode
  ): React.ComponentType<P> {
    return Sentry.wrap(Component);
  }

  /**
   * Create navigation integration for screen tracking
   */
  getNavigationIntegration(): ReturnType<typeof Sentry.reactNavigationIntegration> {
    return Sentry.reactNavigationIntegration();
  }

  /**
   * Force flush pending events (useful before app close)
   */
  async flush(timeout: number = 2000): Promise<boolean> {
    if (!this.isInitialized) return false;

    try {
      await Sentry.flush(timeout);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if Sentry is initialized
   */
  isEnabled(): boolean {
    return this.isInitialized;
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const SentryService = new SentryServiceClass();

// ============================================
// CONVENIENCE EXPORTS
// ============================================

export const initializeSentry = () => SentryService.initialize();
export const captureError = SentryService.captureError.bind(SentryService);
export const captureMessage = SentryService.captureMessage.bind(SentryService);
export const addBreadcrumb = SentryService.addBreadcrumb.bind(SentryService);
export const setSentryUser = SentryService.setUser.bind(SentryService);
export const clearSentryContext = SentryService.clearContext.bind(SentryService);

// Re-export Sentry for direct access if needed
export { Sentry };

export default SentryService;
