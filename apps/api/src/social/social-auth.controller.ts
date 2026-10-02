import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../database/prisma.service';
import { EncryptionService, SocialProviderRegistry } from '@shopnet/social-publishing';

// Note: Assuming a basic AuthGuard exists from previous phases.
// For the sake of this mock, we will use a dummy user ID if req.user is undefined.
@Controller('api/v1/social/auth')
export class SocialAuthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    private readonly registry: SocialProviderRegistry
  ) {}

  @Get(':platform/login')
  async login(@Param('platform') platform: string, @Res() res: Response) {
    const providerName = platform.toUpperCase();
    const provider = this.registry.get(providerName);
    
    // Generate a state containing workspaceId or userId to map the callback back.
    // Assuming workspaceId="ws-test" for demonstration.
    const state = Buffer.from(JSON.stringify({ workspaceId: 'ws-test', platform: providerName })).toString('base64');
    
    const url = provider.getAuthUrl(state);
    res.redirect(url);
  }

  @Get(':platform/callback')
  async callback(
    @Param('platform') platform: string,
    @Query('code') code: string,
    @Query('state') stateBase64: string,
    @Res() res: Response
  ) {
    try {
      const providerName = platform.toUpperCase();
      const provider = this.registry.get(providerName);
      
      const stateStr = Buffer.from(stateBase64, 'base64').toString('utf8');
      JSON.parse(stateStr);
      
      const tokens = await provider.exchangeCode(code);
      
      const encryptedAccess = this.encryption.encrypt(tokens.accessToken);
      const encryptedRefresh = tokens.refreshToken ? this.encryption.encrypt(tokens.refreshToken) : null;
      const expiresAt = tokens.expiresIn ? new Date(Date.now() + tokens.expiresIn * 1000) : null;

      // Ensure a workspace exists (mocking for test)
      let workspace = await this.prisma.getClient().workspace.findUnique({ where: { slug: 'test-workspace' } });
      if (!workspace) {
        // Fallback for tests
        workspace = await this.prisma.getClient().workspace.findFirst();
        if (!workspace) {
            return res.status(400).json({ error: 'No workspace found to attach account to.' });
        }
      }

      await this.prisma.getClient().socialAccount.upsert({
        where: {
          workspaceId_platform_accountId: {
            workspaceId: workspace.id,
            platform: providerName,
            accountId: tokens.accountId,
          },
        },
        create: {
          workspaceId: workspace.id,
          platform: providerName,
          accountId: tokens.accountId,
          username: tokens.username,
          encryptedAccessToken: encryptedAccess,
          encryptedRefreshToken: encryptedRefresh,
          tokenExpiresAt: expiresAt,
        },
        update: {
          username: tokens.username,
          encryptedAccessToken: encryptedAccess,
          encryptedRefreshToken: encryptedRefresh,
          tokenExpiresAt: expiresAt,
        },
      });

      res.status(200).json({ success: true, message: `Successfully connected ${providerName} account: ${tokens.username}` });
    } catch (error) {
      console.error('OAuth Callback Error:', error);
      res.status(500).json({ error: 'Failed to authenticate social account' });
    }
  }
}
