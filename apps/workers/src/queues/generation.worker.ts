import { Worker, Job } from 'bullmq';
import { Logger } from '@shopnet/logger';
import { PrismaClient } from '@shopnet/database';
import { 
  ProviderRegistry, 
  GeminiProvider, 
  MockProvider, 
  QwenWanProvider, 
  ByteDanceSeedanceProvider, 
  PollinationsFreeProvider, 
  ModelRegistry 
} from '@shopnet/ai-gateway';
import { QUEUE_NAMES } from './queue.constants.js';

const logger = new Logger('generation-worker');

export class GenerationWorker {
  private worker: Worker;
  private prisma: PrismaClient;
  private providerRegistry: ProviderRegistry;

  constructor() {
    this.prisma = new PrismaClient();
    this.providerRegistry = new ProviderRegistry();
    
    // Register the providers
    this.providerRegistry.register(new GeminiProvider());
    this.providerRegistry.register(new MockProvider());
    this.providerRegistry.register(new QwenWanProvider());
    this.providerRegistry.register(new ByteDanceSeedanceProvider());
    this.providerRegistry.register(new PollinationsFreeProvider());

    const connection = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    };

    this.worker = new Worker(
      QUEUE_NAMES.MEDIA_GENERATION,
      this.processJob.bind(this),
      { connection, concurrency: 5 }
    );

    this.worker.on('completed', (job) => {
      logger.info(`Job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      logger.error(`Job ${job?.id} failed`, { reason: err.message });
    });
  }

  async close() {
    await this.worker.close();
    await this.prisma.$disconnect();
  }

  private async processJob(job: Job) {
    const { jobId, operation, model, inputParams, userId, projectId } = job.data;

    logger.info(`Processing media generation job ${jobId}`, { operation, model });

    const modelMeta = ModelRegistry.getModel(model);
    if (!modelMeta) {
      throw new Error(`Model ${model} not found in registry`);
    }

    const provider = this.providerRegistry.getProvider(modelMeta.provider);
    if (!provider) {
      throw new Error(`Provider ${modelMeta.provider} is not registered`);
    }

    // Update status to running
    await this.prisma.generationJob.update({
      where: { id: jobId },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    try {
      // Execute via Provider adapter
      const result = await provider.executeJob(operation, model, inputParams);

      // Record Usage
      await this.prisma.usageRecord.create({
        data: {
          userId,
          projectId,
          jobId,
          provider: provider.name,
          model,
          operation,
          inputUnits: result.inputUnits,
          outputUnits: result.outputUnits,
          providerCostUsd: result.estimatedCostUsd,
          creditsCharged: Math.ceil(result.estimatedCostUsd * 100),
        },
      });

      // Update Job
      await this.prisma.generationJob.update({
        where: { id: jobId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          providerRequestId: result.providerRequestId,
          estimatedCostUsd: result.estimatedCostUsd,
          durationSeconds: result.durationSeconds,
          progressPercent: 100,
        },
      });

      // Generate MediaAsset
      for (const output of result.outputs) {
        const mediaAsset = await this.prisma.mediaAsset.create({
          data: {
            projectId,
            uploaderId: userId,
            type: operation === 'IMAGE_GENERATION' ? 'IMAGE' : 'VIDEO',
            storageKey: output.url,
            assetUrl: output.url,
            filename: `generated-${jobId}`,
            mimeType: operation === 'IMAGE_GENERATION' ? 'image/png' : 'video/mp4',
            provider: provider.name,
            model,
            generationJobId: jobId,
            metadata: output.metadata,
          },
        });

        await this.prisma.generationOutput.create({
          data: {
            jobId,
            mediaAssetId: mediaAsset.id,
            outputType: 'PRIMARY',
          }
        });
      }

      return { status: 'success', result };
    } catch (error: any) {
      await this.prisma.generationJob.update({
        where: { id: jobId },
        data: {
          status: 'FAILED',
          failureReason: error.message,
          completedAt: new Date(),
        },
      });
      throw error;
    }
  }
}
