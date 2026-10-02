import { IsString, IsNotEmpty, IsOptional, IsIn, IsNumber, IsObject } from 'class-validator';
import { GenerationOperation, JobStatus } from '@shopnet/types';

export class CreateGenerationJobDto {
  @IsString()
  @IsNotEmpty()
  @IsIn([
    'TEXT_TO_VIDEO',
    'IMAGE_TO_VIDEO',
    'VIDEO_EDITING',
    'VIDEO_EXTENSION',
    'IMAGE_GENERATION',
    'VOICE_GENERATION',
    'TRANSLATION',
    'CAPTIONS',
  ])
  operation!: GenerationOperation;

  @IsString()
  @IsNotEmpty()
  provider!: string;

  @IsString()
  @IsNotEmpty()
  model!: string;

  @IsString()
  @IsOptional()
  sceneId?: string;

  @IsObject()
  @IsNotEmpty()
  inputParameters!: Record<string, any>;

  @IsNumber()
  @IsOptional()
  estimatedCostUsd?: number;

  @IsNumber()
  @IsOptional()
  creditsRequired?: number;
}

export class UpdateJobStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED', 'RETRYING'])
  status!: JobStatus;

  @IsNumber()
  @IsOptional()
  progressPercent?: number;

  @IsString()
  @IsOptional()
  providerRequestId?: string;

  @IsNumber()
  @IsOptional()
  actualCostUsd?: number;

  @IsString()
  @IsOptional()
  failureReason?: string;
}
