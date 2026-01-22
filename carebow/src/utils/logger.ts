/**
 * Logger Utility
 * Centralized logging with environment-aware output
 *
 * In production: Only errors and warnings are logged
 * In development: All logs are shown
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerConfig {
  enabled: boolean;
  minLevel: LogLevel;
  prefix: string;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Default config - can be overridden
const config: LoggerConfig = {
  enabled: __DEV__ ?? true,
  minLevel: __DEV__ ? 'debug' : 'warn',
  prefix: '[CareBow]',
};

/**
 * Format log message with timestamp and prefix
 */
const formatMessage = (level: LogLevel, namespace: string, message: string): string => {
  const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
  return `${config.prefix} ${timestamp} [${level.toUpperCase()}] [${namespace}] ${message}`;
};

/**
 * Check if log level should be output
 */
const shouldLog = (level: LogLevel): boolean => {
  if (!config.enabled) return false;
  return LOG_LEVELS[level] >= LOG_LEVELS[config.minLevel];
};

/**
 * Create a namespaced logger
 */
export const createLogger = (namespace: string) => ({
  debug: (message: string, data?: unknown) => {
    if (shouldLog('debug')) {
      if (data !== undefined) {
        console.log(formatMessage('debug', namespace, message), data);
      } else {
        console.log(formatMessage('debug', namespace, message));
      }
    }
  },

  info: (message: string, data?: unknown) => {
    if (shouldLog('info')) {
      if (data !== undefined) {
        console.info(formatMessage('info', namespace, message), data);
      } else {
        console.info(formatMessage('info', namespace, message));
      }
    }
  },

  warn: (message: string, data?: unknown) => {
    if (shouldLog('warn')) {
      if (data !== undefined) {
        console.warn(formatMessage('warn', namespace, message), data);
      } else {
        console.warn(formatMessage('warn', namespace, message));
      }
    }
  },

  error: (message: string, error?: unknown) => {
    if (shouldLog('error')) {
      if (error !== undefined) {
        console.error(formatMessage('error', namespace, message), error);
      } else {
        console.error(formatMessage('error', namespace, message));
      }
    }
  },
});

/**
 * Default logger instance
 */
export const logger = createLogger('App');

/**
 * Configure logger settings
 */
export const configureLogger = (options: Partial<LoggerConfig>) => {
  Object.assign(config, options);
};

/**
 * Disable all logging (useful for tests)
 */
export const disableLogging = () => {
  config.enabled = false;
};

/**
 * Enable logging
 */
export const enableLogging = () => {
  config.enabled = true;
};

export default logger;
