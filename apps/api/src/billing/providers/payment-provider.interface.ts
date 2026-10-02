import type {
  InitPaymentParams,
  PaymentSession,
  PaymentVerification,
  RefundResult,
} from '@shopnet/types';

/**
 * Provider-agnostic interface for payment gateways.
 * Each concrete provider (Paystack, Stripe) implements this contract.
 */
export interface PaymentProvider {
  /** Unique identifier for the provider (e.g. "paystack", "stripe") */
  readonly name: string;

  /** Initialize a payment/checkout session for the user */
  initializePayment(params: InitPaymentParams): Promise<PaymentSession>;

  /** Verify that a payment was completed successfully */
  verifyPayment(reference: string): Promise<PaymentVerification>;

  /** Cancel an active subscription */
  cancelSubscription(subscriptionCode: string): Promise<void>;

  /** Issue a refund for a completed payment */
  refundPayment(reference: string, amount?: number): Promise<RefundResult>;

  /** Verify the cryptographic signature of an incoming webhook */
  verifyWebhookSignature(rawBody: Buffer, signature: string): boolean;
}

/**
 * Parameters for creating a plan on a payment provider.
 */
export interface CreatePlanParams {
  name: string;
  interval: 'monthly' | 'annually';
  amount: number;
  currency: string;
}

/**
 * Result from creating a plan on a payment provider.
 */
export interface ProviderPlan {
  providerPlanCode: string;
  name: string;
  amount: number;
  currency: string;
  interval: string;
}
