import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

// --- DTOs ---

export class SubscribeDto {
  @IsNotEmpty()
  @IsString()
  planId: string;

  @IsNotEmpty()
  @IsString()
  provider: 'paystack' | 'stripe';

  @IsOptional()
  @IsString()
  callbackUrl?: string;
}

export class RefundDto {
  @IsNotEmpty()
  @IsString()
  paymentId: string;

  @IsNotEmpty()
  @IsString()
  reason: string;
}

// --- Controller ---

@Controller('api/v1/billing')
@UseGuards(AuthGuard)
export class BillingController {
  constructor(@Inject(BillingService) private readonly billingService: BillingService) {}

  /**
   * List available subscription plans.
   */
  @Get('plans')
  async listPlans() {
    return this.billingService.listPlans();
  }

  /**
   * Initialize a subscription payment session.
   * Returns a redirect URL for the user to complete payment.
   */
  @Post('subscribe')
  async subscribe(
    @CurrentUser() user: any,
    @Body() dto: SubscribeDto,
  ) {
    if (!['paystack', 'stripe'].includes(dto.provider)) {
      throw new BadRequestException('Provider must be "paystack" or "stripe"');
    }

    return this.billingService.initializeSubscription(
      user.id,
      user.email,
      dto.planId,
      dto.provider,
      dto.callbackUrl,
    );
  }

  /**
   * Get the current user's active subscription.
   */
  @Get('subscription')
  async getSubscription(@CurrentUser() user: any) {
    const subscription = await this.billingService.getUserSubscription(user.id);
    return subscription || { status: 'none', message: 'No active subscription' };
  }

  /**
   * Cancel the current subscription at the end of the billing period.
   */
  @Post('cancel')
  async cancelSubscription(@CurrentUser() user: any) {
    return this.billingService.cancelSubscription(user.id);
  }

  /**
   * Get payment history for the current user.
   */
  @Get('payments')
  async getPayments(@CurrentUser() user: any) {
    return this.billingService.getPaymentHistory(user.id);
  }

  /**
   * Admin-only: Process a refund.
   */
  @Post('refund')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async processRefund(@Body() dto: RefundDto) {
    return this.billingService.processRefund(dto.paymentId, dto.reason);
  }
}
