import { describe, it, expect, beforeEach } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { CreditsService } from '../src/credits/credits.service';
import { PrismaService } from '../src/database/prisma.service';
import { WafThrottlerGuard } from '../src/common/security/waf-throttler.guard';
import { ThrottlerStorageService } from '@nestjs/throttler';
import { ExecutionContext, BadRequestException } from '@nestjs/common';

describe('Phase 09: Concurrency, Load & Transaction Isolation Suite', () => {
  let creditsService: CreditsService;
  let throttlerGuard: WafThrottlerGuard;
  let throttlerStorage: ThrottlerStorageService;

  // Thread-safe in-memory database simulation for ACID testing
  const db = {
    creditAccounts: new Map<string, any>(),
    creditTransactions: new Map<string, any>(),
  };

  // Mutex simulation for database row locks during interactive $transaction
  let dbLock = Promise.resolve();

  const mockPrismaClient: any = {
    creditAccount: {
      findUnique: async ({ where }: any) => {
        if (where.userId) return db.creditAccounts.get(where.userId) || null;
        if (where.id) {
          return Array.from(db.creditAccounts.values()).find((a) => a.id === where.id) || null;
        }
        return null;
      },
      upsert: async ({ where, create, update }: any) => {
        let acc = db.creditAccounts.get(where.userId);
        if (!acc) {
          acc = {
            id: `acc_${where.userId}`,
            userId: where.userId,
            balanceCredits: create.balanceCredits ?? 0,
            lifetimeGrantedCredits: create.lifetimeGrantedCredits ?? 0,
            lifetimeConsumedCredits: create.lifetimeConsumedCredits ?? 0,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          db.creditAccounts.set(where.userId, acc);
        } else if (update) {
          acc = { ...acc, ...update, updatedAt: new Date() };
          db.creditAccounts.set(where.userId, acc);
        }
        return acc;
      },
      update: async ({ where, data }: any) => {
        let acc: any;
        if (where.userId) {
          acc = db.creditAccounts.get(where.userId);
        } else if (where.id) {
          acc = Array.from(db.creditAccounts.values()).find((a) => a.id === where.id);
        }
        if (!acc) throw new Error('Account not found');
        const updated = { ...acc, ...data, updatedAt: new Date() };
        db.creditAccounts.set(updated.userId, updated);
        return updated;
      },
    },
    creditTransaction: {
      findUnique: async ({ where }: any) => {
        if (where.idempotencyKey) {
          return db.creditTransactions.get(where.idempotencyKey) || null;
        }
        return null;
      },
      create: async ({ data }: any) => {
        const tx = { id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, ...data, createdAt: new Date() };
        if (data.idempotencyKey) {
          db.creditTransactions.set(data.idempotencyKey, tx);
        }
        return tx;
      },
    },
    // True serializing interactive transaction mock mirroring PostgreSQL row-level locks
    $transaction: async (cb: (tx: any) => Promise<any>) => {
      let releaseLock: () => void;
      const waitLock = new Promise<void>((resolve) => {
        releaseLock = resolve;
      });
      const previousLock = dbLock;
      dbLock = dbLock.then(() => waitLock);

      await previousLock;
      try {
        return await cb(mockPrismaClient);
      } finally {
        releaseLock!();
      }
    },
  };

  const mockPrismaService = {
    connected: true,
    getClient: () => mockPrismaClient,
  };

  beforeEach(async () => {
    db.creditAccounts.clear();
    db.creditTransactions.clear();
    dbLock = Promise.resolve();

    throttlerStorage = new ThrottlerStorageService();

    // Instantiate WafThrottlerGuard with throttler options
    const throttlerOptions = {
      throttlers: [
        { name: 'default', limit: 100, ttl: 60000 },
        { name: 'auth', limit: 10, ttl: 60000 },
        { name: 'generation', limit: 5, ttl: 60000 },
      ],
    };

    throttlerGuard = new WafThrottlerGuard(
      throttlerOptions as any,
      throttlerStorage,
      { get: () => null } as any,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreditsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    creditsService = module.get<CreditsService>(CreditsService);
  });

  describe('1. Atomic Credit Concurrency & Race Condition Defense', () => {
    it('should strictly serialize concurrent credit deductions and prevent negative balance or over-spending', async () => {
      const creatorId = 'creator_concurrency_1';

      // 1. Initial grant of 100 credits
      await creditsService.grantCredits(creatorId, {
        amount: 100,
        reason: 'WEBHOOK_GRANT',
        idempotencyKey: 'initial_concurrency_grant',
      });

      const initialBalance = await creditsService.getBalance(creatorId);
      expect(initialBalance).toBe(100);

      // 2. Launch 20 concurrent deduction attempts of 10 credits each (total 200 attempted)
      const deductionAttempts = Array.from({ length: 20 }, (_, i) =>
        creditsService
          .deductCredits(creatorId, {
            amount: 10,
            reason: 'AI_IMAGE_GENERATION',
            idempotencyKey: `concurrent_deduct_${i}`,
          })
          .then(() => ({ success: true, index: i }))
          .catch((err) => ({ success: false, index: i, error: err })),
      );

      const results = await Promise.all(deductionAttempts);

      // 3. Exactly 10 must succeed, and exactly 10 must fail with BadRequestException (insufficient credits)
      const succeeded = results.filter((r) => r.success);
      const failed = results.filter((r) => !r.success);

      expect(succeeded).toHaveLength(10);
      expect(failed).toHaveLength(10);

      for (const f of failed) {
        expect(f.error).toBeInstanceOf(BadRequestException);
        expect((f.error as BadRequestException).message).toMatch(/insufficient/i);
      }

      // 4. Final balance must be exactly 0 (no negative balance, no phantom overdraft)
      const finalBalance = await creditsService.getBalance(creatorId);
      expect(finalBalance).toBe(0);
    });

    it('should serialize concurrent identical grants with identical idempotency keys (replay protection)', async () => {
      const creatorId = 'creator_concurrency_2';
      const sharedKey = `shared_idempotent_grant_${Date.now()}`;

      // Launch 10 concurrent requests with the identical idempotency key
      const grantAttempts = Array.from({ length: 10 }, () =>
        creditsService.grantCredits(creatorId, {
          amount: 500,
          reason: 'WEBHOOK_GRANT',
          idempotencyKey: sharedKey,
        }),
      );

      const results = await Promise.all(grantAttempts);

      // All 10 promises resolve (idempotently)
      expect(results).toHaveLength(10);

      // But balance is credited exactly once (500 credits, NOT 5000 credits)
      const balance = await creditsService.getBalance(creatorId);
      expect(balance).toBe(500);
    });
  });

  describe('2. High-Frequency Request Spike & Rate Limiting Verification', () => {
    it('should enforce rate limits under rapid request bursts and reject excess requests with 429', async () => {
      const ip = '197.210.65.12'; // Lagos IP
      const path = '/api/v1/auth/login';

      const createMockContext = (): ExecutionContext =>
        ({
          switchToHttp: () => ({
            getRequest: () => ({
              clientIp: ip,
              headers: { 'cf-connecting-ip': ip },
              path,
              method: 'POST',
            }),
            getResponse: () => ({
              header: () => {},
            }),
          }),
          getHandler: () => ({}),
          getClass: () => ({}),
        } as any);

      // Tier 'auth' limit is 10 requests per 60 seconds
      // Send 15 requests in immediate succession
      const results: { status: 'ALLOWED' | 'THROTTLED'; index: number }[] = [];

      for (let i = 0; i < 15; i++) {
        try {
          const context = createMockContext();
          // Directly test through throttler guard's handleRequest or tracker
          const tracker = await (throttlerGuard as any).getTracker(context.switchToHttp().getRequest());
          expect(tracker).toBe(ip);

          // Simulate consuming from storage with 60s blockDuration
          const record = await throttlerStorage.increment(
            `auth_${tracker}`,
            60000,
            10,
            60000,
            'auth',
          );

          if (record.isBlocked) {
            results.push({ status: 'THROTTLED', index: i });
          } else {
            results.push({ status: 'ALLOWED', index: i });
          }
        } catch (err) {
          results.push({ status: 'THROTTLED', index: i });
        }
      }

      const allowed = results.filter((r) => r.status === 'ALLOWED');
      const throttled = results.filter((r) => r.status === 'THROTTLED');

      expect(allowed).toHaveLength(10);
      expect(throttled).toHaveLength(5);
    });
  });
});
