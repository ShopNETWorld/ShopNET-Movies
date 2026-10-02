import { Injectable } from '@nestjs/common';
import { Logger } from '@shopnet/logger';

export type AuthAuditEventType =
  | 'AUTH_REGISTER_SUCCESS'
  | 'AUTH_REGISTER_FAILED'
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_LOGOUT'
  | 'AUTH_PASSWORD_RESET_REQUESTED'
  | 'AUTH_PASSWORD_RESET_SUCCESS'
  | 'AUTH_UNAUTHORIZED_ACCESS'
  | 'AUTH_FORBIDDEN_ROLE_ACCESS';

export interface AuthAuditRecord {
  event: AuthAuditEventType;
  userId?: string;
  email?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

@Injectable()
export class AuthAuditService {
  private readonly logger = new Logger('auth-audit');
  private readonly auditLogBuffer: AuthAuditRecord[] = [];

  logEvent(
    event: AuthAuditEventType,
    details: {
      userId?: string;
      email?: string;
      ipAddress?: string;
      userAgent?: string;
      metadata?: Record<string, unknown>;
    }
  ): AuthAuditRecord {
    const record: AuthAuditRecord = {
      event,
      userId: details.userId,
      email: details.email ? details.email.toLowerCase() : undefined,
      ipAddress: details.ipAddress || 'unknown',
      userAgent: details.userAgent || 'unknown',
      timestamp: new Date().toISOString(),
      metadata: details.metadata
    };

    this.auditLogBuffer.push(record);

    if (event.includes('FAILED') || event.includes('FORBIDDEN') || event.includes('UNAUTHORIZED')) {
      this.logger.warn(`[SECURITY AUDIT] ${event}`, record);
    } else {
      this.logger.info(`[SECURITY AUDIT] ${event}`, record);
    }

    return record;
  }

  getRecentLogs(limit = 50): AuthAuditRecord[] {
    return this.auditLogBuffer.slice(-limit);
  }
}
