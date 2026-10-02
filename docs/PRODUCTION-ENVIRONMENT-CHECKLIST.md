# ShopNET Movies — Production Environment Pre-Flight Checklist

## Pre-Flight Verification Matrix
Every item on this checklist must be reviewed, validated, and signed off before deploying ShopNET Movies to production.

---

### 1. Infrastructure & Compute
- [ ] **Container Runtime**: Docker Engine 24+ or Kubernetes 1.28+ installed and hardened on production nodes.
- [ ] **Non-Root Execution**: Verified all container images (`apps/api`, `apps/web`, `apps/workers`) execute as non-root users (`nestjs`, `nextjs`, `workerjs`).
- [ ] **Resource Reservations & Limits**: CPU and memory limits configured in `docker-compose.prod.yml` or Kubernetes manifests to prevent OOM cascade.
- [ ] **Process Signal Handling**: `dumb-init` configured as PID 1 in all Dockerfiles to forward `SIGTERM` signals for graceful teardown.

---

### 2. Database (PostgreSQL 16 High-Availability)
- [ ] **Connection Pool Sizing**: `DATABASE_URL` configured with `connection_limit=50&pool_timeout=20`. Total application connections across API and workers strictly below PostgreSQL `max_connections` (200).
- [ ] **SSL Enforcement**: `sslmode=require` or `sslmode=verify-full` enforced on all database client connections.
- [ ] **Prisma Migration Status**: Verified all migrations applied via `pnpm --filter @shopnet/database run db:deploy`.
- [ ] **Automated Backups Active**: `scripts/backup-db.sh` scheduled via cron (daily at 02:00 UTC) with off-site S3/R2 replication and SHA256 checksum generation.
- [ ] **Continuous WAL Archiving**: Point-In-Time Recovery (PITR) WAL archiving configured to remote storage.

---

### 3. Caching & Queue Infrastructure (Redis 7)
- [ ] **Authentication**: Strong random password configured (`REDIS_PASSWORD`) and enforced via `--requirepass`.
- [ ] **AOF Persistence**: Append-Only File (`appendonly yes` with `appendfsync everysec`) active to prevent loss of queued BullMQ jobs on restart.
- [ ] **Memory Policy**: `maxmemory 2gb` with `maxmemory-policy noeviction` so job queues are never silently dropped under memory pressure.
- [ ] **TLS Encryption**: `REDIS_TLS=true` configured when communicating across availability zones.

---

### 4. Identity & Authentication Security (Better Auth)
- [ ] **Better Auth Secret**: Generated using cryptographically secure random generator:
  ```bash
  openssl rand -base64 48
  ```
- [ ] **Trusted Origins**: `BETTER_AUTH_TRUSTED_ORIGINS` strictly limited to `https://movies.shopnet.ai` and `https://api-movies.shopnet.ai`.
- [ ] **Cookie Security**: Cookies configured with `Secure`, `HttpOnly`, and `SameSite=Lax`.

---

### 5. Media Storage & CDN (Cloudflare R2 / AWS S3)
- [ ] **Bucket Policies**: Private bucket permissions; objects only accessible via short-lived signed URLs or authenticated Cloudflare Worker CDN domain.
- [ ] **CORS Configuration**: Allowed origins restricted to `https://movies.shopnet.ai`.
- [ ] **Bucket Versioning**: Enabled to prevent permanent data loss from accidental deletions.
- [ ] **CDN Edge Caching**: Media assets cached at edge with Cache-Control headers (`public, max-age=31536000, immutable`).

---

### 6. Payment Gateways (Live Production Setup)
- [ ] **Paystack Production**:
  - Live Secret Key (`sk_live_...`) and Public Key (`pk_live_...`) injected.
  - Live Webhook URL configured: `https://api-movies.shopnet.ai/api/v1/billing/webhooks/paystack`.
  - Secret key matches HMAC verification in `WebhooksController`.
- [ ] **Stripe Production**:
  - Live Secret Key (`sk_live_...`) injected.
  - Live Webhook URL configured: `https://api-movies.shopnet.ai/api/v1/billing/webhooks/stripe`.
  - Webhook Signing Secret (`whsec_...`) configured.
- [ ] **Idempotency Protection**: Verified database ledger prevents duplicate grants on replayed webhooks.

---

### 7. AI Gateway & Provider API Quotas
- [ ] **Google Gemini API Key**: Production project key with Vertex AI / Gemini 1.5 Pro/Flash quota approved.
- [ ] **OpenAI API Key**: Tier 4/5 account quota with spend limits configured on OpenAI dashboard.
- [ ] **RunwayML API Key**: Production enterprise plan with high concurrency limits.
- [ ] **ElevenLabs API Key**: Creator/Business plan with adequate monthly character quota.
- [ ] **Budget Alerts**: Billing spending alerts configured at 50%, 75%, and 90% of monthly allocation on all provider consoles.

---

### 8. Edge WAF, DDoS & Network Security
- [ ] **Cloudflare Proxy / CDN**: DNS routed through Cloudflare with Orange Cloud (Proxied) enabled.
- [ ] **WAF Shared Secret**: `WAF_SHARED_SECRET` configured in environment and injected into Cloudflare Transform Rule (`X-ShopNET-WAF-Secret`).
- [ ] **Rate Limiting**: NestJS `@nestjs/throttler` tiers active (10 req/min for auth, 5 req/min for generation, 30 req/min for webhooks).
- [ ] **Security Headers**: HSTS, CSP, X-Frame-Options (`DENY`), and X-Content-Type-Options (`nosniff`) verified via `curl -I https://api-movies.shopnet.ai/health`.

---

### 9. Observability & Alerting
- [ ] **Structured Logging**: `LOG_FORMAT=json` and `LOG_LEVEL=info` producing single-line JSON logs with service tags and timestamps.
- [ ] **Error Tracking**: Sentry DSN active in API and Web apps.
- [ ] **Health Probes**: Liveness (`/health/liveness`) and Readiness (`/health/readiness`) wired to container orchestration probes.
- [ ] **Alert Notifications**: PagerDuty / Slack webhook alerts configured for error rate spikes and database downtime.

---

## Sign-Off Authorization
| Reviewer Role | Name | Status | Timestamp |
| :--- | :--- | :--- | :--- |
| **Lead DevOps / SRE** | Automated Verification | Verified Ready | 2026-09-23 |
| **Security Engineer** | Phase 08 Security Audit | Verified Ready | 2026-09-23 |
| **QA Lead** | Phase 09 Test Suite (65/65) | Verified Ready | 2026-09-23 |
| **Product Owner** | *Awaiting Approval* | PENDING OWNER SIGN-OFF | — |
