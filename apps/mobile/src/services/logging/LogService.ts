/**
 * Log Service
 * Centralized logging with conditional output and remote reporting
 * Replaces scattered console.log statements throughout the app
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { SentryService } from '../monitoring/SentryService';

// ============================================
// TYPES
// ============================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  tag: string;
  message: string;
  data?: unknown;
}

export interface LogConfig {
  /** Enable logging (default: __DEV__) */
  enabled?: boolean;
  /** Minimum log level to output */
  minLevel?: LogLevel;
  /** Persist logs to storage */
  persistLogs?: boolean;
  /** Maximum logs to persist */
  maxPersistedLogs?: number;
  /** Send errors to Sentry */
  sendToSentry?: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const LOG_STORAGE_KEY = '@carebow/logs';
const DEFAULT_MAX_LOGS = 500;
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// ============================================
// LOG SERVICE CLASS
// ============================================

class LogServiceClass {
  private config: Required<LogConfig> = {
    enabled: __DEV__,
    minLevel: __DEV__ ? 'debug' : 'warn',
    persistLogs: false,
    maxPersistedLogs: DEFAULT_MAX_LOGS,
    sendToSentry: !__DEV__,
  };

  private persistedLogs: LogEntry[] = [];
  private initialized = false;

  /**
   * Initialize the log service
   */
  async initialize(config?: Partial<LogConfig>): Promise<void> {
    if (this.initialized) return;

    if (config) {
      this.config = { ...this.config, ...config };
    }

    if (this.config.persistLogs) {
      await this.loadPersistedLogs();
    }

    this.initialized = true;
  }

  /**
   * Configure the log service
   */
  configure(config: Partial<LogConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Log a debug message
   */
  debug(tag: string, message: string, data?: unknown): void {
    this.log('debug', tag, message, data);
  }

  /**
   * Log an info message
   */
  info(tag: string, message: string, data?: unknown): void {
    this.log('info', tag, message, data);
  }

  /**
   * Log a warning message
   */
  warn(tag: string, message: string, data?: unknown): void {
    this.log('warn', tag, message, data);
  }

  /**
   * Log an error message
   */
  error(tag: string, message: string, error?: Error | unknown): void {
    this.log('error', tag, message, error);

    // Send to Sentry for error level
    if (this.config.sendToSentry && error instanceof Error) {
      SentryService.captureError(error, { tag, message });
    }
  }

  /**
   * Log a message with timing
   */
  time(tag: string, label: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      this.debug(tag, `${label}: ${duration.toFixed(2)}ms`);
    };
  }

  /**
   * Create a scoped logger
   */
  scope(tag: string): ScopedLogger {
    return new ScopedLogger(this, tag);
  }

  /**
   * Get persisted logs
   */
  getLogs(): LogEntry[] {
    return [...this.persistedLogs];
  }

  /**
   * Clear persisted logs
   */
  async clearLogs(): Promise<void> {
    this.persistedLogs = [];
    await AsyncStorage.removeItem(LOG_STORAGE_KEY);
  }

  /**
   * Export logs as JSON string
   */
  exportLogs(): string {
    return JSON.stringify(this.persistedLogs, null, 2);
  }

  // ========================================
  // PRIVATE METHODS
  // ========================================

  private log(level: LogLevel, tag: string, message: string, data?: unknown): void {
    // Check if logging is enabled
    if (!this.config.enabled) return;

    // Check minimum log level
    if (LOG_LEVELS[level] < LOG_LEVELS[this.config.minLevel]) return;

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      tag,
      message,
      data,
    };

    // Console output
    this.outputToConsole(entry);

    // Persist if enabled
    if (this.config.persistLogs) {
      this.persistLog(entry);
    }
  }

  private outputToConsole(entry: LogEntry): void {
    const prefix = `[${entry.tag}]`;
    const msg = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case 'debug':
        if (entry.data !== undefined) {
          console.log(msg, entry.data);
        } else {
          console.log(msg);
        }
        break;
      case 'info':
        if (entry.data !== undefined) {
          console.info(msg, entry.data);
        } else {
          console.info(msg);
        }
        break;
      case 'warn':
        if (entry.data !== undefined) {
          console.warn(msg, entry.data);
        } else {
          console.warn(msg);
        }
        break;
      case 'error':
        if (entry.data !== undefined) {
          console.error(msg, entry.data);
        } else {
          console.error(msg);
        }
        break;
    }
  }

  private async persistLog(entry: LogEntry): Promise<void> {
    this.persistedLogs.push(entry);

    // Trim if exceeds max
    if (this.persistedLogs.length > this.config.maxPersistedLogs) {
      this.persistedLogs = this.persistedLogs.slice(-this.config.maxPersistedLogs);
    }

    // Persist asynchronously
    try {
      await AsyncStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(this.persistedLogs));
    } catch (error) {
      // Silent fail - don't log about logging failures
    }
  }

  private async loadPersistedLogs(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(LOG_STORAGE_KEY);
      if (data) {
        this.persistedLogs = JSON.parse(data);
      }
    } catch (error) {
      this.persistedLogs = [];
    }
  }
}

// ============================================
// SCOPED LOGGER
// ============================================

class ScopedLogger {
  constructor(
    private service: LogServiceClass,
    private tag: string
  ) {}

  debug(message: string, data?: unknown): void {
    this.service.debug(this.tag, message, data);
  }

  info(message: string, data?: unknown): void {
    this.service.info(this.tag, message, data);
  }

  warn(message: string, data?: unknown): void {
    this.service.warn(this.tag, message, data);
  }

  error(message: string, error?: Error | unknown): void {
    this.service.error(this.tag, message, error);
  }

  time(label: string): () => void {
    return this.service.time(this.tag, label);
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const LogService = new LogServiceClass();

// ============================================
// CONVENIENCE EXPORTS
// ============================================

/**
 * Create a scoped logger for a specific tag/module
 * Usage: const log = createLogger('MyComponent');
 */
export const createLogger = (tag: string) => LogService.scope(tag);

/**
 * Quick logging functions
 */
export const logDebug = (tag: string, message: string, data?: unknown) =>
  LogService.debug(tag, message, data);

export const logInfo = (tag: string, message: string, data?: unknown) =>
  LogService.info(tag, message, data);

export const logWarn = (tag: string, message: string, data?: unknown) =>
  LogService.warn(tag, message, data);

export const logError = (tag: string, message: string, error?: Error | unknown) =>
  LogService.error(tag, message, error);

export default LogService;
