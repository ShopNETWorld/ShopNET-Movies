import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthAuditService } from './audit/auth-audit.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { PasswordResetRequestDto, PasswordResetConfirmDto } from './dto/password-reset.dto';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { Roles } from './decorators/roles.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import { Request } from 'express';
import type { UserProfile } from '@shopnet/types';
import { Throttle } from '@nestjs/throttler';

@Throttle({ auth: { limit: 10, ttl: 60000 } })
@Controller('auth')
@UseGuards(AuthGuard, RolesGuard)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly auditService: AuthAuditService
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, @Req() req: Request) {
    const result = await this.authService.register(dto, req.ip, req.headers['user-agent']);
    return {
      success: true,
      message: 'User registered successfully',
      data: result
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    const result = await this.authService.login(dto, req.ip, req.headers['user-agent']);
    return {
      success: true,
      message: 'Login successful',
      data: result
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: any, @CurrentUser() user: UserProfile) {
    const token = req.token;
    await this.authService.logout(token, user?.id, req.ip, req.headers['user-agent']);
    return {
      success: true,
      message: 'Successfully logged out'
    };
  }

  @Get('me')
  async getProfile(@CurrentUser() user: UserProfile) {
    return {
      success: true,
      data: user
    };
  }

  @Public()
  @Post('password/reset-request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(
    @Body() dto: PasswordResetRequestDto,
    @Req() req: Request
  ) {
    const result = await this.authService.requestPasswordReset(
      dto,
      req.ip,
      req.headers['user-agent']
    );
    return {
      success: true,
      message: result.message
    };
  }

  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: PasswordResetConfirmDto,
    @Req() req: Request
  ) {
    const result = await this.authService.resetPassword(
      dto,
      req.ip,
      req.headers['user-agent']
    );
    return {
      success: true,
      message: result.message
    };
  }

  @Get('admin/audit-logs')
  @Roles('ADMIN')
  async getAuditLogs() {
    const logs = this.auditService.getRecentLogs(50);
    return {
      success: true,
      count: logs.length,
      data: logs
    };
  }

  @Get('creator/dashboard-access')
  @Roles('CREATOR', 'PRODUCER', 'ADMIN')
  async getCreatorAccessStatus(@CurrentUser() user: UserProfile) {
    return {
      success: true,
      message: `Access granted for creator tier`,
      role: user.role
    };
  }
}
