import type Stripe from 'stripe';
import { Logger } from '@shopnet/logger';
import type {
  InitPaymentParams,
  PaymentSession,
  PaymentVerification,
  RefundResult,
} from '@shopnet/types';
import type { PaymentProvider } from './payment-provider.interface.js';

const logger = new Logger('stripe-provider');

/**
 * Stripe payment provider implementation.
 * Uses the official Stripe Node.js SDK.
 * Webhook verification: stripe.webhooks.constructEvent().
 */
export class StripeProvider implements PaymentProvider {
  readonly name = 'stripe';
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder_key_for_testing';
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

    if (!process.env.STRIPE_SECRET_KEY) {
      logger.warn('STRIPE_SECRET_KEY not set — Stripe provider will not function in production');
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const StripeSDK = require('stripe');
    const StripeConstructor = StripeSDK.default || StripeSDK;
    this.stripe = new StripeConstructor(secretKey, {
      apiVersion: '2025-04-30.basil' as any,
    });
  }

  async initializePayment(params: InitPaymentParams): Promise<PaymentSession> {
    logger.info('Initializing Stripe Checkout Session', {
      email: params.email,
      amount: params.amount,
      currency: params.currency,
    });

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer_email: params.email,
      payment_method_types: ['card'],
      mode: params.planCode ? 'subscription' : 'payment',
      success_url: params.callbackUrl || `${process.env.APP_URL || 'http://localhost:3000'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL || 'http://localhost:3000'}/billing/cancel`,
      metadata: {
        ...(params.metadata || {}),
        reference: params.reference || '',
      },
      line_items: [],
    };

    if (params.planCode) {
      // Subscription mode — use existing Stripe Price ID
      sessionParams.line_items = [{ price: params.planCode, quantity: 1 }];
    } else {
      // One-time payment
      sessionParams.line_items = [{
        price_data: {
          currency: (params.currency || 'usd').toLowerCase(),
          product_data: { name: 'ShopNET Credits' },
          unit_amount: params.amount,
        },
        quantity: 1,
      }];
    }

    const session = await this.stripe.checkout.sessions.create(sessionParams);

    return {
      authorizationUrl: session.url || '',
      reference: params.reference || session.id,
      providerSessionId: session.id,
    };
  }

  async verifyPayment(reference: string): Promise<PaymentVerification> {
    logger.info('Verifying Stripe payment', { reference });

    try {
      // reference could be a checkout session ID or payment intent ID
      let paymentIntent: Stripe.PaymentIntent | undefined;

      if (reference.startsWith('cs_')) {
        // Checkout Session ID
        const session = await this.stripe.checkout.sessions.retrieve(reference);
        if (session.payment_intent) {
          paymentIntent = await this.stripe.paymentIntents.retrieve(session.payment_intent as string);
        }
      } else if (reference.startsWith('pi_')) {
        paymentIntent = await this.stripe.paymentIntents.retrieve(reference);
      }

      if (!paymentIntent) {
        return {
          verified: false,
          reference,
          amount: 0,
          currency: 'usd',
          status: 'not_found',
        };
      }

      return {
        verified: paymentIntent.status === 'succeeded',
        reference,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        paidAt: paymentIntent.status === 'succeeded' ? new Date() : undefined,
        customerEmail: paymentIntent.receipt_email || undefined,
        providerData: paymentIntent as any,
      };
    } catch (error: any) {
      logger.error('Stripe verification failed', { error: error.message });
      return {
        verified: false,
        reference,
        amount: 0,
        currency: 'usd',
        status: 'error',
      };
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    logger.info('Cancelling Stripe subscription', { subscriptionId });

    await this.stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    logger.info('Stripe subscription set to cancel at period end', { subscriptionId });
  }

  async refundPayment(reference: string, amount?: number): Promise<RefundResult> {
    logger.info('Processing Stripe refund', { reference, amount });

    try {
      const refundParams: Stripe.RefundCreateParams = {};

      if (reference.startsWith('pi_')) {
        refundParams.payment_intent = reference;
      } else if (reference.startsWith('ch_')) {
        refundParams.charge = reference;
      }

      if (amount) {
        refundParams.amount = amount;
      }

      const refund = await this.stripe.refunds.create(refundParams);

      return {
        success: refund.status === 'succeeded' || refund.status === 'pending',
        refundId: refund.id,
        amount: refund.amount,
        currency: refund.currency,
      };
    } catch (error: any) {
      logger.error('Stripe refund failed', { error: error.message });
      return {
        success: false,
        amount: amount || 0,
        currency: 'usd',
      };
    }
  }

  /**
   * Verify Stripe webhook signature using the official SDK.
   */
  verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
    try {
      this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
      return true;
    } catch (error: any) {
      logger.warn('Stripe webhook signature verification failed', { error: error.message });
      return false;
    }
  }

  /**
   * Construct and return the verified Stripe event from a webhook payload.
   */
  constructWebhookEvent(rawBody: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
  }
}
