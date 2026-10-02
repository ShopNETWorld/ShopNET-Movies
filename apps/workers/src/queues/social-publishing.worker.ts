import { Worker, Job } from 'bullmq';
import { PrismaClient } from '@shopnet/database';
import { EncryptionService, SocialProviderRegistry, MockSocialProvider } from '@shopnet/social-publishing';

const prisma = new PrismaClient();
const encryption = new EncryptionService(process.env.ENCRYPTION_SECRET);
const registry = new SocialProviderRegistry();
registry.register(new MockSocialProvider('YOUTUBE'));
registry.register(new MockSocialProvider('TIKTOK'));
registry.register(new MockSocialProvider('INSTAGRAM'));
registry.register(new MockSocialProvider('FACEBOOK'));

interface PublishJobPayload {
  publishJobId: string;
  socialAccountId: string;
  mediaAssetId: string;
}

export const socialPublishingWorker = new Worker(
  'social-publishing',
  async (job: Job<PublishJobPayload>) => {
    const { publishJobId, socialAccountId, mediaAssetId } = job.data;

    // 1. Mark as publishing
    await prisma.socialPublishJob.update({
      where: { id: publishJobId },
      data: { status: 'PUBLISHING', retryCount: job.attemptsMade },
    });

    console.log(`[SocialPublishing] Starting job ${publishJobId} for asset ${mediaAssetId}`);

    try {
      // 2. Fetch dependencies
      const account = await prisma.socialAccount.findUniqueOrThrow({
        where: { id: socialAccountId }
      });
      const asset = await prisma.mediaAsset.findUniqueOrThrow({
        where: { id: mediaAssetId }
      });

      // 3. Setup provider and decrypt token
      const provider = registry.get(account.platform);
      const accessToken = encryption.decrypt(account.encryptedAccessToken);
      
      // 4. Execute upload
      const result = await provider.publish(accessToken, {
        mediaAssetId: asset.id,
        assetUrl: asset.assetUrl,
        mimeType: asset.mimeType,
      });

      if (!result.success) {
        throw new Error(result.error || 'Unknown publishing error');
      }

      // 5. Mark as complete
      await prisma.socialPublishJob.update({
        where: { id: publishJobId },
        data: {
          status: 'PUBLISHED',
          platformPostId: result.platformPostId,
          platformPostUrl: result.platformPostUrl,
        },
      });

      console.log(`[SocialPublishing] Successfully completed job ${publishJobId}`);
    } catch (error: any) {
      console.error(`[SocialPublishing] Job ${publishJobId} failed:`, error);
      
      // Mark as failed. BullMQ will auto-retry based on the backoff config.
      await prisma.socialPublishJob.update({
        where: { id: publishJobId },
        data: {
          status: 'FAILED',
          failureReason: error.message || 'Unknown error',
        },
      });

      // Re-throw so BullMQ knows it failed
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
    },
    concurrency: 5,
  }
);
