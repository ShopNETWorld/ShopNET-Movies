import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CreditsModule } from '../credits/credits.module';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { WebhooksController } from './webhooks.controller';

@Module({
  imports: [DatabaseModule, CreditsModule],
  controllers: [BillingController, WebhooksController],
  providers: [BillingService],
  exports: [BillingService],
})
export class BillingModule {}
