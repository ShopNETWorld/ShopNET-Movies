import {
  Injectable,
  Inject,
  UnauthorizedException,
  BadRequestException,
  ConflictException
} from '@nestjs/common';
import { AuthAuditService } from './audit/auth-audit.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PasswordResetRequestDto, PasswordResetConfirmDto } from './dto/password-reset.dto';
import { auth, Auth } from './auth.config';
import type { UserProfile, UserRole } from '@shopnet/types';

@Injectable()
export class AuthService {
  private readonly authInstance: Auth;

  constructor(@Inject(AuthAuditService) private readonly auditService: AuthAuditService) {
    this.authInstance = auth;
  }

  /**
   * Register a new user identity
   */
  async register(
    dto: RegisterDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ user: UserProfile; token?: string }> {
    try {
      const response = await this.authInstance.api.signUpEmail({
        body: {
          email: dto.email.toLowerCase().trim(),
          password: dto.password,
          name: dto.name.trim(),
          role: dto.role || 'CREATOR'
        }
      });

      if (!response || !response.user) {
        throw new BadRequestException('User registration failed');
      }

      const userProfile: UserProfile = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: ((response.user as any).role as UserRole) || 'CREATOR',
        avatarUrl: response.user.image || undefined,
        createdAt: new Date(response.user.createdAt),
        updatedAt: new Date(response.user.updatedAt)
      };

      this.auditService.logEvent('AUTH_REGISTER_SUCCESS', {
        userId: userProfile.id,
        email: userProfile.email,
        ipAddress,
        userAgent,
        metadata: { role: userProfile.role }
      });

      return {
        user: userProfile,
        token: (response as any).token || undefined
      };
    } catch (error: any) {
      this.auditService.logEvent('AUTH_REGISTER_FAILED', {
        email: dto.email,
        ipAddress,
        userAgent,
        metadata: { reason: error?.message || 'Unknown error' }
      });

      if (error?.message?.toLowerCase().includes('already exists') || error?.status === 409) {
        throw new ConflictException('A user with this email address already exists');
      }
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(error?.message || 'Registration failed');
    }
  }

  /**
   * Authenticate user credentials and issue session/token
   */
  async login(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ user: UserProfile; token: string }> {
    try {
      const response = await this.authInstance.api.signInEmail({
        body: {
          email: dto.email.toLowerCase().trim(),
          password: dto.password
        }
      });

      if (!response || !response.user || !response.token) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const userProfile: UserProfile = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: ((response.user as any).role as UserRole) || 'CREATOR',
        avatarUrl: response.user.image || undefined,
        createdAt: new Date(response.user.createdAt),
        updatedAt: new Date(response.user.updatedAt)
      };

      this.auditService.logEvent('AUTH_LOGIN_SUCCESS', {
        userId: userProfile.id,
        email: userProfile.email,
        ipAddress,
        userAgent
      });

      return {
        user: userProfile,
        token: response.token
      };
    } catch (error: any) {
      this.auditService.logEvent('AUTH_LOGIN_FAILED', {
        email: dto.email,
        ipAddress,
        userAgent,
        metadata: { reason: error?.message || 'Invalid credentials' }
      });

      throw new UnauthorizedException('Invalid email or password');
    }
  }

  /**
   * Validate bearer token or session cookie
   */
  async validateSession(token: string): Promise<{ user: UserProfile; session: any } | null> {
    if (!token) return null;

    try {
      const headers = new Headers();
      headers.set('authorization', `Bearer ${token}`);

      const sessionData = await this.authInstance.api.getSession({
        headers
      });

      if (!sessionData || !sessionData.user) {
        return null;
      }

      const userProfile: UserProfile = {
        id: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.name,
        role: ((sessionData.user as any).role as UserRole) || 'CREATOR',
        avatarUrl: sessionData.user.image || undefined,
        createdAt: new Date(sessionData.user.createdAt),
        updatedAt: new Date(sessionData.user.updatedAt)
      };

      return {
        user: userProfile,
        session: sessionData.session
      };
    } catch {
      return null;
    }
  }

  /**
   * Terminate active session
   */
  async logout(token: string, userId?: string, ipAddress?: string, userAgent?: string): Promise<{ success: boolean }> {
    try {
      const headers = new Headers();
      headers.set('authorization', `Bearer ${token}`);

      await this.authInstance.api.signOut({
        headers
      });

      this.auditService.logEvent('AUTH_LOGOUT', {
        userId,
        ipAddress,
        userAgent
      });

      return { success: true };
    } catch {
      return { success: true };
    }
  }

  /**
   * Request password reset token
   */
  async requestPasswordReset(
    dto: PasswordResetRequestDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ message: string }> {
    this.auditService.logEvent('AUTH_PASSWORD_RESET_REQUESTED', {
      email: dto.email,
      ipAddress,
      userAgent
    });

    try {
      await this.authInstance.api.requestPasswordReset({
        body: {
          email: dto.email.toLowerCase().trim(),
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`
        }
      });
    } catch {
      // Intentionally return uniform message to prevent email enumeration
    }

    return {
      message: 'If an account matches that email, a password reset link has been dispatched.'
    };
  }

  /**
   * Confirm password reset with token
   */
  async resetPassword(
    dto: PasswordResetConfirmDto,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ message: string }> {
    try {
      await this.authInstance.api.resetPassword({
        body: {
          token: dto.token,
          newPassword: dto.newPassword
        }
      });

      this.auditService.logEvent('AUTH_PASSWORD_RESET_SUCCESS', {
        ipAddress,
        userAgent
      });

      return { message: 'Password has been successfully updated.' };
    } catch (error: any) {
      throw new BadRequestException(error?.message || 'Invalid or expired password reset token');
    }
  }
}
