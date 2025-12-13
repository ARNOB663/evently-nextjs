/**
 * Production-safe logger utility
 * Only logs in development mode or when explicitly enabled
 */

const isDevelopment = process.env.NODE_ENV !== 'production';
const enableDebugLogs = process.env.ENABLE_DEBUG_LOGS === 'true';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  prefix?: string;
}

class Logger {
  private prefix: string;

  constructor(options: LoggerOptions = {}) {
    this.prefix = options.prefix || '';
  }

  private formatMessage(message: string): string {
    return this.prefix ? `[${this.prefix}] ${message}` : message;
  }

  /**
   * Debug logs - only in development or when ENABLE_DEBUG_LOGS is true
   */
  debug(message: string, ...args: any[]): void {
    if (isDevelopment || enableDebugLogs) {
      console.log(this.formatMessage(message), ...args);
    }
  }

  /**
   * Info logs - only in development or when ENABLE_DEBUG_LOGS is true
   */
  info(message: string, ...args: any[]): void {
    if (isDevelopment || enableDebugLogs) {
      console.info(this.formatMessage(message), ...args);
    }
  }

  /**
   * Warning logs - always logged but without sensitive data in production
   */
  warn(message: string, ...args: any[]): void {
    if (isDevelopment) {
      console.warn(this.formatMessage(message), ...args);
    } else {
      // In production, only log the message without additional args that might contain sensitive data
      console.warn(this.formatMessage(message));
    }
  }

  /**
   * Error logs - always logged but sanitized in production
   */
  error(message: string, error?: Error | any): void {
    if (isDevelopment) {
      console.error(this.formatMessage(message), error);
    } else {
      // In production, log error message but not full stack traces with potentially sensitive info
      console.error(this.formatMessage(message), error?.message || '');
    }
  }
}

// Create default logger instance
export const logger = new Logger();

// Create namespaced loggers for different modules
export const createLogger = (prefix: string) => new Logger({ prefix });

// Pre-configured loggers for common modules
export const authLogger = createLogger('Auth');
export const dbLogger = createLogger('DB');
export const emailLogger = createLogger('Email');
export const paymentLogger = createLogger('Payment');
export const apiLogger = createLogger('API');

export default logger;
