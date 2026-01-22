/**
 * useAnalytics Hook
 * React hook for analytics tracking in components
 */

import { useCallback, useEffect, useRef } from 'react';
import { useRoute, useFocusEffect } from '@react-navigation/native';
import { AnalyticsService, AnalyticsEvents, EventCategory } from '../services/analytics';

// ============================================
// HOOK
// ============================================

export interface UseAnalyticsReturn {
  /** Track a custom event */
  track: (
    eventName: string,
    category?: EventCategory,
    properties?: Record<string, unknown>
  ) => void;
  /** Track screen view (auto-tracked on focus) */
  trackScreen: (screenName: string, properties?: Record<string, unknown>) => void;
  /** Track user action */
  trackAction: (
    action: string,
    target?: string,
    properties?: Record<string, unknown>
  ) => void;
  /** Track button click */
  trackClick: (buttonName: string, properties?: Record<string, unknown>) => void;
  /** Track conversion */
  trackConversion: (
    conversionType: string,
    value?: number,
    properties?: Record<string, unknown>
  ) => void;
  /** Track timing */
  trackTiming: (
    category: string,
    variable: string,
    timeMs: number,
    properties?: Record<string, unknown>
  ) => void;
  /** Track error */
  trackError: (
    errorName: string,
    errorMessage: string,
    properties?: Record<string, unknown>
  ) => void;
  /** Start a timing measurement */
  startTiming: (label: string) => void;
  /** End a timing measurement and track it */
  endTiming: (label: string, category?: string) => void;
}

/**
 * Hook for tracking analytics events in components
 */
export function useAnalytics(screenName?: string): UseAnalyticsReturn {
  const route = useRoute();
  const timers = useRef<Map<string, number>>(new Map());
  const currentScreen = screenName || route.name;

  // Auto-track screen view on focus
  useFocusEffect(
    useCallback(() => {
      if (currentScreen) {
        AnalyticsService.trackScreen(currentScreen);
      }
    }, [currentScreen])
  );

  const track = useCallback(
    (
      eventName: string,
      category: EventCategory = 'engagement',
      properties?: Record<string, unknown>
    ) => {
      AnalyticsService.track(eventName, category, {
        screen: currentScreen,
        ...properties,
      });
    },
    [currentScreen]
  );

  const trackScreen = useCallback(
    (name: string, properties?: Record<string, unknown>) => {
      AnalyticsService.trackScreen(name, properties);
    },
    []
  );

  const trackAction = useCallback(
    (action: string, target?: string, properties?: Record<string, unknown>) => {
      AnalyticsService.trackAction(action, target, {
        screen: currentScreen,
        ...properties,
      });
    },
    [currentScreen]
  );

  const trackClick = useCallback(
    (buttonName: string, properties?: Record<string, unknown>) => {
      AnalyticsService.trackAction('click', buttonName, {
        screen: currentScreen,
        ...properties,
      });
    },
    [currentScreen]
  );

  const trackConversion = useCallback(
    (
      conversionType: string,
      value?: number,
      properties?: Record<string, unknown>
    ) => {
      AnalyticsService.trackConversion(conversionType, value, {
        screen: currentScreen,
        ...properties,
      });
    },
    [currentScreen]
  );

  const trackTiming = useCallback(
    (
      category: string,
      variable: string,
      timeMs: number,
      properties?: Record<string, unknown>
    ) => {
      AnalyticsService.trackTiming(category, variable, timeMs, {
        screen: currentScreen,
        ...properties,
      });
    },
    [currentScreen]
  );

  const trackError = useCallback(
    (
      errorName: string,
      errorMessage: string,
      properties?: Record<string, unknown>
    ) => {
      AnalyticsService.trackError(errorName, errorMessage, {
        screen: currentScreen,
        ...properties,
      });
    },
    [currentScreen]
  );

  const startTiming = useCallback((label: string) => {
    timers.current.set(label, Date.now());
  }, []);

  const endTiming = useCallback(
    (label: string, category: string = 'performance') => {
      const startTime = timers.current.get(label);
      if (startTime) {
        const duration = Date.now() - startTime;
        timers.current.delete(label);
        trackTiming(category, label, duration);
      }
    },
    [trackTiming]
  );

  return {
    track,
    trackScreen,
    trackAction,
    trackClick,
    trackConversion,
    trackTiming,
    trackError,
    startTiming,
    endTiming,
  };
}

// ============================================
// COMPONENT ANALYTICS WRAPPER
// ============================================

/**
 * Higher-order function to add click tracking to a button press handler
 */
export function withClickTracking(
  buttonName: string,
  onPress?: () => void,
  properties?: Record<string, unknown>
): () => void {
  return () => {
    AnalyticsService.trackAction('click', buttonName, properties);
    onPress?.();
  };
}

// ============================================
// INITIALIZE ANALYTICS
// ============================================

/**
 * Initialize analytics on app start
 * Call this in App.tsx or a similar entry point
 */
export async function initializeAnalytics(): Promise<void> {
  const { ConsoleProvider } = await import('../services/analytics');

  await AnalyticsService.initialize({
    enabled: true,
    debug: __DEV__,
    providers: [new ConsoleProvider()],
  });
}

export default useAnalytics;
