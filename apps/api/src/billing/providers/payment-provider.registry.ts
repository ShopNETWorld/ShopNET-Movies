import { NotFoundException } from '@nestjs/common';
import { Logger } from '@shopnet/logger';
import type { PaymentProvider } from './payment-provider.interface.js';

const logger = new Logger('payment-provider-registry');

/**
 * Dynamic registry for payment providers.
 * Mirrors the pattern used in AI Gateway and Social Publishing.
 */
export class PaymentProviderRegistry {
  private providers = new Map<string, PaymentProvider>();

  register(provider: PaymentProvider): void {
    this.providers.set(provider.name, provider);
    logger.info(`Registered payment provider: ${provider.name}`);
  }

  getProvider(name: string): PaymentProvider | undefined {
    return this.providers.get(name);
  }

  getProviderOrThrow(name: string): PaymentProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new NotFoundException(`Payment provider "${name}" is not registered`);
    }
    return provider;
  }

  listProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
