export interface PublishJobData {
  mediaAssetId: string;
  assetUrl: string;
  mimeType: string;
  title?: string;
  description?: string;
}

export interface PublishResult {
  success: boolean;
  platformPostId?: string;
  platformPostUrl?: string;
  error?: string;
}

export interface SocialProvider {
  /**
   * Platform identifier (e.g. YOUTUBE, TIKTOK, INSTAGRAM, FACEBOOK)
   */
  readonly name: string;

  /**
   * Generates the OAuth login URL for the platform
   */
  getAuthUrl(state: string): string;

  /**
   * Exchanges an authorization code for access and refresh tokens
   */
  exchangeCode(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresIn?: number;
    accountId: string;
    username?: string;
  }>;

  /**
   * Refreshes the access token if expired
   */
  refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn?: number;
  }>;

  /**
   * Publishes the media to the platform using the user's access token
   */
  publish(accessToken: string, jobData: PublishJobData): Promise<PublishResult>;
}
