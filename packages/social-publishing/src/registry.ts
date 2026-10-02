import { SocialProvider } from './providers/social-provider.interface';

export class SocialProviderRegistry {
  private providers = new Map<string, SocialProvider>();

  register(provider: SocialProvider) {
    this.providers.set(provider.name, provider);
  }

  get(name: string): SocialProvider {
    const provider = this.providers.get(name);
    if (!provider) {
      throw new Error(`SocialProvider ${name} not found`);
    }
    return provider;
  }

  list(): SocialProvider[] {
    return Array.from(this.providers.values());
  }
}
