import { Controller, Post, Get, Body, Param, UseGuards, Inject } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiGatewayService } from './ai-gateway.service';
import { SubmitJobDto } from '@shopnet/ai-gateway';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PrismaService } from '../database/prisma.service';
import { PromptInjectionService } from '../common/security/prompt-injection.service';
import { SsrfProtectionService } from '../common/security/ssrf-protection.service';

@Throttle({ generation: { limit: 5, ttl: 60000 } })
@Controller('api/v1/generation')
@UseGuards(AuthGuard)
export class GenerationController {
  constructor(
    @Inject(AiGatewayService) private readonly aiGatewayService: AiGatewayService,
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(PromptInjectionService) private readonly promptInjectionService: PromptInjectionService,
    @Inject(SsrfProtectionService) private readonly ssrfProtectionService: SsrfProtectionService,
  ) {}

  @Post()
  async submitJob(@CurrentUser() user: any, @Body() dto: SubmitJobDto) {
    // 1. Defend against adversarial prompt injection
    const prompt = dto.inputParameters?.prompt as string | undefined;
    if (prompt && typeof prompt === 'string') {
      this.promptInjectionService.assertSafePrompt(prompt);
    }

    // 2. Validate reference/input image URLs against SSRF
    const imageUrl = dto.inputParameters?.imageUrl as string | undefined;
    if (imageUrl && typeof imageUrl === 'string') {
      await this.ssrfProtectionService.assertSafeUrl(imageUrl);
    }

    const inputAssets = dto.inputParameters?.inputAssetUrls as string[] | undefined;
    if (Array.isArray(inputAssets)) {
      for (const url of inputAssets) {
        if (typeof url === 'string') {
          await this.ssrfProtectionService.assertSafeUrl(url);
        }
      }
    }

    return this.aiGatewayService.submitJob(user.id, dto);
  }

  @Get(':id')
  async getJobStatus(@CurrentUser() user: any, @Param('id') jobId: string) {
    // Validate ownership/access implicitly by including userId, or assuming the user has access.
    // In a real system, we should verify the project access.
    const job = await this.prisma.getClient().generationJob.findFirst({
      where: {
        id: jobId,
        userId: user.id
      },
      include: {
        primaryOutputs: true
      }
    });
    
    if (!job) {
      return { status: 'NOT_FOUND' };
    }

    return job;
  }
}
