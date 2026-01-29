/**
 * Console Analytics Provider
 * Logs analytics events to console for development
 */

import { AnalyticsProvider, AnalyticsEvent, UserProperties } from '../AnalyticsService';

export class ConsoleProvider implements AnalyticsProvider {
  name = 'Console';
  private enabled = __DEV__;

  async initialize(): Promise<void> {
    if (this.enabled) {
      console.log('[ConsoleProvider] Initialized');
    }
  }

  async trackEvent(event: AnalyticsEvent): Promise<void> {
    if (!this.enabled) return;

    const logStyle = this.getLogStyle(event.category);
    console.log(
      `%c[Analytics] ${event.name}`,
      logStyle,
      {
        category: event.category,
        properties: event.properties,
        timestamp: new Date(event.timestamp).toISOString(),
        sessionId: event.sessionId.slice(0, 8),
      }
    );
  }

  async setUserProperties(properties: UserProperties): Promise<void> {
    if (!this.enabled) return;
    console.log('[Analytics] User properties:', properties);
  }

  async setUserId(userId: string | null): Promise<void> {
    if (!this.enabled) return;
    console.log('[Analytics] User ID:', userId);
  }

  async flush(): Promise<void> {
    // No-op for console
  }

  private getLogStyle(category: string): string {
    const colors: Record<string, string> = {
      navigation: 'color: #3B82F6',
      engagement: 'color: #10B981',
      conversion: 'color: #F59E0B',
      health: 'color: #EC4899',
      error: 'color: #EF4444',
      performance: 'color: #8B5CF6',
      user: 'color: #6366F1',
    };
    return colors[category] || 'color: #6B7280';
  }
}

export default ConsoleProvider;
