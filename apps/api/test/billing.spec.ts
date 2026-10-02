import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as crypto from 'crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../src/database/prisma.service';
import { CreditsService } from '../src/credits/credits.service';
import { BillingService } from '../src/billing/billing.service';
import { WebhooksController } from '../src/billing/webhooks.controller';
import { PaymentProviderRegistry } from '../src/billing/providers/payment-provider.registry';
import { PaystackProvider } from '../src/billing/providers/paystack.provider';
import { StripeProvider } from '../src/billing/providers/stripe.provider';
import { NotFoundException } from '@nestjs/common';

describe('Billing, Subscriptions & Payments Suite (Phase 07)', () => {
  describe('1. Payment Provider Registry & Polymorphism', () => {
    let registry: PaymentProviderRegistry;

    beforeEach(() => {
      registry = new PaymentProviderRegistry();
    });

    it('should register and resolve payment providers dynamically', () => {
      const paystack = new PaystackProvider();
      const stripe = new StripeProvider();

      registry.register(paystack);
      registry.register(stripe);

      expect(registry.listProviders()).toEqual(['paystack', 'stripe']);
      expect(registry.getProvider('paystack')).toBe(paystack);
      expect(registry.getProvider('stripe')).toBe(stripe);
    });

    it('should throw NotFoundException when requested provider is unregistered', () => {
      expect(() => registry.getProviderOrThrow('flutterwave')).toThrow(NotFoundException);
    });
  });

  describe('2. Provider Cryptographic Webhook Signatures', () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    it('should verify Paystack HMAC SHA-512 signatures accurately and reject tampered payloads', () => {
      const secret = 'sk_test_paystack_secret_12345';
      process.env.PAYSTACK_SECRET_KEY = secret;

      const provider = new PaystackProvider();
      const payload = JSON.stringify({ event: 'charge.success', data: { reference: 'ref_123' } });
      const rawBody = Buffer.from(payload, 'utf8');

      // Valid HMAC SHA-512 signature
      const validSignature = crypto
        .createHmac('sha512', secret)
        .update(rawBody)
        .digest('hex');

      expect(provider.verifyWebhookSignature(rawBody, validSignature)).toBe(true);

      // Tampered payload
      const tamperedRawBody = Buffer.from(JSON.stringify({ event: 'charge.success', data: { reference: 'ref_HACK' } }));
      expect(provider.verifyWebhookSignature(tamperedRawBody, validSignature)).toBe(false);

      // Tampered signature
      expect(provider.verifyWebhookSignature(rawBody, 'invalid_signature_hex')).toBe(false);
    });

    it('should safely reject Stripe webhook signature when signing secret is unset or invalid', () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;
      const provider = new StripeProvider();
      const rawBody = Buffer.from('{"id":"evt_1"}', 'utf8');

      expect(provider.verifyWebhookSignature(rawBody, 't=123,v1=abc')).toBe(false);
    });
  });

  describe('3. BillingService & Subscription Lifecycle', () => {
    let billingService: BillingService;
    let creditsService: CreditsService;
    let mockPrismaClient: any;

    const mockPlan = {
      id: 'plan_starter_monthly',
      name: 'Starter Monthly',
      slug: 'starter-monthly',
      amountNgn: 500000,
      amountUsdCents: 500,
      interval: 'MONTHLY',
      creditsPerCycle: 250,
      isActive: true,
      paystackPlanCode: 'PLN_starter_ngn',
      stripePriceId: 'price_starter_usd',
    };

    beforeEach(async () => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any, init?: any) => {
        const urlStr = String(url);
        if (urlStr.includes('/transaction/initialize')) {
          let ref = 'ref_paystack_test';
          if (init?.body) {
            try {
              const parsed = JSON.parse(init.body);
              if (parsed.reference) ref = parsed.reference;
            } catch {}
          }
          return {
            ok: true,
            json: async () => ({
              status: true,
              message: 'Authorization URL created',
              data: {
                authorization_url: 'https://checkout.paystack.com/test_auth_code',
                access_code: 'test_access_code_123',
                reference: ref,
              },
            }),
          } as any;
        }
        if (urlStr.includes('/refund')) {
          return {
            ok: true,
            json: async () => ({
              status: true,
              message: 'Refund queued',
              data: {
                amount: 500000,
                currency: 'NGN',
                status: 'processed',
              },
            }),
          } as any;
        }
        return {
          ok: true,
          json: async () => ({ status: true, data: {} }),
        } as any;
      });

      const dbStorage = {
        plans: [mockPlan],
        payments: new Map<string, any>(),
        subscriptions: new Map<string, any>(),
        auditLogs: [] as any[],
        webhookEvents: new Map<string, any>(),
        creditAccounts: new Map<string, any>(),
        creditTransactions: new Map<string, any>(),
      };

      mockPrismaClient = {
        subscriptionPlan: {
          findMany: vi.fn(async ({ where }: any) => {
            return dbStorage.plans.filter((p) => !where?.isActive || p.isActive);
          }),
          findUnique: vi.fn(async ({ where }: any) => {
            return dbStorage.plans.find((p) => p.id === where.id) || null;
          }),
        },
        payment: {
          create: vi.fn(async ({ data }: any) => {
            const id = `pay_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            const record = { id, createdAt: new Date(), ...data };
            dbStorage.payments.set(id, record);
            dbStorage.payments.set(data.providerReference, record);
            return record;
          }),
          findUnique: vi.fn(async ({ where }: any) => {
            if (where.id) return dbStorage.payments.get(where.id) || null;
            if (where.providerReference) return dbStorage.payments.get(where.providerReference) || null;
            return null;
          }),
          findMany: vi.fn(async ({ where }: any) => {
            return Array.from(new Set(dbStorage.payments.values())).filter((p) => p.userId === where.userId);
          }),
          update: vi.fn(async ({ where, data }: any) => {
            const existing = dbStorage.payments.get(where.id);
            if (!existing) throw new Error('Payment not found');
            const updated = { ...existing, ...data };
            dbStorage.payments.set(where.id, updated);
            dbStorage.payments.set(updated.providerReference, updated);
            return updated;
          }),
        },
        subscription: {
          create: vi.fn(async ({ data }: any) => {
            const id = `sub_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            const record = { id, createdAt: new Date(), ...data };
            dbStorage.subscriptions.set(id, record);
            return record;
          }),
          findFirst: vi.fn(async ({ where }: any) => {
            const all = Array.from(dbStorage.subscriptions.values());
            if (where.providerSubscriptionId && where.provider) {
              const match = all.find(
                (s) => s.providerSubscriptionId === where.providerSubscriptionId && s.provider === where.provider,
              );
              if (match) return { ...match, plan: mockPlan };
              return null;
            }
            if (where.userId && where.status === 'ACTIVE') {
              const match = all.find((s) => s.userId === where.userId && s.status === 'ACTIVE');
              if (match) return { ...match, plan: mockPlan };
              return null;
            }
            return null;
          }),
          findUnique: vi.fn(async ({ where }: any) => {
            const match = dbStorage.subscriptions.get(where.id);
            if (match) return { ...match, plan: mockPlan };
            return null;
          }),
          update: vi.fn(async ({ where, data }: any) => {
            const existing = dbStorage.subscriptions.get(where.id);
            if (!existing) throw new Error('Subscription not found');
            const updated = { ...existing, ...data };
            dbStorage.subscriptions.set(where.id, updated);
            return updated;
          }),
        },
        securityAuditLog: {
          create: vi.fn(async ({ data }: any) => {
            dbStorage.auditLogs.push(data);
            return data;
          }),
        },
        webhookEvent: {
          findUnique: vi.fn(async ({ where }: any) => {
            const key = `${where.provider_eventId.provider}:${where.provider_eventId.eventId}`;
            return dbStorage.webhookEvents.get(key) || null;
          }),
          create: vi.fn(async ({ data }: any) => {
            const key = `${data.provider}:${data.eventId}`;
            dbStorage.webhookEvents.set(key, data);
            return data;
          }),
          update: vi.fn(async ({ where, data }: any) => {
            const key = `${where.provider_eventId.provider}:${where.provider_eventId.eventId}`;
            const existing = dbStorage.webhookEvents.get(key);
            const updated = { ...existing, ...data };
            dbStorage.webhookEvents.set(key, updated);
            return updated;
          }),
        },
        creditAccount: {
          upsert: vi.fn(async ({ where, create }: any) => {
            let account = dbStorage.creditAccounts.get(where.userId);
            if (!account) {
              account = {
                id: `crd_acc_${where.userId}`,
                userId: where.userId,
                balanceCredits: create.balanceCredits ?? 0,
                lifetimeGrantedCredits: create.lifetimeGrantedCredits ?? 0,
                lifetimeConsumedCredits: create.lifetimeConsumedCredits ?? 0,
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              dbStorage.creditAccounts.set(where.userId, account);
            }
            return account;
          }),
          findUnique: vi.fn(async ({ where }: any) => {
            return dbStorage.creditAccounts.get(where.userId) || null;
          }),
          update: vi.fn(async ({ where, data }: any) => {
            const account = Array.from(dbStorage.creditAccounts.values()).find((a) => a.id === where.id);
            if (!account) throw new Error('Account not found');
            Object.assign(account, data);
            return account;
          }),
        },
        creditTransaction: {
          findUnique: vi.fn(async ({ where }: any) => {
            if (where.idempotencyKey) {
              return dbStorage.creditTransactions.get(where.idempotencyKey) || null;
            }
            return null;
          }),
          create: vi.fn(async ({ data }: any) => {
            const id = `crd_tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
            const tx = { id, createdAt: new Date(), ...data };
            if (data.idempotencyKey) {
              dbStorage.creditTransactions.set(data.idempotencyKey, tx);
            }
            return tx;
          }),
          findMany: vi.fn(async ({ where }: any) => {
            return Array.from(dbStorage.creditTransactions.values()).filter((t) => t.accountId === where.accountId);
          }),
        },
        $transaction: vi.fn(async (cb: (tx: any) => Promise<any>) => {
          return cb(mockPrismaClient);
        }),
      };

      const mockPrismaService = {
        connected: true,
        getClient: () => mockPrismaClient,
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          BillingService,
          CreditsService,
          { provide: PrismaService, useValue: mockPrismaService },
        ],
      }).compile();

      billingService = module.get<BillingService>(BillingService);
      creditsService = module.get<CreditsService>(CreditsService);
    });

    it('should list all active subscription plans', async () => {
      const plans = await billingService.listPlans();
      expect(plans).toHaveLength(1);
      expect(plans[0].slug).toBe('starter-monthly');
    });

    it('should initialize subscription checkout and persist pending payment record', async () => {
      const session = await billingService.initializeSubscription(
        'user_nollywood_1',
        'creator@nollywood.ng',
        'plan_starter_monthly',
        'paystack',
      );

      expect(session).toBeDefined();
      expect(session.paymentId).toBeDefined();
      expect(session.reference).toMatch(/^sub_user_nollywood_1_plan_starter_monthly_/);
      expect(session.authorizationUrl).toBeDefined();

      const payment = await mockPrismaClient.payment.findUnique({
        where: { id: session.paymentId },
      });
      expect(payment.status).toBe('PENDING');
      expect(payment.amount).toBe(500000);
      expect(payment.currency).toBe('NGN');
    });

    it('should activate subscription, grant credits, and log audit event on payment success', async () => {
      const initResult = await billingService.initializeSubscription(
        'user_nollywood_2',
        'producer@nollywood.ng',
        'plan_starter_monthly',
        'paystack',
      );

      const subscription = await billingService.handlePaymentSuccess(
        'paystack',
        initResult.reference,
        'sub_paystack_ext_123',
        'cust_paystack_ext_456',
      );

      expect(subscription).toBeDefined();
      expect(subscription.status).toBe('ACTIVE');

      // Verify payment was updated to SUCCESS
      const payment = await mockPrismaClient.payment.findUnique({
        where: { id: initResult.paymentId },
      });
      expect(payment.status).toBe('SUCCESS');
      expect(payment.subscriptionId).toBe(subscription.id);

      // Verify credits were granted
      const balance = await creditsService.getBalance('user_nollywood_2');
      expect(balance).toBe(250);

      // Verify audit log
      expect(mockPrismaClient.securityAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user_nollywood_2',
            event: 'SUBSCRIPTION_ACTIVATED',
          }),
        }),
      );
    });

    it('should guarantee idempotency on duplicate payment success webhooks (no duplicate credits)', async () => {
      const initResult = await billingService.initializeSubscription(
        'user_nollywood_idem',
        'director@nollywood.ng',
        'plan_starter_monthly',
        'paystack',
      );

      // First webhook delivery
      await billingService.handlePaymentSuccess(
        'paystack',
        initResult.reference,
        'sub_ext_idem_1',
      );

      const balance1 = await creditsService.getBalance('user_nollywood_idem');
      expect(balance1).toBe(250);

      // Duplicate webhook delivery
      await billingService.handlePaymentSuccess(
        'paystack',
        initResult.reference,
        'sub_ext_idem_1',
      );

      const balance2 = await creditsService.getBalance('user_nollywood_idem');
      expect(balance2).toBe(250); // Balance remains unchanged
    });

    it('should process subscription cancellation and set cancelAtPeriodEnd flag', async () => {
      const initResult = await billingService.initializeSubscription(
        'user_nollywood_cancel',
        'cancel@nollywood.ng',
        'plan_starter_monthly',
        'paystack',
      );

      await billingService.handlePaymentSuccess('paystack', initResult.reference, 'sub_ext_cancel');

      const result = await billingService.cancelSubscription('user_nollywood_cancel');
      expect(result.message).toContain('current billing period');

      expect(mockPrismaClient.securityAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user_nollywood_cancel',
            event: 'SUBSCRIPTION_CANCELLED',
          }),
        }),
      );
    });

    it('should process refund and deduct granted credits from user account', async () => {
      const initResult = await billingService.initializeSubscription(
        'user_nollywood_refund',
        'refund@nollywood.ng',
        'plan_starter_monthly',
        'paystack',
      );

      await billingService.handlePaymentSuccess('paystack', initResult.reference, 'sub_ext_refund');

      const balanceBefore = await creditsService.getBalance('user_nollywood_refund');
      expect(balanceBefore).toBe(250);

      const refundResult = await billingService.processRefund(initResult.paymentId, 'Customer dissatisfaction');
      expect(refundResult.success).toBe(true);

      const balanceAfter = await creditsService.getBalance('user_nollywood_refund');
      expect(balanceAfter).toBe(0);

      expect(mockPrismaClient.securityAuditLog.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user_nollywood_refund',
            event: 'PAYMENT_REFUNDED',
          }),
        }),
      );
    });
  });

  describe('4. WebhooksController Security & Idempotency', () => {
    let controller: WebhooksController;
    let mockPrismaClient: any;

    beforeEach(async () => {
      process.env.PAYSTACK_SECRET_KEY = 'sk_test_secret_for_controller';

      const webhookStore = new Map<string, any>();

      mockPrismaClient = {
        webhookEvent: {
          findUnique: vi.fn(async ({ where }: any) => {
            const key = `${where.provider_eventId.provider}:${where.provider_eventId.eventId}`;
            return webhookStore.get(key) || null;
          }),
          create: vi.fn(async ({ data }: any) => {
            const key = `${data.provider}:${data.eventId}`;
            webhookStore.set(key, data);
            return data;
          }),
          update: vi.fn(async ({ where, data }: any) => {
            const key = `${where.provider_eventId.provider}:${where.provider_eventId.eventId}`;
            const existing = webhookStore.get(key);
            const updated = { ...existing, ...data };
            webhookStore.set(key, updated);
            return updated;
          }),
        },
        securityAuditLog: {
          create: vi.fn(async () => ({})),
        },
      };

      const mockPrismaService = {
        connected: true,
        getClient: () => mockPrismaClient,
      };

      const module: TestingModule = await Test.createTestingModule({
        controllers: [WebhooksController],
        providers: [
          BillingService,
          CreditsService,
          { provide: PrismaService, useValue: mockPrismaService },
        ],
      }).compile();

      controller = module.get<WebhooksController>(WebhooksController);
    });

    it('should reject webhook request missing cryptographic signature with 400', async () => {
      const mockReq: any = {
        headers: {},
        rawBody: Buffer.from('{}'),
      };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.handlePaystack(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Missing signature' }));
    });

    it('should reject webhook request with invalid HMAC signature with 400', async () => {
      const mockReq: any = {
        headers: {
          'x-paystack-signature': 'invalid_tampered_signature',
        },
        rawBody: Buffer.from(JSON.stringify({ event: 'charge.success' })),
      };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.handlePaystack(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid signature' }));
    });

    it('should accept webhook request with valid cryptographic signature with 200', async () => {
      const secret = process.env.PAYSTACK_SECRET_KEY!;
      const payload = JSON.stringify({
        event: 'charge.success',
        data: {
          id: 998877,
          reference: 'ref_valid_event',
          customer: { customer_code: 'cust_1' },
        },
      });
      const rawBody = Buffer.from(payload, 'utf8');
      const signature = crypto.createHmac('sha512', secret).update(rawBody).digest('hex');

      const mockReq: any = {
        headers: {
          'x-paystack-signature': signature,
        },
        rawBody,
      };
      const mockRes: any = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.handlePaystack(mockReq, mockRes);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ received: true });
    });
  });
});
