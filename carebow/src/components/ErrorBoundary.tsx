/**
 * Error Boundary Component
 * Catches JavaScript errors in child component tree and displays fallback UI
 * Integrates with Sentry for crash reporting
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors, spacing, radius, typography, shadows } from '../theme';
import { SentryService, addBreadcrumb } from '@/services/monitoring/SentryService';

// ============================================
// TYPES
// ============================================

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Custom fallback component */
  fallback?: ReactNode;
  /** Callback when error is caught */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Whether to show error details in development */
  showDetails?: boolean;
  /** Custom reset handler */
  onReset?: () => void;
  /** Navigation reference for recovery */
  navigation?: { reset: (options: { index: number; routes: { name: string }[] }) => void };
  /** Enable "Go Home" button */
  showGoHome?: boolean;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// ============================================
// ERROR LOGGING SERVICE
// ============================================

/**
 * Error logging service - integrates with Sentry for production crash reporting
 */
export const ErrorLogger = {
  /**
   * Log an error to the reporting service
   */
  logError: (error: Error, errorInfo?: ErrorInfo, context?: Record<string, unknown>) => {
    // Always log to console in development
    if (__DEV__) {
      console.error('[ErrorBoundary] Caught error:', error);
      if (errorInfo) {
        console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
      }
      if (context) {
        console.error('[ErrorBoundary] Context:', context);
      }
    }

    // Send to Sentry for crash reporting
    SentryService.captureError(error, {
      componentStack: errorInfo?.componentStack || undefined,
      ...context,
    } as Record<string, string | number | boolean | undefined>);

    // Also store locally for debugging
    ErrorLogger.storeLocalError(error, errorInfo, context);
  },

  /**
   * Store error locally for debugging
   */
  storeLocalError: (error: Error, errorInfo?: ErrorInfo, context?: Record<string, unknown>) => {
    const errorRecord = {
      timestamp: new Date().toISOString(),
      message: error.message,
      name: error.name,
      stack: error.stack,
      componentStack: errorInfo?.componentStack,
      context,
      platform: Platform.OS,
      version: Platform.Version,
    };

    // In production, this could be stored in AsyncStorage and sent when the app recovers
    // For now, just log it
    if (!__DEV__) {
      console.log('[ErrorLogger] Error recorded:', JSON.stringify(errorRecord, null, 2));
    }
  },

  /**
   * Log a warning (non-fatal)
   */
  logWarning: (message: string, context?: Record<string, unknown>) => {
    if (__DEV__) {
      console.warn('[ErrorBoundary] Warning:', message, context);
    }

    // Send to Sentry as a message with warning level
    SentryService.captureMessage(message, 'warning', context as Record<string, string | number | boolean | undefined>);
  },

  /**
   * Add breadcrumb for debugging
   */
  addBreadcrumb: (message: string, category: string = 'app', data?: Record<string, unknown>) => {
    addBreadcrumb(message, category, data);
  },
};

// ============================================
// ERROR BOUNDARY COMPONENT
// ============================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Log the error
    ErrorLogger.logError(error, errorInfo);

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    this.props.onReset?.();
  };

  handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Navigate to home if navigation is available
    if (this.props.navigation) {
      this.props.navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }
  };

  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails = __DEV__, showGoHome = true } = this.props;

    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            {/* Error Icon */}
            <View style={styles.iconContainer}>
              <Icon name="warning" size={48} color={colors.error} />
            </View>

            {/* Title */}
            <Text style={styles.title}>Something went wrong</Text>

            {/* Description */}
            <Text style={styles.description}>
              We're sorry, but something unexpected happened. Please try again or contact support if the problem persists.
            </Text>

            {/* Error Details (Development only) */}
            {showDetails && error && (
              <ScrollView style={styles.detailsContainer} nestedScrollEnabled>
                <Text style={styles.detailsTitle}>Error Details</Text>
                <Text style={styles.errorName}>{error.name}</Text>
                <Text style={styles.errorMessage}>{error.message}</Text>
                {error.stack && (
                  <Text style={styles.errorStack}>{error.stack}</Text>
                )}
                {errorInfo?.componentStack && (
                  <>
                    <Text style={styles.detailsTitle}>Component Stack</Text>
                    <Text style={styles.errorStack}>{errorInfo.componentStack}</Text>
                  </>
                )}
              </ScrollView>
            )}

            {/* Actions */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={this.handleReset}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Try again"
                accessibilityHint="Attempts to recover from the error"
              >
                <Icon name="refresh" size={20} color={colors.textInverse} />
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>

              {showGoHome && this.props.navigation && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={this.handleGoHome}
                  activeOpacity={0.8}
                  accessibilityRole="button"
                  accessibilityLabel="Go to home"
                  accessibilityHint="Navigates to the home screen"
                >
                  <Icon name="home-outline" size={20} color={colors.accent} />
                  <Text style={styles.secondaryButtonText}>Go to Home</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Help Text */}
            <Text style={styles.helpText}>
              If this keeps happening, try restarting the app or contact support.
            </Text>
          </View>
        </View>
      );
    }

    return children;
  }
}

// ============================================
// HOOK FOR FUNCTIONAL COMPONENTS
// ============================================

/**
 * Hook to trigger error boundary from functional components
 * Usage: const throwError = useErrorBoundary(); throwError(new Error('...'));
 */
export function useErrorBoundary(): (error: Error) => void {
  const [, setError] = React.useState<Error | null>(null);

  return React.useCallback((error: Error) => {
    setError(() => {
      throw error;
    });
  }, []);
}

// ============================================
// SAFE ASYNC HANDLER
// ============================================

/**
 * Wrap async functions to catch and log errors
 */
export function withErrorHandling<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      ErrorLogger.logError(
        error instanceof Error ? error : new Error(String(error)),
        undefined,
        { context, args: JSON.stringify(args) }
      );
      throw error;
    }
  }) as T;
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.errorSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  detailsContainer: {
    width: '100%',
    maxHeight: 200,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailsTitle: {
    ...typography.labelSmall,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  errorName: {
    ...typography.label,
    color: colors.error,
    marginBottom: spacing.xxs,
  },
  errorMessage: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  errorStack: {
    ...typography.caption,
    color: colors.textTertiary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10,
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    ...shadows.button,
  },
  primaryButtonText: {
    ...typography.labelLarge,
    color: colors.textInverse,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  secondaryButtonText: {
    ...typography.labelLarge,
    color: colors.accent,
  },
  helpText: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});

export default ErrorBoundary;
