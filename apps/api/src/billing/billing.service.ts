import { Injectable, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { Logger } from '@shopnet/logger';
import { PrismaService } from '../database/prisma.service';
import { CreditsService } from '../credits/credits.service';
import { PaymentProviderRegistry } from './providers/payment-provider.registry';
import { PaystackProvider } from './providers/paystack.provider';
import { StripeProvider } from './providers/stripe.provider';

const logger = new Logger('billing-service');

@Injectable()
export class BillingService {
  private readonly providerRegistry: PaymentProviderRegistry;

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(CreditsService) private readonly creditsService: CreditsService,
  ) {
    this.providerRegistry = new PaymentProviderRegistry();
    this.providerRegistry.register(new PaystackProvider());
    this.providerRegistry.register(new StripeProvider());
    logger.info('BillingService initialized with providers', {
      providers: this.providerRegistry.listProviders(),
    });
  }

  /**
   * List all active subscription plans.
   */
  async listPlans() {
    const client = this.prisma.getClient();
    if (!client) return [];

    return client.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
  }

  /**
   * Initialize a payment session for a subscription plan.
   */
  async initializeSubscription(
    userId: string,
    email: string,
    planId: string,
    providerName: string,
    callbackUrl?: string,
  ) {
    const client = this.prisma.getClient();
    if (!client) throw new BadRequestException('Database not available');

    const plan = await client.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan not found or inactive');
    }

    const provider = this.providerRegistry.getProviderOrThrow(providerName);

    // Determine plan code and amount based on provider
    let planCode: string | undefined;
    let amount: number;
    let currency: string;

    if (providerName === 'paystack') {
      planCode = plan.paystackPlanCode || undefined;
      amount = plan.amountNgn; // kobo
      currency = 'NGN';
    } else {
      planCode = plan.stripePriceId || undefined;
      amount = plan.amountUsdCents; // cents
      currency = 'USD';
    }

    // Generate idempotent reference
    const reference = `sub_${userId}_${planId}_${Date.now()}`;

    // Create a pending payment record
    const payment = await client.payment.create({
      data: {
        userId,
        provider: providerName,
        providerReference: reference,
        amount,
        currency,
        status: 'PENDING',
        metadata: { planId, planSlug: plan.slug },
      },
    });

    const session = await provider.initializePayment({
      email,
      amount,
      currency,
      planCode,
      reference,
      callbackUrl,
      metadata: {
        userId,
        planId,
        paymentId: payment.id,
      },
    });

    logger.info('Payment session initialized', {
      userId,
      planId,
      provider: providerName,
      reference: session.reference,
    });

    return {
      paymentId: payment.id,
      ...session,
    };
  }

  /**
   * Handle a successful payment/subscription activation.
   * Called after webhook verification confirms payment.
   */
  async handlePaymentSuccess(
    providerName: string,
    reference: string,
    providerSubscriptionId?: string,
    providerCustomerId?: string,
  ) {
    const client = this.prisma.getClient();
    if (!client) throw new Error('Database not available');

    // Find the payment record
    const payment = await client.payment.findUnique({
      where: { providerReference: reference },
    });

    if (!payment) {
      logger.warn('Payment not found for reference', { reference });
      return;
    }

    if (payment.status === 'SUCCESS') {
      logger.info('Payment already processed (idempotent)', { reference });
      return;
    }

    // Update payment status
    await client.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SUCCESS',
        paidAt: new Date(),
      },
    });

    // Find the plan from metadata
    const metadata = payment.metadata as any;
    const planId = metadata?.planId;

    if (!planId) {
      logger.warn('No planId in payment metadata', { reference });
      return;
    }

    const plan = await client.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      logger.warn('Plan not found', { planId });
      return;
    }

    // Create or update the subscription
    const now = new Date();
    const periodEnd = new Date(now);
    if (plan.interval === 'MONTHLY') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    const subscription = await client.subscription.create({
      data: {
        userId: payment.userId,
        planId: plan.id,
        provider: providerName,
        providerSubscriptionId: providerSubscriptionId || null,
        providerCustomerId: providerCustomerId || null,
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    // Link payment to subscription
    await client.payment.update({
      where: { id: payment.id },
      data: { subscriptionId: subscription.id },
    });

    // Grant credits for this billing cycle
    await this.creditsService.grantCredits(payment.userId, {
      amount: plan.creditsPerCycle,
      reason: 'SUBSCRIPTION_GRANT',
      idempotencyKey: `sub_grant_${subscription.id}_${now.toISOString().slice(0, 10)}`,
      referenceId: subscription.id,
    });

    // Audit log
    await client.securityAuditLog.create({
      data: {
        userId: payment.userId,
        event: 'SUBSCRIPTION_ACTIVATED',
        metadata: {
          planId: plan.id,
          planName: plan.name,
          subscriptionId: subscription.id,
          provider: providerName,
          amount: payment.amount,
          currency: payment.currency,
        },
      },
    });

    logger.info('Subscription activated and credits granted', {
      userId: payment.userId,
      planName: plan.name,
      credits: plan.creditsPerCycle,
      subscriptionId: subscription.id,
    });

    return subscription;
  }

  /**
   * Handle subscription renewal (webhook-triggered).
   */
  async handleSubscriptionRenewal(
    providerName: string,
    providerSubscriptionId: string,
    reference: string,
    amount: number,
    currency: string,
  ) {
    const client = this.prisma.getClient();
    if (!client) throw new Error('Database not available');

    const subscription = await client.subscription.findFirst({
      where: {
        providerSubscriptionId,
        provider: providerName,
      },
      include: { plan: true },
    });

    if (!subscription) {
      logger.warn('Subscription not found for renewal', { providerSubscriptionId });
      return;
    }

    // Create payment record for the renewal
    await client.payment.create({
      data: {
        userId: subscription.userId,
        subscriptionId: subscription.id,
        provider: providerName,
        providerReference: reference,
        amount,
        currency,
        status: 'SUCCESS',
        paidAt: new Date(),
      },
    });

    // Extend the subscription period
    const now = new Date();
    const periodEnd = new Date(now);
    if (subscription.plan.interval === 'MONTHLY') {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    } else {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    }

    await client.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'ACTIVE',
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });

    // Grant renewal credits
    await this.creditsService.grantCredits(subscription.userId, {
      amount: subscription.plan.creditsPerCycle,
      reason: 'SUBSCRIPTION_GRANT',
      idempotencyKey: `renewal_${subscription.id}_${reference}`,
      referenceId: subscription.id,
    });

    logger.info('Subscription renewed', {
      subscriptionId: subscription.id,
      credits: subscription.plan.creditsPerCycle,
    });
  }

  /**
   * Get a user's current active subscription.
   */
  async getUserSubscription(userId: string) {
    const client = this.prisma.getClient();
    if (!client) return null;

    return client.subscription.findFirst({
      where: {
        userId,
        status: { in: ['ACTIVE', 'PAST_DUE', 'TRIALING'] },
      },
      include: {
        plan: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Cancel a subscription at the end of the current period.
   */
  async cancelSubscription(userId: string) {
    const client = this.prisma.getClient();
    if (!client) throw new BadRequestException('Database not available');

    const subscription = await client.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
      },
    });

    if (!subscription) {
      throw new NotFoundException('No active subscription found');
    }

    // Cancel on the provider side
    if (subscription.providerSubscriptionId) {
      try {
        const provider = this.providerRegistry.getProviderOrThrow(subscription.provider);
        await provider.cancelSubscription(subscription.providerSubscriptionId);
      } catch (error: any) {
        logger.warn('Provider cancellation failed (will still cancel locally)', {
          error: error.message,
        });
      }
    }

    await client.subscription.update({
      where: { id: subscription.id },
      data: {
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
      },
    });

    // Audit log
    await client.securityAuditLog.create({
      data: {
        userId,
        event: 'SUBSCRIPTION_CANCELLED',
        metadata: {
          subscriptionId: subscription.id,
          provider: subscription.provider,
        },
      },
    });

    logger.info('Subscription cancelled at period end', {
      userId,
      subscriptionId: subscription.id,
    });

    return { message: 'Subscription will be cancelled at the end of the current billing period.' };
  }

  /**
   * Get payment history for a user.
   */
  async getPaymentHistory(userId: string) {
    const client = this.prisma.getClient();
    if (!client) return [];

    return client.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Admin-only: Process a refund for a payment.
   */
  async processRefund(paymentId: string, reason: string) {
    const client = this.prisma.getClient();
    if (!client) throw new BadRequestException('Database not available');

    const payment = await client.payment.findUnique({ where: { id: paymentId } });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'SUCCESS') {
      throw new BadRequestException('Can only refund successful payments');
    }

    // Refund on the provider side
    const provider = this.providerRegistry.getProviderOrThrow(payment.provider);
    const refundResult = await provider.refundPayment(payment.providerReference);

    // Update payment record
    await client.payment.update({
      where: { id: payment.id },
      data: {
        status: refundResult.success ? 'REFUNDED' : payment.status,
        refundedAt: refundResult.success ? new Date() : undefined,
        refundAmountSubunits: refundResult.amount,
      },
    });

    // If the payment was for a subscription, reverse credits
    if (payment.subscriptionId) {
      const subscription = await client.subscription.findUnique({
        where: { id: payment.subscriptionId },
        include: { plan: true },
      });

      if (subscription) {
        try {
          await this.creditsService.deductCredits(payment.userId, {
            amount: subscription.plan.creditsPerCycle,
            reason: 'REFUND',
            idempotencyKey: `refund_${payment.id}`,
            referenceId: payment.id,
          });
        } catch (err: any) {
          logger.warn('Could not deduct credits for refund (user may have spent them)', {
            error: err.message,
          });
        }
      }
    }

    // Audit log
    await client.securityAuditLog.create({
      data: {
        userId: payment.userId,
        event: 'PAYMENT_REFUNDED',
        metadata: {
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          reason,
          refundResult,
        },
      },
    });

    logger.info('Refund processed', {
      paymentId: payment.id,
      success: refundResult.success,
    });

    return refundResult;
  }

  /**
   * Get the provider registry for webhook controllers.
   */
  getProviderRegistry(): PaymentProviderRegistry {
    return this.providerRegistry;
  }
}
