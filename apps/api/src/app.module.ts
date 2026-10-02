import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthController } from './health/health.controller';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { ProjectsModule } from './projects/projects.module';
import { ScriptsModule } from './scripts/scripts.module';
import { CharactersModule } from './characters/characters.module';
import { ScenesModule } from './scenes/scenes.module';
import { MediaModule } from './media/media.module';
import { JobsModule } from './jobs/jobs.module';
import { CreditsModule } from './credits/credits.module';
import { AiGatewayModule } from './ai-gateway/ai-gateway.module';
import { BullModule } from '@nestjs/bullmq';
import { SocialModule } from './social/social.module';
import { BillingModule } from './billing/billing.module';
import { SecurityModule } from './common/security/security.module';
import { WafThrottlerGuard } from './common/security/waf-throttler.guard';
import { WafMiddleware } from './common/middleware/waf.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 10,
      },
      {
        name: 'generation',
        ttl: 60000,
        limit: 5,
      },
      {
        name: 'webhooks',
        ttl: 60000,
        limit: 30,
      },
    ]),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    DatabaseModule,
    SecurityModule,
    AuthModule,
    ProjectsModule,
    ScriptsModule,
    CharactersModule,
    ScenesModule,
    MediaModule,
    JobsModule,
    CreditsModule,
    AiGatewayModule,
    SocialModule,
    BillingModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: WafThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WafMiddleware).forRoutes('*');
  }
}

