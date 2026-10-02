import { Module, Global } from '@nestjs/common';
import { SsrfProtectionService } from './ssrf-protection.service';
import { PromptInjectionService } from './prompt-injection.service';
import { WafThrottlerGuard } from './waf-throttler.guard';

@Global()
@Module({
  providers: [
    SsrfProtectionService,
    PromptInjectionService,
    WafThrottlerGuard,
  ],
  exports: [
    SsrfProtectionService,
    PromptInjectionService,
    WafThrottlerGuard,
  ],
})
export class SecurityModule {}
