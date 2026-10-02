import { Module } from '@nestjs/common';
import { AiGatewayService } from './ai-gateway.service';
import { DatabaseModule } from '../database/database.module';
import { BullModule } from '@nestjs/bullmq';
import { GenerationController } from './generation.controller';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: 'media-generation',
    }),
  ],
  providers: [
    AiGatewayService,
  ],
  controllers: [
    GenerationController,
  ],
  exports: [AiGatewayService],
})
export class AiGatewayModule {}
