import { PublishJobData, PublishResult, SocialProvider } from './social-provider.interface';

/**
 * A generic Mock Provider used for local development and testing to simulate
 * OAuth flows and publishing to platforms like YouTube, TikTok, etc.
 */
export class MockSocialProvider implements SocialProvider {
  constructor(public readonly name: string) {}

  getAuthUrl(state: string): string {
    return `https://mock-${this.name.toLowerCase()}.com/oauth/authorize?client_id=mock&response_type=code&state=${state}`;
  }

  async exchangeCode(code: string) {
    return {
      accessToken: `mock-access-token-${this.name}-${code}`,
      refreshToken: `mock-refresh-token-${this.name}-${code}`,
      expiresIn: 3600,
      accountId: `mock-account-id-${Math.floor(Math.random() * 10000)}`,
      username: `Mock ${this.name} User`
    };
  }

  async refreshToken(refreshToken: string) {
    return {
      accessToken: `mock-new-access-token-${this.name}-${Date.now()}`,
      expiresIn: 3600,
    };
  }

  async publish(accessToken: string, jobData: PublishJobData): Promise<PublishResult> {
    console.log(`[${this.name}] Simulating upload of asset ${jobData.mediaAssetId} from ${jobData.assetUrl}`);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate a rare random failure (10% chance)
    if (Math.random() < 0.1) {
      return {
        success: false,
        error: 'Random simulated network failure during upload',
      };
    }

    const postId = `post-${Math.random().toString(36).substring(7)}`;
    return {
      success: true,
      platformPostId: postId,
      platformPostUrl: `https://${this.name.toLowerCase()}.com/post/${postId}`,
    };
  }
}
