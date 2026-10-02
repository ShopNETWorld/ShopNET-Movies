import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { GrantCreditsDto, DeductCreditsDto } from './dto/credit.dto';
import type { CreditAccount, CreditTransaction } from '@shopnet/types';
import { Logger } from '@shopnet/logger';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CreditsService {
  private readonly logger = new Logger('credits-service');

  // In-memory fallback for when database is unavailable
  private inMemoryAccounts = new Map<string, CreditAccount>();
  private inMemoryTransactions = new Map<string, CreditTransaction>();
  private idempotencyRegistry = new Map<string, CreditTransaction>();

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  private get db() {
    return this.prisma?.getClient?.();
  }

  async getOrCreateAccount(userId: string): Promise<CreditAccount> {
    if (this.db) {
      const account = await this.db.creditAccount.upsert({
        where: { userId },
        create: {
          userId,
          balanceCredits: 0,
          lifetimeGrantedCredits: 0,
          lifetimeConsumedCredits: 0,
        },
        update: {},
      });
      return {
        id: account.id,
        userId: account.userId,
        balanceCredits: account.balanceCredits,
        lifetimeGrantedCredits: account.lifetimeGrantedCredits,
        lifetimeConsumedCredits: account.lifetimeConsumedCredits,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
      };
    }

    // In-memory fallback
    let account = this.inMemoryAccounts.get(userId);
    if (!account) {
      account = {
        id: `crd_acc_${userId}`,
        userId,
        balanceCredits: 0,
        lifetimeGrantedCredits: 0,
        lifetimeConsumedCredits: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.inMemoryAccounts.set(userId, account);
    }
    return account;
  }

  async getBalance(userId: string): Promise<number> {
    const account = await this.getOrCreateAccount(userId);
    return account.balanceCredits;
  }

  async grantCredits(userId: string, dto: GrantCreditsDto): Promise<CreditTransaction> {
    if (this.db) {
      return this.grantCreditsDb(userId, dto);
    }
    return this.grantCreditsInMemory(userId, dto);
  }

  async deductCredits(userId: string, dto: DeductCreditsDto): Promise<CreditTransaction> {
    if (this.db) {
      return this.deductCreditsDb(userId, dto);
    }
    return this.deductCreditsInMemory(userId, dto);
  }

  async getLedger(userId: string): Promise<CreditTransaction[]> {
    if (this.db) {
      const account = await this.getOrCreateAccount(userId);
      const transactions = await this.db.creditTransaction.findMany({
        where: { accountId: account.id },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      return transactions.map((t: any) => ({
        id: t.id,
        accountId: t.accountId,
        amount: t.amount,
        balanceAfter: t.balanceAfter,
        reason: t.reason,
        referenceId: t.referenceId,
        idempotencyKey: t.idempotencyKey,
        createdAt: t.createdAt,
      }));
    }

    // In-memory fallback
    const account = await this.getOrCreateAccount(userId);
    return Array.from(this.inMemoryTransactions.values())
      .filter((t) => t.accountId === account.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // --- Database-backed implementations ---

  private async grantCreditsDb(userId: string, dto: GrantCreditsDto): Promise<CreditTransaction> {
    // Idempotency check
    const existing = await this.db.creditTransaction.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existing) {
      this.logger.info(`Idempotent replay for grant key: ${dto.idempotencyKey}`, {
        userId,
        transactionId: existing.id,
      });
      return {
        id: existing.id,
        accountId: existing.accountId,
        amount: existing.amount,
        balanceAfter: existing.balanceAfter,
        reason: existing.reason as any,
        referenceId: existing.referenceId,
        idempotencyKey: existing.idempotencyKey,
        createdAt: existing.createdAt,
      };
    }

    // Atomic operation using Prisma interactive transaction
    const result = await this.db.$transaction(async (tx: any) => {
      if (dto.idempotencyKey) {
        const existingTx = await tx.creditTransaction.findUnique({
          where: { idempotencyKey: dto.idempotencyKey },
        });
        if (existingTx) return existingTx;
      }

      const account = await tx.creditAccount.upsert({
        where: { userId },
        create: {
          userId,
          balanceCredits: 0,
          lifetimeGrantedCredits: 0,
          lifetimeConsumedCredits: 0,
        },
        update: {},
      });

      const newBalance = account.balanceCredits + dto.amount;

      await tx.creditAccount.update({
        where: { id: account.id },
        data: {
          balanceCredits: newBalance,
          lifetimeGrantedCredits: account.lifetimeGrantedCredits + dto.amount,
        },
      });

      const transaction = await tx.creditTransaction.create({
        data: {
          accountId: account.id,
          amount: dto.amount,
          balanceAfter: newBalance,
          reason: dto.reason,
          referenceId: dto.referenceId,
          idempotencyKey: dto.idempotencyKey,
        },
      });

      return transaction;
    });

    this.logger.info(`Credits granted: +${dto.amount}`, {
      userId,
      amount: dto.amount,
      reason: dto.reason,
      idempotencyKey: dto.idempotencyKey,
      newBalance: result.balanceAfter,
    });

    return {
      id: result.id,
      accountId: result.accountId,
      amount: result.amount,
      balanceAfter: result.balanceAfter,
      reason: result.reason as any,
      referenceId: result.referenceId,
      idempotencyKey: result.idempotencyKey,
      createdAt: result.createdAt,
    };
  }

  private async deductCreditsDb(userId: string, dto: DeductCreditsDto): Promise<CreditTransaction> {
    // Idempotency check
    const existing = await this.db.creditTransaction.findUnique({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existing) {
      this.logger.info(`Idempotent replay for deduction key: ${dto.idempotencyKey}`, {
        userId,
        transactionId: existing.id,
      });
      return {
        id: existing.id,
        accountId: existing.accountId,
        amount: existing.amount,
        balanceAfter: existing.balanceAfter,
        reason: existing.reason as any,
        referenceId: existing.referenceId,
        idempotencyKey: existing.idempotencyKey,
        createdAt: existing.createdAt,
      };
    }

    // Atomic check-and-deduct
    const result = await this.db.$transaction(async (tx: any) => {
      if (dto.idempotencyKey) {
        const existingTx = await tx.creditTransaction.findUnique({
          where: { idempotencyKey: dto.idempotencyKey },
        });
        if (existingTx) return existingTx;
      }

      const account = await tx.creditAccount.findUnique({ where: { userId } });
      if (!account) {
        throw new BadRequestException('Credit account not found');
      }

      if (account.balanceCredits < dto.amount) {
        throw new BadRequestException(
          `Insufficient credit balance. Required: ${dto.amount}, Available: ${account.balanceCredits}`,
        );
      }

      const newBalance = account.balanceCredits - dto.amount;

      await tx.creditAccount.update({
        where: { id: account.id },
        data: {
          balanceCredits: newBalance,
          lifetimeConsumedCredits: account.lifetimeConsumedCredits + dto.amount,
        },
      });

      const transaction = await tx.creditTransaction.create({
        data: {
          accountId: account.id,
          amount: -dto.amount,
          balanceAfter: newBalance,
          reason: dto.reason,
          referenceId: dto.referenceId,
          idempotencyKey: dto.idempotencyKey,
        },
      });

      return transaction;
    });

    this.logger.info(`Credits deducted: -${dto.amount}`, {
      userId,
      amount: dto.amount,
      reason: dto.reason,
      idempotencyKey: dto.idempotencyKey,
      newBalance: result.balanceAfter,
    });

    return {
      id: result.id,
      accountId: result.accountId,
      amount: result.amount,
      balanceAfter: result.balanceAfter,
      reason: result.reason as any,
      referenceId: result.referenceId,
      idempotencyKey: result.idempotencyKey,
      createdAt: result.createdAt,
    };
  }

  // --- In-memory fallbacks (preserved from Phase 03 for resilient mode) ---

  private async grantCreditsInMemory(userId: string, dto: GrantCreditsDto): Promise<CreditTransaction> {
    const existing = this.idempotencyRegistry.get(dto.idempotencyKey);
    if (existing) {
      this.logger.info(`Idempotent replay for grant key: ${dto.idempotencyKey}`, {
        userId,
        transactionId: existing.id,
      });
      return existing;
    }

    const account = await this.getOrCreateAccount(userId);
    const newBalance = account.balanceCredits + dto.amount;

    account.balanceCredits = newBalance;
    account.lifetimeGrantedCredits += dto.amount;
    account.updatedAt = new Date();

    const txId = `ctx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const transaction: CreditTransaction = {
      id: txId,
      accountId: account.id,
      amount: dto.amount,
      balanceAfter: newBalance,
      reason: dto.reason,
      referenceId: dto.referenceId,
      idempotencyKey: dto.idempotencyKey,
      createdAt: new Date(),
    };

    this.inMemoryTransactions.set(txId, transaction);
    this.idempotencyRegistry.set(dto.idempotencyKey, transaction);

    this.logger.info(`Credits granted: +${dto.amount} (new balance: ${newBalance})`, {
      userId,
      amount: dto.amount,
      reason: dto.reason,
      idempotencyKey: dto.idempotencyKey,
    });

    return transaction;
  }

  private async deductCreditsInMemory(userId: string, dto: DeductCreditsDto): Promise<CreditTransaction> {
    const existing = this.idempotencyRegistry.get(dto.idempotencyKey);
    if (existing) {
      this.logger.info(`Idempotent replay for deduction key: ${dto.idempotencyKey}`, {
        userId,
        transactionId: existing.id,
      });
      return existing;
    }

    const account = await this.getOrCreateAccount(userId);

    if (account.balanceCredits < dto.amount) {
      throw new BadRequestException(
        `Insufficient credit balance. Required: ${dto.amount}, Available: ${account.balanceCredits}`,
      );
    }

    const newBalance = account.balanceCredits - dto.amount;
    account.balanceCredits = newBalance;
    account.lifetimeConsumedCredits += dto.amount;
    account.updatedAt = new Date();

    const txId = `ctx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const transaction: CreditTransaction = {
      id: txId,
      accountId: account.id,
      amount: -dto.amount,
      balanceAfter: newBalance,
      reason: dto.reason,
      referenceId: dto.referenceId,
      idempotencyKey: dto.idempotencyKey,
      createdAt: new Date(),
    };

    this.inMemoryTransactions.set(txId, transaction);
    this.idempotencyRegistry.set(dto.idempotencyKey, transaction);

    this.logger.info(`Credits deducted: -${dto.amount} (new balance: ${newBalance})`, {
      userId,
      amount: dto.amount,
      reason: dto.reason,
      idempotencyKey: dto.idempotencyKey,
    });

    return transaction;
  }
}
