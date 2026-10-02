import { IsString, IsNotEmpty, IsOptional, IsInt, Min } from 'class-validator';

export class CreateScriptDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsOptional()
  rawText?: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  version?: number;
}

export class UpdateScriptDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  rawText?: string;

  @IsOptional()
  isCurrent?: boolean;
}
