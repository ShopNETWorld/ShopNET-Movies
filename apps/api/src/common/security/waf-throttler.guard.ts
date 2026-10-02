import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

/**
 * WAF-aware Throttler Guard.
 * Uses clientIp resolved by WafMiddleware (Cloudflare / X-Forwarded-For) or user ID for authenticated requests.
 */
@Injectable()
export class WafThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // If user is authenticated, rate-limit primarily per-user ID; otherwise by resolved edge IP
    if (req.user?.id) {
      return `user_${req.user.id}`;
    }
    return req.clientIp || req.ip || req.socket?.remoteAddress || '127.0.0.1';
  }
}
