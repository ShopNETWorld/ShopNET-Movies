import { Injectable, Logger, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { SubmitJobDto, ModelRegistry } from '@shopnet/ai-gateway';
import { JobStatus } from '@shopnet/database';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class AiGatewayService {
  private readonly logger = new Logger(AiGatewayService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @InjectQueue('media-generation') private readonly mediaGenerationQueue: Queue,
  ) {}

  async submitJob(userId: string, dto: SubmitJobDto) {
    this.logger.log(`Received job request for operation ${dto.operation} with model ${dto.modelId}`);

    const modelMeta = ModelRegistry.getModel(dto.modelId);
    if (!modelMeta) {
      throw new NotFoundException(`Model ${dto.modelId} not found in registry`);
    }

    if (!modelMeta.operations.includes(dto.operation as any)) {
      throw new BadRequestException(`Model ${dto.modelId} does not support operation ${dto.operation}`);
    }

    // Initialize Job in Database
    const job = await this.prisma.getClient().generationJob.create({
      data: {
        projectId: dto.projectId,
        userId,
        sceneId: dto.sceneId,
        operation: dto.operation,
        provider: modelMeta.provider,
        model: dto.modelId,
        status: JobStatus.QUEUED,
        inputParameters: dto.inputParameters,
      },
    });

    // Enqueue job for background processing
    await this.mediaGenerationQueue.add(
      'generate',
      {
        jobId: job.id,
        operation: dto.operation,
        model: dto.modelId,
        inputParams: dto.inputParameters,
        userId,
        projectId: dto.projectId,
      },
      {
        jobId: job.id,
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
      }
    );

    return job;
  }
}
