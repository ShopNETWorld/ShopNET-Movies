import { IsString, IsNotEmpty, IsOptional, IsIn, IsNumber } from 'class-validator';
import { MediaType } from '@shopnet/types';

export class RegisterMediaAssetDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['IMAGE', 'VIDEO', 'AUDIO', 'SCRIPT_DOCUMENT', 'SUBTITLE', 'THUMBNAIL'])
  type!: MediaType;

  @IsString()
  @IsNotEmpty()
  storageKey!: string;

  @IsString()
  @IsOptional()
  storageBucket?: string;

  @IsString()
  @IsNotEmpty()
  assetUrl!: string;

  @IsString()
  @IsNotEmpty()
  filename!: string;

  @IsString()
  @IsNotEmpty()
  mimeType!: string;

  @IsNumber()
  @IsOptional()
  fileSizeBytes?: number;

  @IsNumber()
  @IsOptional()
  width?: number;

  @IsNumber()
  @IsOptional()
  height?: number;

  @IsNumber()
  @IsOptional()
  durationSeconds?: number;

  @IsString()
  @IsOptional()
  resolution?: string;

  @IsString()
  @IsOptional()
  aspectRatio?: string;

  @IsString()
  @IsNotEmpty()
  provider!: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  sceneId?: string;

  @IsString()
  @IsOptional()
  characterId?: string;

  @IsString()
  @IsOptional()
  generationJobId?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}
