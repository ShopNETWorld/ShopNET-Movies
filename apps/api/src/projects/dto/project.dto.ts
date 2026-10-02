import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';
import { AspectRatio, ProjectStatus } from '@shopnet/types';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  logline?: string;

  @IsString()
  @IsOptional()
  synopsis?: string;

  @IsString()
  @IsNotEmpty()
  genre!: string;

  @IsString()
  @IsOptional()
  targetAudience?: string;

  @IsString()
  @IsNotEmpty()
  primaryLanguage!: string;

  @IsString()
  @IsOptional()
  secondaryLanguage?: string;

  @IsString()
  @IsOptional()
  @IsIn(['16:9', '9:16', '1:1', '2.39:1'])
  aspectRatio?: AspectRatio;

  @IsString()
  @IsOptional()
  workspaceId?: string;
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  logline?: string;

  @IsString()
  @IsOptional()
  synopsis?: string;

  @IsString()
  @IsOptional()
  genre?: string;

  @IsString()
  @IsOptional()
  targetAudience?: string;

  @IsString()
  @IsOptional()
  primaryLanguage?: string;

  @IsString()
  @IsOptional()
  secondaryLanguage?: string;

  @IsString()
  @IsOptional()
  @IsIn(['16:9', '9:16', '1:1', '2.39:1'])
  aspectRatio?: AspectRatio;

  @IsString()
  @IsOptional()
  @IsIn(['DRAFT', 'IN_PROGRESS', 'PRODUCED', 'ARCHIVED'])
  status?: ProjectStatus;
}
