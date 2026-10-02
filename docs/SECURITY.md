# ShopNET Movies — Security Requirements

## Mandatory controls
- Secure authentication
- Strong authorization/RBAC
- Session/token protection
- Password hashing using approved modern algorithms if passwords are used
- MFA-ready architecture
- CSRF protection where applicable
- Input validation
- Output encoding
- SQL injection prevention
- SSRF protection
- File upload validation
- Malware/content scanning strategy for uploaded files
- Secure object storage
- Signed/private media URLs where required
- Secrets management
- Encryption in transit
- Encryption at rest where appropriate
- Audit logging
- Rate limiting
- Per-user and per-IP abuse controls
- Generation quotas
- Payment webhook signature verification
- Idempotency for financial operations
- OAuth token protection
- Least privilege

## AI-specific security
- Prompt injection defenses
- Model-output validation
- Tool-use allowlists
- Never expose provider secrets to clients
- Validate generated URLs/files before processing
- Prevent users from forcing arbitrary internal network requests
- Content moderation/abuse controls as legally and commercially appropriate

## DDoS/resilience
DDoS protection should be implemented primarily through appropriate hosting/CDN/WAF/network controls, with application-layer rate limiting as a second layer.

## Phase 08 Implemented Controls & Mapping
- **HTTP Security Headers**: `helmet` configured globally in `apps/api/src/main.ts` with Content-Security-Policy, HSTS (max-age 1 yr, subdomains, preload), `nosniff`, `frameguard` (DENY), and `strict-origin-when-cross-origin` referrer policy.
- **Tiered Rate Limiting**: `@nestjs/throttler` in `AppModule` with `default` (100 req/min), `auth` (10 req/min), `generation` (5 req/min), and `webhooks` (30 req/min).
- **DDoS/WAF Reverse Proxy Integration**: `WafMiddleware` safely resolves trusted client IP from Cloudflare (`cf-connecting-ip`) or `x-forwarded-for` and enforces optional `WAF_SHARED_SECRET` direct-bypass prevention.
- **Per-User & Per-IP Tracking**: `WafThrottlerGuard` dynamically tracks authenticated requests by `user_<id>` and unauthenticated requests by edge `clientIp`.
- **SSRF Defense**: `SsrfProtectionService` validates external URLs, disallowing non-HTTP schemes and strictly blocking loopback (127.0.0.1, localhost), RFC 1918 private ranges, and Cloud IMDS metadata (`169.254.169.254`).
- **Prompt Injection Defense**: `PromptInjectionService` inspects input prompts, sanitizes delimiter tokens, and rejects adversarial jailbreak / roleplay mode overrides with HTTP 400 and audit alerts.
- **Cryptographic Webhook Verification**: HMAC SHA-512 (Paystack) and signature verification (Stripe) with compound unique event deduplication (`WebhookEvent`).
- **Audit Logging**: Structured security events logged to `SecurityAuditLog` for authentication, authorization rejections, subscription lifecycle events, and prompt injection attempts.

## Agent safety
Antigravity must not:
- expose secrets
- disable security controls to make tests pass
- delete security middleware
- weaken authorization
- disable payment verification
- make production changes without approval

