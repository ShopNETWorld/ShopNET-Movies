import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCharacterDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  alias?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  ageRange?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  ethnicBackground?: string;

  @IsString()
  @IsOptional()
  visualPrompt?: string;

  @IsString()
  @IsOptional()
  voiceProvider?: string;

  @IsString()
  @IsOptional()
  voiceVoiceId?: string;

  @IsOptional()
  voiceCharacteristics?: Record<string, any>;

  @IsString()
  @IsOptional()
  referenceImageUrl?: string;

  @IsString()
  @IsOptional()
  referenceAudioUrl?: string;
}

export class UpdateCharacterDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  alias?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  ageRange?: string;

  @IsString()
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  ethnicBackground?: string;

  @IsString()
  @IsOptional()
  visualPrompt?: string;

  @IsString()
  @IsOptional()
  voiceProvider?: string;

  @IsString()
  @IsOptional()
  voiceVoiceId?: string;

  @IsOptional()
  voiceCharacteristics?: Record<string, any>;

  @IsString()
  @IsOptional()
  referenceImageUrl?: string;

  @IsString()
  @IsOptional()
  referenceAudioUrl?: string;
}
