import {
  Injectable,
  Inject,
  CanActivate,
  ExecutionContext,
  ForbiddenException
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AuthAuditService } from '../audit/auth-audit.service';
import type { UserProfile, UserRole } from '@shopnet/types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(AuthAuditService) private readonly auditService: AuthAuditService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as UserProfile | undefined;

    if (!user || !user.role) {
      this.auditService.logEvent('AUTH_FORBIDDEN_ROLE_ACCESS', {
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: {
          path: request.url,
          requiredRoles,
          userRole: 'NONE',
          reason: 'User not authenticated or missing role'
        }
      });
      throw new ForbiddenException('Access denied: role not assigned');
    }

    // Role hierarchy / check
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      this.auditService.logEvent('AUTH_FORBIDDEN_ROLE_ACCESS', {
        userId: user.id,
        email: user.email,
        ipAddress: request.ip,
        userAgent: request.headers['user-agent'],
        metadata: {
          path: request.url,
          userRole: user.role,
          requiredRoles,
          reason: `Role '${user.role}' is insufficient for required roles: [${requiredRoles.join(', ')}]`
        }
      });
      throw new ForbiddenException(
        `Access denied: required role [${requiredRoles.join(', ')}] but user has '${user.role}'`
      );
    }

    return true;
  }
}
