import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SocialAuthController } from './social-auth.controller';
import { SocialPublishingController } from './social-publishing.controller';
import { EncryptionService, SocialProviderRegistry, MockSocialProvider } from '@shopnet/social-publishing';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    BullModule.registerQueue({
      name: 'social-publishing',
    }),
  ],
  controllers: [SocialAuthController, SocialPublishingController],
  providers: [
    {
      provide: EncryptionService,
      useFactory: () => new EncryptionService(process.env.ENCRYPTION_SECRET),
    },
    {
      provide: SocialProviderRegistry,
      useFactory: () => {
        const registry = new SocialProviderRegistry();
        // Register mock providers for platforms
        registry.register(new MockSocialProvider('YOUTUBE'));
        registry.register(new MockSocialProvider('TIKTOK'));
        registry.register(new MockSocialProvider('INSTAGRAM'));
        registry.register(new MockSocialProvider('FACEBOOK'));
        return registry;
      },
    },
  ],
})
export class SocialModule {}
