import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../src/auth/auth.service';
import { AuthAuditService } from '../src/auth/audit/auth-audit.service';
import { AuthGuard } from '../src/auth/guards/auth.guard';
import { RolesGuard } from '../src/auth/guards/roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import type { UserProfile } from '@shopnet/types';

describe('Authentication & Identity Security Suite (Phase 02)', () => {
  let authService: AuthService;
  let auditService: AuthAuditService;
  let authGuard: AuthGuard;
  let rolesGuard: RolesGuard;
  let reflector: Reflector;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      providers: [AuthService, AuthAuditService, AuthGuard, RolesGuard, Reflector]
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    auditService = moduleRef.get<AuthAuditService>(AuthAuditService);
    authGuard = moduleRef.get<AuthGuard>(AuthGuard);
    rolesGuard = moduleRef.get<RolesGuard>(RolesGuard);
    reflector = moduleRef.get<Reflector>(Reflector);
  });

  describe('User Registration & Password Security', () => {
    it('should register a new creator identity with valid credentials', async () => {
      const uniqueEmail = `creator_${Date.now()}@shopnet.movies`;
      const result = await authService.register(
        {
          email: uniqueEmail,
          password: 'ValidPassword123!',
          name: 'Funke Akindele',
          role: 'CREATOR'
        },
        '127.0.0.1',
        'Mozilla/5.0 Test'
      );

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(uniqueEmail);
      expect(result.user.name).toBe('Funke Akindele');
      expect(result.user.role).toBe('CREATOR');

      // Security check: password must NEVER be in returned user object
      expect((result.user as any).password).toBeUndefined();
    });

    it('should record an AUTH_REGISTER_SUCCESS audit event upon registration', async () => {
      const uniqueEmail = `audit_reg_${Date.now()}@shopnet.movies`;
      await authService.register({
        email: uniqueEmail,
        password: 'SecurePassword123!',
        name: 'Kunle Afolayan',
        role: 'PRODUCER'
      });

      const logs = auditService.getRecentLogs(10);
      const regEvent = logs.find(l => l.email === uniqueEmail && l.event === 'AUTH_REGISTER_SUCCESS');
      expect(regEvent).toBeDefined();
      expect(regEvent?.metadata?.role).toBe('PRODUCER');
    });
  });

  describe('Authentication & Session Management', () => {
    it('should authenticate valid credentials and issue a session token', async () => {
      const email = `login_test_${Date.now()}@shopnet.movies`;
      await authService.register({
        email,
        password: 'CorrectPassword123!',
        name: 'Genevieve Nnaji'
      });

      const loginResult = await authService.login(
        { email, password: 'CorrectPassword123!' },
        '192.168.1.1',
        'Safari'
      );

      expect(loginResult.token).toBeDefined();
      expect(typeof loginResult.token).toBe('string');
      expect(loginResult.token.length).toBeGreaterThan(16);
      expect(loginResult.user.email).toBe(email);
    });

    it('should reject invalid password and log AUTH_LOGIN_FAILED event', async () => {
      const email = `fail_login_${Date.now()}@shopnet.movies`;
      await authService.register({
        email,
        password: 'RealPassword123!',
        name: 'Richard Mofe-Damijo'
      });

      await expect(
        authService.login({ email, password: 'WrongPassword456!' }, '127.0.0.1')
      ).rejects.toThrow(UnauthorizedException);

      const logs = auditService.getRecentLogs(10);
      const failEvent = logs.find(l => l.email === email && l.event === 'AUTH_LOGIN_FAILED');
      expect(failEvent).toBeDefined();
    });

    it('should validate active sessions via Bearer token', async () => {
      const email = `session_val_${Date.now()}@shopnet.movies`;
      await authService.register({
        email,
        password: 'ValidPassword123!',
        name: 'Somkele Iyamah'
      });

      const { token } = await authService.login({ email, password: 'ValidPassword123!' });

      const validated = await authService.validateSession(token);
      expect(validated).not.toBeNull();
      expect(validated?.user.email).toBe(email);
    });

    it('should return null for forged or invalid tokens', async () => {
      const validated = await authService.validateSession('forged_fake_token_xyz_999');
      expect(validated).toBeNull();
    });
  });

  describe('Authorization & Role-Based Access Control (RBAC)', () => {
    const createMockExecutionContext = (
      user?: Partial<UserProfile>,
      headers: Record<string, string> = {}
    ): ExecutionContext => {
      const request = {
        headers,
        user,
        ip: '127.0.0.1',
        url: '/api/v1/admin/audit-logs'
      };

      return {
        switchToHttp: () => ({
          getRequest: () => request,
          getResponse: () => ({ setHeader: () => {} })
        }),
        getHandler: () => ({}),
        getClass: () => ({})
      } as unknown as ExecutionContext;
    };

    it('AuthGuard should reject requests with missing authorization token', async () => {
      const context = createMockExecutionContext();

      await expect(authGuard.canActivate(context)).rejects.toThrow(UnauthorizedException);

      const logs = auditService.getRecentLogs(5);
      const unauthLog = logs.find(l => l.event === 'AUTH_UNAUTHORIZED_ACCESS');
      expect(unauthLog).toBeDefined();
    });

    it('RolesGuard should grant access when user possesses required role', () => {
      const context = createMockExecutionContext({
        id: 'usr_admin',
        email: 'admin@shopnet.movies',
        role: 'ADMIN'
      });

      // Mock reflector to simulate @Roles('ADMIN')
      reflector.getAllAndOverride = () => ['ADMIN'];

      const canAccess = rolesGuard.canActivate(context);
      expect(canAccess).toBe(true);
    });

    it('RolesGuard should forbid access and log audit event when user has insufficient role', () => {
      const context = createMockExecutionContext({
        id: 'usr_creator',
        email: 'creator@shopnet.movies',
        role: 'CREATOR'
      });

      reflector.getAllAndOverride = () => ['ADMIN'];

      expect(() => rolesGuard.canActivate(context)).toThrow(ForbiddenException);

      const logs = auditService.getRecentLogs(5);
      const forbiddenLog = logs.find(l => l.event === 'AUTH_FORBIDDEN_ROLE_ACCESS');
      expect(forbiddenLog).toBeDefined();
      expect(forbiddenLog?.metadata?.userRole).toBe('CREATOR');
    });
  });
});
