/**
 * Analytics Service
 * Centralized analytics tracking with support for multiple providers
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// ============================================
// TYPES
// ============================================

export type EventCategory =
  | 'navigation'
  | 'engagement'
  | 'conversion'
  | 'health'
  | 'error'
  | 'performance'
  | 'user';

export interface AnalyticsEvent {
  name: string;
  category: EventCategory;
  properties?: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
}

export interface UserProperties {
  userId?: string;
  userType?: 'guest' | 'registered' | 'premium';
  language?: string;
  region?: string;
  appVersion?: string;
  deviceType?: string;
  osVersion?: string;
  [key: string]: unknown;
}

export interface AnalyticsProvider {
  name: string;
  initialize: () => Promise<void>;
  trackEvent: (event: AnalyticsEvent) => Promise<void>;
  setUserProperties: (properties: UserProperties) => Promise<void>;
  setUserId: (userId: string | null) => Promise<void>;
  flush: () => Promise<void>;
}

interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  batchSize: number;
  flushIntervalMs: number;
  providers: AnalyticsProvider[];
}

// ============================================
// CONSTANTS
// ============================================

const ANALYTICS_QUEUE_KEY = '@carebow/analytics_queue';
const ANALYTICS_SESSION_KEY = '@carebow/analytics_session';
const DEFAULT_CONFIG: AnalyticsConfig = {
  enabled: true,
  debug: __DEV__,
  batchSize: 10,
  flushIntervalMs: 30000, // 30 seconds
  providers: [],
};

// ============================================
// ANALYTICS SERVICE
// ============================================

class AnalyticsServiceImpl {
  private config: AnalyticsConfig = DEFAULT_CONFIG;
  private eventQueue: AnalyticsEvent[] = [];
  private sessionId: string = '';
  private userId: string | null = null;
  private userProperties: UserProperties = {};
  private flushTimer: NodeJS.Timeout | null = null;
  private initialized: boolean = false;

  /**
   * Initialize analytics service
   */
  async initialize(config?: Partial<AnalyticsConfig>): Promise<void> {
    if (this.initialized) return;

    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = await this.getOrCreateSession();

    // Load queued events from storage
    await this.loadQueueFromStorage();

    // Initialize all providers
    await Promise.all(
      this.config.providers.map(async (provider) => {
        try {
          await provider.initialize();
          this.log(`[Analytics] Initialized provider: ${provider.name}`);
        } catch (error) {
          console.error(`[Analytics] Failed to initialize ${provider.name}:`, error);
        }
      })
    );

    // Set default user properties
    this.setUserProperties({
      appVersion: '1.0.0', // Should come from app.json or config
      deviceType: Platform.OS,
      osVersion: String(Platform.Version),
    });

    // Start flush timer
    this.startFlushTimer();

    this.initialized = true;
    this.log('[Analytics] Service initialized');
  }

  /**
   * Track an event
   */
  track(
    eventName: string,
    category: EventCategory = 'engagement',
    properties?: Record<string, unknown>
  ): void {
    if (!this.config.enabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      category,
      properties: {
        ...properties,
        platform: Platform.OS,
      },
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    this.eventQueue.push(event);
    this.log(`[Analytics] Tracked: ${eventName}`, properties);

    // Flush if batch size reached
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flush();
    }

    // Save to storage for persistence
    this.saveQueueToStorage();
  }

  /**
   * Track screen view
   */
  trackScreen(screenName: string, properties?: Record<string, unknown>): void {
    this.track('screen_view', 'navigation', {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Track user action
   */
  trackAction(
    action: string,
    target?: string,
    properties?: Record<string, unknown>
  ): void {
    this.track('user_action', 'engagement', {
      action,
      target,
      ...properties,
    });
  }

  /**
   * Track conversion event
   */
  trackConversion(
    conversionType: string,
    value?: number,
    properties?: Record<string, unknown>
  ): void {
    this.track('conversion', 'conversion', {
      conversion_type: conversionType,
      value,
      ...properties,
    });
  }

  /**
   * Track error event
   */
  trackError(
    errorName: string,
    errorMessage: string,
    properties?: Record<string, unknown>
  ): void {
    this.track('error', 'error', {
      error_name: errorName,
      error_message: errorMessage,
      ...properties,
    });
  }

  /**
   * Track health-related event
   */
  trackHealthEvent(
    eventType: string,
    properties?: Record<string, unknown>
  ): void {
    this.track(eventType, 'health', properties);
  }

  /**
   * Track timing/performance event
   */
  trackTiming(
    category: string,
    variable: string,
    timeMs: number,
    properties?: Record<string, unknown>
  ): void {
    this.track('timing', 'performance', {
      timing_category: category,
      timing_variable: variable,
      timing_value: timeMs,
      ...properties,
    });
  }

  /**
   * Set user ID
   */
  setUserId(userId: string | null): void {
    this.userId = userId;
    this.config.providers.forEach((provider) => {
      provider.setUserId(userId).catch(console.error);
    });
    this.log(`[Analytics] User ID set: ${userId}`);
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: UserProperties): void {
    this.userProperties = { ...this.userProperties, ...properties };
    this.config.providers.forEach((provider) => {
      provider.setUserProperties(this.userProperties).catch(console.error);
    });
    this.log('[Analytics] User properties updated', properties);
  }

  /**
   * Flush events to all providers
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    // Send to all providers
    await Promise.all(
      this.config.providers.map(async (provider) => {
        try {
          for (const event of eventsToSend) {
            await provider.trackEvent(event);
          }
          await provider.flush();
        } catch (error) {
          console.error(`[Analytics] Failed to flush to ${provider.name}:`, error);
          // Re-queue events on failure
          this.eventQueue = [...eventsToSend, ...this.eventQueue];
        }
      })
    );

    // Clear storage after successful flush
    await this.saveQueueToStorage();
    this.log(`[Analytics] Flushed ${eventsToSend.length} events`);
  }

  /**
   * Register a new analytics provider
   */
  registerProvider(provider: AnalyticsProvider): void {
    this.config.providers.push(provider);
    if (this.initialized) {
      provider.initialize().catch(console.error);
    }
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.log(`[Analytics] ${enabled ? 'Enabled' : 'Disabled'}`);
  }

  /**
   * Reset analytics (on logout)
   */
  async reset(): Promise<void> {
    this.userId = null;
    this.userProperties = {};
    this.eventQueue = [];
    this.sessionId = await this.createNewSession();
    await AsyncStorage.removeItem(ANALYTICS_QUEUE_KEY);
    this.log('[Analytics] Reset');
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private async getOrCreateSession(): Promise<string> {
    try {
      const stored = await AsyncStorage.getItem(ANALYTICS_SESSION_KEY);
      if (stored) {
        const session = JSON.parse(stored);
        // Session expires after 30 minutes of inactivity
        if (Date.now() - session.lastActive < 30 * 60 * 1000) {
          session.lastActive = Date.now();
          await AsyncStorage.setItem(ANALYTICS_SESSION_KEY, JSON.stringify(session));
          return session.id;
        }
      }
    } catch {
      // Ignore errors
    }
    return this.createNewSession();
  }

  private async createNewSession(): Promise<string> {
    const sessionId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem(
      ANALYTICS_SESSION_KEY,
      JSON.stringify({ id: sessionId, lastActive: Date.now() })
    );
    return sessionId;
  }

  private async loadQueueFromStorage(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(ANALYTICS_QUEUE_KEY);
      if (stored) {
        this.eventQueue = JSON.parse(stored);
      }
    } catch {
      this.eventQueue = [];
    }
  }

  private async saveQueueToStorage(): Promise<void> {
    try {
      await AsyncStorage.setItem(ANALYTICS_QUEUE_KEY, JSON.stringify(this.eventQueue));
    } catch {
      // Ignore storage errors
    }
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushIntervalMs);
  }

  private log(message: string, data?: unknown): void {
    if (this.config.debug) {
      console.log(message, data || '');
    }
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const AnalyticsService = new AnalyticsServiceImpl();

// ============================================
// COMMON EVENT NAMES
// ============================================

export const AnalyticsEvents = {
  // Navigation
  SCREEN_VIEW: 'screen_view',

  // Auth
  LOGIN: 'login',
  LOGOUT: 'logout',
  SIGNUP: 'signup',

  // Health
  SYMPTOM_CHECK_START: 'symptom_check_start',
  SYMPTOM_CHECK_COMPLETE: 'symptom_check_complete',
  TRIAGE_RESULT: 'triage_result',
  EPISODE_CREATED: 'episode_created',
  FOLLOW_UP_SCHEDULED: 'follow_up_scheduled',

  // Services
  SERVICE_VIEW: 'service_view',
  SERVICE_BOOKED: 'service_booked',
  TELECONSULT_BOOKED: 'teleconsult_booked',
  HOME_VISIT_BOOKED: 'home_visit_booked',

  // Cart & Orders
  ADD_TO_CART: 'add_to_cart',
  REMOVE_FROM_CART: 'remove_from_cart',
  CHECKOUT_START: 'checkout_start',
  CHECKOUT_COMPLETE: 'checkout_complete',
  ORDER_PLACED: 'order_placed',

  // Engagement
  SHARE: 'share',
  COPY: 'copy',
  SEARCH: 'search',
  FILTER_APPLIED: 'filter_applied',
  NOTIFICATION_RECEIVED: 'notification_received',
  NOTIFICATION_OPENED: 'notification_opened',

  // Errors
  ERROR: 'error',
  API_ERROR: 'api_error',
  CRASH: 'crash',
};

export default AnalyticsService;
