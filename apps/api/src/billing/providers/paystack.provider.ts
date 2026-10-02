import * as crypto from 'crypto';
import { Logger } from '@shopnet/logger';
import type {
  InitPaymentParams,
  PaymentSession,
  PaymentVerification,
  RefundResult,
} from '@shopnet/types';
import type { PaymentProvider } from './payment-provider.interface.js';

const logger = new Logger('paystack-provider');

const PAYSTACK_API_BASE = 'https://api.paystack.co';

/**
 * Paystack payment provider implementation.
 * Uses raw fetch calls — no third-party SDK dependency.
 * Webhook verification: HMAC SHA-512 of raw body with secret key.
 */
export class PaystackProvider implements PaymentProvider {
  readonly name = 'paystack';
  private readonly secretKey: string;

  constructor() {
    this.secretKey = process.env.PAYSTACK_SECRET_KEY || '';
    if (!this.secretKey) {
      logger.warn('PAYSTACK_SECRET_KEY not set — Paystack provider will not function in production');
    }
  }

  async initializePayment(params: InitPaymentParams): Promise<PaymentSession> {
    logger.info('Initializing Paystack payment', {
      email: params.email,
      amount: params.amount,
      currency: params.currency,
    });

    const body: Record<string, any> = {
      email: params.email,
      amount: params.amount,     // Already in kobo
      currency: params.currency || 'NGN',
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    };

    if (params.planCode) {
      body.plan = params.planCode;
    }

    const response = await fetch(`${PAYSTACK_API_BASE}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json() as any;

    if (!data.status) {
      logger.error('Paystack initialization failed', { message: data.message });
      throw new Error(`Paystack initialization failed: ${data.message}`);
    }

    return {
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
      accessCode: data.data.access_code,
    };
  }

  async verifyPayment(reference: string): Promise<PaymentVerification> {
    logger.info('Verifying Paystack payment', { reference });

    const response = await fetch(`${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
      },
    });

    const data = await response.json() as any;

    if (!data.status) {
      return {
        verified: false,
        reference,
        amount: 0,
        currency: 'NGN',
        status: 'failed',
      };
    }

    const txn = data.data;
    return {
      verified: txn.status === 'success',
      reference: txn.reference,
      amount: txn.amount,
      currency: txn.currency,
      status: txn.status,
      paidAt: txn.paid_at ? new Date(txn.paid_at) : undefined,
      customerEmail: txn.customer?.email,
      providerData: txn,
    };
  }

  async cancelSubscription(subscriptionCode: string): Promise<void> {
    logger.info('Cancelling Paystack subscription', { subscriptionCode });

    // First, get the subscription to obtain the email token
    const getResponse = await fetch(`${PAYSTACK_API_BASE}/subscription/${encodeURIComponent(subscriptionCode)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
      },
    });

    const subData = await getResponse.json() as any;
    if (!subData.status) {
      throw new Error(`Failed to fetch subscription: ${subData.message}`);
    }

    const emailToken = subData.data.email_token;

    const response = await fetch(`${PAYSTACK_API_BASE}/subscription/disable`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: subscriptionCode,
        token: emailToken,
      }),
    });

    const data = await response.json() as any;
    if (!data.status) {
      throw new Error(`Paystack subscription cancellation failed: ${data.message}`);
    }

    logger.info('Paystack subscription cancelled', { subscriptionCode });
  }

  async refundPayment(reference: string, amount?: number): Promise<RefundResult> {
    logger.info('Processing Paystack refund', { reference, amount });

    // First verify the transaction to get the transaction ID
    const verifyRes = await fetch(`${PAYSTACK_API_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${this.secretKey}` },
    });

    const verifyData = await verifyRes.json() as any;
    if (!verifyData.status) {
      throw new Error(`Cannot find transaction for refund: ${reference}`);
    }

    const transactionId = verifyData.data.id;

    const body: Record<string, any> = { transaction: transactionId };
    if (amount) {
      body.amount = amount; // Partial refund in kobo
    }

    const response = await fetch(`${PAYSTACK_API_BASE}/refund`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json() as any;

    return {
      success: data.status === true,
      refundId: data.data?.id?.toString(),
      amount: data.data?.amount || amount || verifyData.data.amount,
      currency: data.data?.currency || 'NGN',
    };
  }

  /**
   * Verify Paystack webhook signature.
   * Paystack signs webhooks with HMAC SHA-512 using the secret key.
   */
  verifyWebhookSignature(rawBody: Buffer, signature: string): boolean {
    const hash = crypto
      .createHmac('sha512', this.secretKey)
      .update(rawBody)
      .digest('hex');

    return hash === signature;
  }
}
