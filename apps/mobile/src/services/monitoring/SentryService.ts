/**
 * Sentry Service
 * Crash reporting and performance monitoring
 */

import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';
import { SENTRY_DSN as ENV_SENTRY_DSN } from '@env';
import { redactSentryBreadcrumb, redactSentryFreeText } from './sentryPrivacy';

export interface UserContext {
  id: string;
  // Accepted for backwards-compatible callers, but intentionally never sent
  // to Sentry. CareBow monitoring should not contain direct identity fields.
  email?: string;
  username?: string;
}

export interface ErrorContext {
  [key: string]: string | number | boolean | undefined;
}

export type SeverityLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

// From '@env' (react-native-dotenv), not process.env — the latter is never
// populated in React Native.
const SENTRY_DSN = ENV_SENTRY_DSN || '';
const SENTRY_ENABLED = Boolean(SENTRY_DSN) && !__DEV__;
const APP_VERSION = '1.0.0';
const APP_BUILD = '1';

class SentryServiceClass {
  private isInitialized = false;

  initialize(): void {
    if (this.isInitialized) {
      if (__DEV__) console.log('[Sentry] Already initialized');
      return;
    }

    if (!SENTRY_ENABLED) {
      if (__DEV__) console.log('[Sentry] Disabled in development mode');
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
        sendDefaultPii: false,
        tracesSampleRate: __DEV__ ? 1.0 : 0.2,
        profilesSampleRate: __DEV__ ? 1.0 : 0.1,
        enableNativeCrashHandling: true,
        enableAutoSessionTracking: true,
        maxBreadcrumbs: 100,

        // Health-app privacy boundary. Preserve stack frames, exception types,
        // levels and operational tags, but strip identity, request payloads,
        // arbitrary extras and arbitrary free text before export.
        beforeSend: (event) => {
          if (event.user) {
            event.user = event.user.id ? { id: event.user.id } : undefined;
          }

          if (event.request) {
            delete event.request.data;
            delete event.request.query_string;
            delete event.request.cookies;

            if (event.request.headers) {
              const safeHeaders = { ...event.request.headers };
              for (const key of Object.keys(safeHeaders)) {
                const normalized = key.toLowerCase();
                if (
                  normalized === 'authorization' ||
                  normalized === 'cookie' ||
                  normalized === 'set-cookie' ||
                  normalized === 'x-api-key'
                ) {
                  delete safeHeaders[key];
                }
              }
              event.request.headers = safeHeaders;
            }
          }

          delete event.extra;
          return redactSentryFreeText(event);
        },

        beforeBreadcrumb: (breadcrumb) => redactSentryBreadcrumb(breadcrumb),
        integrations: [Sentry.reactNativeTracingIntegration()],
      });

      Sentry.setTag('platform', Platform.OS);
      Sentry.setTag('platformVersion', String(Platform.Version));
      this.isInitialized = true;

      if (__DEV__) console.log('[Sentry] Initialized successfully');
    } catch (error) {
      console.error('[Sentry] Initialization failed:', error);
    }
  }

  setUser(user: UserContext | null): void {
    if (!this.isInitialized) return;

    if (user) {
      Sentry.setUser({ id: user.id });
      if (__DEV__) console.log('[Sentry] User set:', user.id);
    } else {
      Sentry.setUser(null);
      if (__DEV__) console.log('[Sentry] User cleared');
    }
  }

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
      scope.setLevel(severity);
      if (context) scope.setExtras(context);
      return Sentry.captureException(error);
    });
  }

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
      if (context) scope.setExtras(context);
      return Sentry.captureMessage(message);
    });
  }

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

  startTransaction(name: string, operation: string): Sentry.Span | undefined {
    if (!this.isInitialized) return undefined;
    return Sentry.startInactiveSpan({ name, op: operation });
  }

  setTag(key: string, value: string): void {
    if (!this.isInitialized) return;
    Sentry.setTag(key, value);
  }

  setExtra(key: string, value: unknown): void {
    if (!this.isInitialized) return;
    Sentry.setExtra(key, value);
  }

  clearContext(): void {
    if (!this.isInitialized) return;
    Sentry.setUser(null);
    Sentry.setTags({});
    if (__DEV__) console.log('[Sentry] Context cleared');
  }

  wrap<P extends object>(
    Component: React.ComponentType<P>,
    _fallback?: React.ReactNode
  ): React.ComponentType<P> {
    return Sentry.wrap(
      Component as React.ComponentType<Record<string, unknown>>
    ) as React.ComponentType<P>;
  }

  getNavigationIntegration(): ReturnType<typeof Sentry.reactNavigationIntegration> {
    return Sentry.reactNavigationIntegration();
  }

  async flush(timeout: number = 2000): Promise<boolean> {
    if (!this.isInitialized) return false;
    try {
      await (Sentry.flush as (timeout?: number) => Promise<boolean>)(timeout);
      return true;
    } catch {
      return false;
    }
  }

  isEnabled(): boolean {
    return this.isInitialized;
  }
}

export const SentryService = new SentryServiceClass();
export const initializeSentry = () => SentryService.initialize();
export const captureError = SentryService.captureError.bind(SentryService);
export const captureMessage = SentryService.captureMessage.bind(SentryService);
export const addBreadcrumb = SentryService.addBreadcrumb.bind(SentryService);
export const setSentryUser = SentryService.setUser.bind(SentryService);
export const clearSentryContext = SentryService.clearContext.bind(SentryService);
export { Sentry };
export default SentryService;
