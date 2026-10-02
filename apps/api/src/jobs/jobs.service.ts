import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateGenerationJobDto, UpdateJobStatusDto } from './dto/job.dto';
import { ProjectsService } from '../projects/projects.service';
import { GenerationJobMetadata, UsageRecordSummary } from '@shopnet/types';
import { Logger } from '@shopnet/logger';

@Injectable()
export class JobsService {
  private readonly logger = new Logger('jobs-service');
  private inMemoryJobs = new Map<string, GenerationJobMetadata>();
  private inMemoryUsageRecords = new Map<string, UsageRecordSummary>();

  constructor(
    @Inject(ProjectsService) private readonly projectsService: ProjectsService,
  ) {}

  async createJob(projectId: string, userId: string, dto: CreateGenerationJobDto): Promise<GenerationJobMetadata> {
    await this.projectsService.getProject(projectId, userId);

    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const job: GenerationJobMetadata = {
      id,
      projectId,
      userId,
      sceneId: dto.sceneId,
      operation: dto.operation,
      provider: dto.provider,
      model: dto.model,
      status: 'QUEUED',
      progressPercent: 0,
      inputParameters: dto.inputParameters,
      estimatedCostUsd: dto.estimatedCostUsd || 0.05,
      creditsConsumed: dto.creditsRequired || 10,
      retryCount: 0,
      maxRetries: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.inMemoryJobs.set(id, job);
    this.logger.info(`Generation job queued: ${job.id} (${job.operation})`, {
      jobId: id,
      projectId,
      provider: job.provider,
      model: job.model,
    });

    return job;
  }

  async getJob(jobId: string, userId: string): Promise<GenerationJobMetadata> {
    const job = this.inMemoryJobs.get(jobId);
    if (!job) {
      throw new NotFoundException(`Generation job with ID '${jobId}' not found`);
    }

    if (job.userId !== userId) {
      await this.projectsService.getProject(job.projectId, userId);
    }

    return job;
  }

  async listJobs(projectId: string, userId: string): Promise<GenerationJobMetadata[]> {
    await this.projectsService.getProject(projectId, userId);
    return Array.from(this.inMemoryJobs.values()).filter((j) => j.projectId === projectId);
  }

  async updateJobStatus(jobId: string, dto: UpdateJobStatusDto): Promise<GenerationJobMetadata> {
    const job = this.inMemoryJobs.get(jobId);
    if (!job) {
      throw new NotFoundException(`Job '${jobId}' not found`);
    }

    const updated: GenerationJobMetadata = {
      ...job,
      status: dto.status,
      ...(dto.progressPercent !== undefined && { progressPercent: dto.progressPercent }),
      ...(dto.providerRequestId && { providerRequestId: dto.providerRequestId }),
      ...(dto.actualCostUsd !== undefined && { actualCostUsd: dto.actualCostUsd }),
      ...(dto.failureReason && { failureReason: dto.failureReason }),
      ...(dto.status === 'RUNNING' && !job.startedAt && { startedAt: new Date() }),
      ...(dto.status === 'COMPLETED' && { completedAt: new Date(), progressPercent: 100 }),
      ...(dto.status === 'FAILED' && { completedAt: new Date() }),
      updatedAt: new Date(),
    };

    this.inMemoryJobs.set(jobId, updated);

    if (dto.status === 'COMPLETED' || dto.status === 'FAILED') {
      const usageId = `usg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const usageRecord: UsageRecordSummary = {
        id: usageId,
        userId: job.userId,
        projectId: job.projectId,
        jobId: job.id,
        provider: job.provider,
        model: job.model,
        operation: job.operation,
        inputUnits: 1,
        outputUnits: dto.status === 'COMPLETED' ? 1 : 0,
        providerCostUsd: dto.actualCostUsd || job.estimatedCostUsd,
        creditsCharged: job.creditsConsumed,
        createdAt: new Date(),
      };
      this.inMemoryUsageRecords.set(usageId, usageRecord);
    }

    this.logger.info(`Job ${jobId} transitioned to ${dto.status}`, {
      jobId,
      status: dto.status,
      progressPercent: updated.progressPercent,
    });

    return updated;
  }

  async getUsageRecords(userId: string): Promise<UsageRecordSummary[]> {
    return Array.from(this.inMemoryUsageRecords.values()).filter((r) => r.userId === userId);
  }
}
