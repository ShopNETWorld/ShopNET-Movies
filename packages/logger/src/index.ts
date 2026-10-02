/**
 * ShopNET Movies — Structured JSON Logger Foundation
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  requestId?: string;
  userId?: string;
  projectId?: string;
  provider?: string;
  operation?: string;
  [key: string]: unknown;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

const SENSITIVE_KEYS = new Set([
  'password',
  'secret',
  'token',
  'apikey',
  'api_key',
  'authorization',
  'better_auth_secret',
  'paystack_secret_key',
  'stripe_secret_key'
]);

/**
 * Sanitizes an object to mask sensitive credentials in logs
 */
export function sanitizeLogData(data: unknown, depth = 0): unknown {
  if (depth > 5 || data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => sanitizeLogData(item, depth + 1));
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value, depth + 1);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export class Logger {
  private serviceName: string;
  private minLevel: LogLevel;

  constructor(serviceName: string, minLevel: LogLevel = 'info') {
    this.serviceName = serviceName;
    const envLevel = typeof process !== 'undefined' ? (process.env.LOG_LEVEL?.toLowerCase() as LogLevel) : undefined;
    this.minLevel = envLevel && LOG_LEVEL_PRIORITY[envLevel] !== undefined ? envLevel : minLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext, error?: Error): string {
    const payload = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      context: context ? sanitizeLogData(context) : undefined,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack
          }
        : undefined
    };

    return JSON.stringify(payload);
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, context?: LogContext, error?: Error): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, context, error));
    }
  }
}

export function createLogger(serviceName: string, minLevel?: LogLevel): Logger {
  return new Logger(serviceName, minLevel);
}
