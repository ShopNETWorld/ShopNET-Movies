import {
  Controller,
  Post,
  Req,
  Res,
  HttpCode,
  Inject,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { Logger } from '@shopnet/logger';
import { PrismaService } from '../database/prisma.service';
import { BillingService } from './billing.service';

const logger = new Logger('webhooks-controller');

/**
 * Webhook endpoints for payment providers.
 * 
 * IMPORTANT: These endpoints do NOT use AuthGuard.
 * Security is provided by cryptographic signature verification per-provider.
 * 
 * Both endpoints:
 * 1. Verify the signature.
 * 2. Return 200 immediately (async processing).
 * 3. Deduplicate by provider event ID via WebhookEvent table.
 * 4. Dispatch to BillingService for fulfillment.
 * 5. Log to SecurityAuditLog.
 */
@Throttle({ webhooks: { limit: 30, ttl: 60000 } })
@Controller('api/v1/webhooks')
export class WebhooksController {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(BillingService) private readonly billingService: BillingService,
  ) {}

  /**
   * Paystack Webhook Endpoint.
   * Verifies HMAC SHA-512 signature.
   */
  @Post('paystack')
  @HttpCode(200)
  async handlePaystack(@Req() req: Request, @Res() res: Response) {
    const signature = req.headers['x-paystack-signature'] as string;
    if (!signature) {
      logger.warn('Paystack webhook received without signature');
      return res.status(400).json({ error: 'Missing signature' });
    }

    // Get the raw body — requires rawBody middleware
    const rawBody = (req as any).rawBody as Buffer;
    if (!rawBody) {
      logger.error('Raw body not available for Paystack webhook verification');
      return res.status(500).json({ error: 'Server misconfiguration: raw body not captured' });
    }

    // Verify signature
    const registry = this.billingService.getProviderRegistry();
    const paystack = registry.getProviderOrThrow('paystack');
    if (!paystack.verifyWebhookSignature(rawBody, signature)) {
      logger.warn('Paystack webhook signature verification failed');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Respond immediately — never trust client status
    res.status(200).json({ received: true });

    // Process asynchronously
    try {
      const event = JSON.parse(rawBody.toString());
      await this.processPaystackEvent(event);
    } catch (error: any) {
      logger.error('Error processing Paystack webhook', { error: error.message });
    }
  }

  /**
   * Stripe Webhook Endpoint.
   * Verifies Stripe signature via stripe.webhooks.constructEvent().
   */
  @Post('stripe')
  @HttpCode(200)
  async handleStripe(@Req() req: Request, @Res() res: Response) {
    const signature = req.headers['stripe-signature'] as string;
    if (!signature) {
      logger.warn('Stripe webhook received without signature');
      return res.status(400).json({ error: 'Missing signature' });
    }

    const rawBody = (req as any).rawBody as Buffer;
    if (!rawBody) {
      logger.error('Raw body not available for Stripe webhook verification');
      return res.status(500).json({ error: 'Server misconfiguration: raw body not captured' });
    }

    // Verify signature
    const registry = this.billingService.getProviderRegistry();
    const stripe = registry.getProviderOrThrow('stripe');
    if (!stripe.verifyWebhookSignature(rawBody, signature)) {
      logger.warn('Stripe webhook signature verification failed');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    // Respond immediately
    res.status(200).json({ received: true });

    // Process asynchronously
    try {
      const event = JSON.parse(rawBody.toString());
      await this.processStripeEvent(event);
    } catch (error: any) {
      logger.error('Error processing Stripe webhook', { error: error.message });
    }
  }

  // --- Event Processors ---

  private async processPaystackEvent(event: any) {
    const eventType = event.event;
    const data = event.data;

    // Deduplicate using the Paystack reference as event ID
    const eventId = data?.reference || `ps_${Date.now()}`;

    const isDuplicate = await this.recordWebhookEvent('paystack', eventId, eventType, event);
    if (isDuplicate) {
      logger.info('Duplicate Paystack webhook skipped', { eventId, eventType });
      return;
    }

    logger.info('Processing Paystack event', { eventType, eventId });

    switch (eventType) {
      case 'charge.success':
        await this.billingService.handlePaymentSuccess(
          'paystack',
          data.reference,
          data.subscription?.subscription_code,
          data.customer?.customer_code,
        );
        break;

      case 'subscription.create':
        logger.info('Paystack subscription created', {
          subscriptionCode: data.subscription_code,
          customerEmail: data.customer?.email,
        });
        break;

      case 'invoice.payment_failed':
        logger.warn('Paystack invoice payment failed', {
          subscriptionCode: data.subscription?.subscription_code,
          reason: data.gateway_response,
        });
        break;

      case 'subscription.disable':
        logger.info('Paystack subscription disabled', {
          subscriptionCode: data.subscription_code,
        });
        break;

      default:
        logger.info('Unhandled Paystack event', { eventType });
    }

    await this.markEventProcessed('paystack', eventId);
  }

  private async processStripeEvent(event: any) {
    const eventType = event.type;
    const eventId = event.id;
    const data = event.data?.object;

    const isDuplicate = await this.recordWebhookEvent('stripe', eventId, eventType, event);
    if (isDuplicate) {
      logger.info('Duplicate Stripe webhook skipped', { eventId, eventType });
      return;
    }

    logger.info('Processing Stripe event', { eventType, eventId });

    switch (eventType) {
      case 'checkout.session.completed':
        if (data.mode === 'subscription' || data.mode === 'payment') {
          const reference = data.metadata?.reference || data.id;
          await this.billingService.handlePaymentSuccess(
            'stripe',
            reference,
            data.subscription,
            data.customer,
          );
        }
        break;

      case 'invoice.payment_succeeded':
        // Subscription renewal
        if (data.subscription && data.billing_reason === 'subscription_cycle') {
          await this.billingService.handleSubscriptionRenewal(
            'stripe',
            data.subscription,
            data.id, // Invoice ID as reference
            data.amount_paid,
            data.currency,
          );
        }
        break;

      case 'invoice.payment_failed':
        logger.warn('Stripe invoice payment failed', {
          subscriptionId: data.subscription,
          reason: data.last_payment_error?.message,
        });
        break;

      case 'customer.subscription.deleted':
        logger.info('Stripe subscription deleted', {
          subscriptionId: data.id,
        });
        break;

      default:
        logger.info('Unhandled Stripe event', { eventType });
    }

    await this.markEventProcessed('stripe', eventId);
  }

  // --- Deduplication Helpers ---

  /**
   * Record a webhook event for deduplication.
   * Returns true if the event was already recorded (duplicate).
   */
  private async recordWebhookEvent(
    provider: string,
    providerEventId: string,
    eventType: string,
    payload: any,
  ): Promise<boolean> {
    const client = this.prisma.getClient();
    if (!client) return false;

    try {
      await client.webhookEvent.create({
        data: {
          provider,
          providerEventId,
          eventType,
          payload,
          processed: false,
        },
      });
      return false; // New event
    } catch (error: any) {
      // Unique constraint violation — this event was already recorded
      if (error.code === 'P2002') {
        return true;
      }
      logger.error('Error recording webhook event', { error: error.message });
      return false;
    }
  }

  /**
   * Mark a webhook event as successfully processed.
   */
  private async markEventProcessed(provider: string, providerEventId: string) {
    const client = this.prisma.getClient();
    if (!client) return;

    try {
      await client.webhookEvent.updateMany({
        where: { provider, providerEventId },
        data: {
          processed: true,
          processedAt: new Date(),
        },
      });
    } catch (error: any) {
      logger.error('Error marking webhook event as processed', { error: error.message });
    }
  }
}
