import { Injectable } from '@nestjs/common';
import { AiProvider } from '../interfaces/ai-provider.interface';
import { GenerationOperation } from '@shopnet/database';

@Injectable()
export class ProviderRegistry {
  private providers: Map<string, AiProvider> = new Map();

  register(provider: AiProvider) {
    this.providers.set(provider.name.toLowerCase(), provider);
  }

  getProvider(name: string): AiProvider | undefined {
    return this.providers.get(name.toLowerCase());
  }

  getProvidersForOperation(operation: GenerationOperation): AiProvider[] {
    return Array.from(this.providers.values()).filter(p => p.supportsOperation(operation));
  }
}
