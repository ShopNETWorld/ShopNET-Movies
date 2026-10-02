import { IsString, IsEnum, IsObject, IsOptional, IsNotEmpty } from 'class-validator';
import { GenerationOperation } from '@shopnet/database';

export class SubmitJobDto {
  @IsString()
  @IsNotEmpty()
  projectId!: string;

  @IsOptional()
  @IsString()
  sceneId?: string;

  @IsEnum(GenerationOperation)
  operation!: GenerationOperation;

  @IsString()
  @IsNotEmpty()
  modelId!: string;

  @IsObject()
  inputParameters!: Record<string, any>;
}
