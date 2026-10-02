import { IsString, IsNotEmpty, IsOptional, IsInt, IsNumber, IsIn, Min } from 'class-validator';
import { TimeOfDay, CameraMovement } from '@shopnet/types';

export class CreateSceneDto {
  @IsInt()
  @Min(1)
  sceneNumber!: number;

  @IsString()
  @IsNotEmpty()
  slugline!: string;

  @IsString()
  @IsOptional()
  heading?: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsOptional()
  scriptId?: string;

  @IsNumber()
  @IsOptional()
  estimatedDurationSeconds?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  @IsIn(['DAY', 'NIGHT', 'DUSK', 'DAWN'])
  timeOfDay?: TimeOfDay;

  @IsString()
  @IsOptional()
  visualStyle?: string;

  @IsString()
  @IsOptional()
  prompt?: string;

  @IsString()
  @IsOptional()
  negativePrompt?: string;

  @IsString()
  @IsOptional()
  @IsIn(['STATIC', 'PAN', 'TILT', 'TRACK', 'ZOOM', 'DRONE', 'HANDHELD'])
  cameraMovement?: CameraMovement;

  @IsOptional()
  dialogue?: Array<{ character: string; line: string; emotion?: string }>;

  @IsInt()
  @IsOptional()
  orderIndex?: number;
}

export class UpdateSceneDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  sceneNumber?: number;

  @IsString()
  @IsOptional()
  slugline?: string;

  @IsString()
  @IsOptional()
  heading?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  scriptId?: string;

  @IsNumber()
  @IsOptional()
  estimatedDurationSeconds?: number;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  @IsIn(['DAY', 'NIGHT', 'DUSK', 'DAWN'])
  timeOfDay?: TimeOfDay;

  @IsString()
  @IsOptional()
  visualStyle?: string;

  @IsString()
  @IsOptional()
  prompt?: string;

  @IsString()
  @IsOptional()
  negativePrompt?: string;

  @IsString()
  @IsOptional()
  @IsIn(['STATIC', 'PAN', 'TILT', 'TRACK', 'ZOOM', 'DRONE', 'HANDHELD'])
  cameraMovement?: CameraMovement;

  @IsOptional()
  dialogue?: Array<{ character: string; line: string; emotion?: string }>;

  @IsInt()
  @IsOptional()
  orderIndex?: number;
}
