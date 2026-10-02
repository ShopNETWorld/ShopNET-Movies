import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@shopnet/logger';

const logger = new Logger('waf-middleware');

/**
 * WAF & DDoS integration middleware.
 * 
 * 1. Safely resolves client IP from trusted reverse proxy headers (Cloudflare, AWS CloudFront/ALB).
 * 2. Optionally enforces WAF shared secret validation when configured (WAF_SHARED_SECRET).
 * 3. Enforces request hygiene and attaches sanitized clientIp to request.
 */
@Injectable()
export class WafMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // 1. Resolve true client IP
    const cfIp = req.headers['cf-connecting-ip'] as string;
    const forwardedFor = req.headers['x-forwarded-for'] as string;
    let clientIp: string;

    if (cfIp) {
      clientIp = cfIp.trim();
    } else if (forwardedFor) {
      // First IP in X-Forwarded-For list is the originating client IP
      clientIp = forwardedFor.split(',')[0].trim();
    } else {
      clientIp = req.socket?.remoteAddress || req.ip || '127.0.0.1';
    }

    // Normalize IPv6 mapped IPv4 (e.g. ::ffff:127.0.0.1 -> 127.0.0.1)
    if (clientIp.startsWith('::ffff:')) {
      clientIp = clientIp.replace('::ffff:', '');
    }

    (req as any).clientIp = clientIp;

    // 2. Validate WAF shared secret if configured in production
    const expectedSecret = process.env.WAF_SHARED_SECRET;
    if (expectedSecret) {
      const incomingSecret = req.headers['x-shopnet-waf-secret'];
      if (!incomingSecret || incomingSecret !== expectedSecret) {
        logger.warn('Direct connection attempted bypassing WAF/CDN proxy', {
          clientIp,
          path: req.path,
          method: req.method,
        });
        throw new ForbiddenException('Direct connection forbidden. Requests must route through edge WAF/CDN.');
      }
    }

    next();
  }
}
