import { IsInt, IsNotEmpty, IsOptional, IsString, IsIn, Min } from 'class-validator';
import { CreditTransactionReason } from '@shopnet/types';

export class GrantCreditsDto {
  @IsInt()
  @Min(1)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['PURCHASE', 'SUBSCRIPTION_GRANT', 'ADMIN_ADJUSTMENT', 'REFUND'])
  reason!: CreditTransactionReason;

  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;

  @IsString()
  @IsOptional()
  referenceId?: string;
}

export class DeductCreditsDto {
  @IsInt()
  @Min(1)
  amount!: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['GENERATION_DEDUCTION', 'ADMIN_ADJUSTMENT'])
  reason!: CreditTransactionReason;

  @IsString()
  @IsNotEmpty()
  idempotencyKey!: string;

  @IsString()
  @IsOptional()
  referenceId?: string;
}
