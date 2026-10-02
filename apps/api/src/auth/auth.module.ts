import { Module, Global } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthAuditService } from './audit/auth-audit.service';
import { AuthGuard } from './guards/auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthAuditService, AuthGuard, RolesGuard],
  exports: [AuthService, AuthAuditService, AuthGuard, RolesGuard]
})
export class AuthModule {}
