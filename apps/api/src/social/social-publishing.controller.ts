import { Controller, Post, Body, Get, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../database/prisma.service';

export interface PublishRequestDto {
  mediaAssetId: string;
  socialAccountIds: string[];
  scheduledAt?: string; // ISO Date string
}

@Controller('api/v1/social')
export class SocialPublishingController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @InjectQueue('social-publishing') private readonly publishQueue: Queue
  ) {}

  @Get('accounts')
  async listAccounts() {
    const accounts = await this.prisma.getClient().socialAccount.findMany({
      select: {
        id: true,
        platform: true,
        username: true,
        createdAt: true,
        tokenExpiresAt: true,
      },
    });
    return accounts;
  }

  @Post('publish')
  async publishAsset(@Body() body: PublishRequestDto) {
    const { mediaAssetId, socialAccountIds, scheduledAt } = body;

    const asset = await this.prisma.getClient().mediaAsset.findUnique({
      where: { id: mediaAssetId }
    });

    if (!asset) {
      throw new Error('MediaAsset not found');
    }

    const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;
    const delay = scheduledDate ? Math.max(0, scheduledDate.getTime() - Date.now()) : 0;

    const jobsCreated = [];

    // Fan-out to multiple platforms if requested
    for (const accountId of socialAccountIds) {
      // 1. Create DB record for tracking
      const publishJob = await this.prisma.getClient().socialPublishJob.create({
        data: {
          socialAccountId: accountId,
          mediaAssetId: mediaAssetId,
          status: 'QUEUED',
          scheduledAt: scheduledDate,
        },
      });

      // 2. Enqueue the task
      await this.publishQueue.add(
        'publish-asset',
        {
          publishJobId: publishJob.id,
          socialAccountId: accountId,
          mediaAssetId: mediaAssetId,
        },
        {
          jobId: publishJob.id,
          delay: delay,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        }
      );

      jobsCreated.push(publishJob);
    }

    return {
      message: 'Publishing jobs enqueued successfully',
      jobs: jobsCreated,
    };
  }

  @Get('jobs')
  async listJobs() {
    return this.prisma.getClient().socialPublishJob.findMany({
      include: {
        socialAccount: {
          select: { platform: true, username: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  }
}
