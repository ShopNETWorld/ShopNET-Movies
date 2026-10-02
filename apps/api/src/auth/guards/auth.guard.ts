import {
  Injectable,
  Inject,
  CanActivate,
  ExecutionContext,
  UnauthorizedException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../auth.service';
import { AuthAuditService } from '../audit/auth-audit.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(AuthService) private readonly authService: AuthService,
    @Inject(AuthAuditService) private readonly auditService: AuthAuditService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      this.auditService.logEvent('AUTH_UNAUTHORIZED_ACCESS', {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: { path: request.url, reason: 'Missing authorization token' }
      });
      throw new UnauthorizedException('Authentication token required');
    }

    const sessionPayload = await this.authService.validateSession(token);

    if (!sessionPayload || !sessionPayload.user) {
      this.auditService.logEvent('AUTH_UNAUTHORIZED_ACCESS', {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: { path: request.url, reason: 'Invalid or expired session token' }
      });
      throw new UnauthorizedException('Invalid or expired authentication session');
    }

    // Attach user and session to request
    (request as any).user = sessionPayload.user;
    (request as any).session = sessionPayload.session;
    (request as any).token = token;

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }
    // Also check session cookie if available
    const cookies = request.headers.cookie;
    if (cookies) {
      const match = cookies.match(/better-auth\.session_token=([^;]+)/);
      if (match) return match[1];
    }
    return undefined;
  }
}
