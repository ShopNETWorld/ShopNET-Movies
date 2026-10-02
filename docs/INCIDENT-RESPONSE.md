# ShopNET Movies — Production Incident Response & Operational Runbooks

## 1. Incident Classification & Severity Matrix

| Severity Level | Definition | Impact on Filmmakers | Target Response | Target Resolution |
| :--- | :--- | :--- | :--- | :--- |
| **SEV-1 (Critical)** | Core service down: API offline, Database unreachable, Paystack/Stripe billing failure, data loss, security compromise. | Total disruption: Creators cannot access studio, generate video, or subscribe. | **< 15 minutes** | **< 2 hours** |
| **SEV-2 (Degraded)** | Primary AI provider offline (fallback engaged), high generation queue delays (> 10 min), elevated API latency (> 1s). | Partial disruption: Slower renders or alternate model used; core app works. | **< 1 hour** | **< 6 hours** |
| **SEV-3 (Minor)** | Isolated non-blocking UI bug, single social platform token refresh error, non-critical background task delay. | Low: Minor inconvenience; core generation and studio features operational. | **< 4 hours** | **< 24 hours** |

---

## 2. On-Call Escalation & Communication Flow

```
[ Automated Alert: Datadog / Sentry / PagerDuty ]
                       |
                       v
         [ Primary On-Call Engineer (P1) ]
         - Acknowledge within 15 minutes
         - Open Incident Slack Channel (#incidents-live)
         - Designate Incident Commander (IC)
                       |
         +-------------+-------------+
         |                           |
         v                           v
  [ Technical Remediation ]    [ Stakeholder Updates ]
  - Investigate logs/metrics   - Update status.shopnet.ai
  - Execute Runbooks (below)   - Creator notification banner
  - Rollback if appropriate   - Executive summary
```

---

## 3. Operational Runbooks

### Runbook 1: Upstream AI Video Provider Outage (Google Veo / OpenAI Sora / Runway)
**Trigger**: Alert `ai_provider_error_rate > 5%` or 503 errors from external generative models.
1. **Assess Scope**: Check status pages for Google Vertex AI, OpenAI, and RunwayML.
2. **Switch Gateway Routing**:
   - In `apps/api/src/ai-gateway`, the `AiGatewayService` supports dynamic fallback routing.
   - Update provider priority via environment variable or database config without redeploying:
     ```bash
     # Example: prioritize Runway over Sora when OpenAI API is degraded
     curl -X POST https://api-movies.shopnet.ai/api/v1/admin/ai-gateway/routing \
       -H "Authorization: Bearer ${ADMIN_TOKEN}" \
       -d '{"primaryProvider": "runway", "fallbackProvider": "veo"}'
     ```
3. **Verify Credit Integrity**:
   - Confirm that failed generation attempts trigger the automatic non-deduction / refund ledger logic (`credits.service.ts`).
4. **Publish Creator Notice**:
   - Post an active studio banner: *"Video generation provider experiencing upstream latency. Switching to backup cinematic engines."*

---

### Runbook 2: Payment Webhook & Credit Desync Triage
**Trigger**: Creator support ticket or alert indicating card charged on Paystack/Stripe without credit grant.
1. **Query Webhook Logs**:
   ```sql
   SELECT id, provider, "eventType", "providerReference", processed, "createdAt"
   FROM "PaymentTransaction"
   WHERE "providerReference" = 'REPLACE_WITH_TRANSACTION_REF';
   ```
2. **Check HMAC Signature Failures**:
   - Inspect NestJS API logs for `[PAYSTACK_WEBHOOK_ERROR]` or `[STRIPE_WEBHOOK_ERROR]`.
   - Verify that webhook secrets in environment match the live dashboard.
3. **Replay Missed Webhook**:
   - From Paystack Dashboard (`Dashboard > Settings > Webhooks`) or Stripe Dashboard (`Developers > Webhooks`), select the failed event and click **Resend Webhook**.
   - The in-transaction idempotency logic inside `BillingService.handlePaymentSuccess` prevents double-crediting if already processed.
4. **Manual Ledger Correction (If Necessary)**:
   - If webhook payload was corrupted, issue an administrative grant via `CreditsService.grantCredits`:
     ```bash
     curl -X POST https://api-movies.shopnet.ai/api/v1/admin/credits/grant \
       -H "Authorization: Bearer ${ADMIN_TOKEN}" \
       -d '{"userId": "usr_xxx", "amount": 500, "reason": "SUBSCRIPTION_GRANT_MANUAL_REPAIR", "idempotencyKey": "repair_trans_xxx"}'
     ```

---

### Runbook 3: Database Connection Pool Starvation & Saturation
**Trigger**: API health probe returns 503, log messages contain `FATAL: remaining connection slots are reserved`.
1. **Inspect Active Connections**:
   ```sql
   SELECT count(*), state, client_addr FROM pg_stat_activity GROUP BY state, client_addr;
   ```
2. **Identify Long-Running Queries / Locks**:
   ```sql
   SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
   FROM pg_stat_activity
   WHERE (now() - pg_stat_activity.query_start) > interval '30 seconds'
     AND state != 'idle';
   ```
3. **Terminate Blocking Queries**:
   ```sql
   SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid = <blocking_pid>;
   ```
4. **Scale PgBouncer / Connection Pool Limit**:
   - Adjust `connection_limit=50` parameter in `DATABASE_URL`.
   - Restart worker fleet to release idle database clients.

---

### Runbook 4: DDoS, Edge Abuse & WAF Secret Violations
**Trigger**: Spike in HTTP 403 Forbidden or 429 Too Many Requests from edge proxy.
1. **Verify Edge Proxy Connection**:
   - Check if Cloudflare or AWS CloudFront is passing the custom `X-ShopNET-WAF-Secret` header matching `WAF_SHARED_SECRET`.
2. **Identify Abuse Signature**:
   - Review Cloudflare Analytics for top requesting IP addresses, ASNs, and countries.
3. **Engage Mitigation**:
   - Enable Cloudflare "Under Attack" Mode (I'm Under Attack challenge).
   - Add rate-limiting rule at the Cloudflare edge for `/api/v1/auth/*` (limit: 5 req/min per IP).
   - Block malicious IP ranges at edge firewall before traffic touches origin API servers.

---

### Runbook 5: BullMQ Queue Backpressure & Worker Fleet Saturation
**Trigger**: Queue wait time exceeds 15 minutes or queue depth exceeds 200 items.
1. **Inspect Queue State**:
   ```bash
   # Connect to Redis
   redis-cli -a ${REDIS_PASSWORD}
   # Check queue lengths
   LLEN bull:media-generation:wait
   LLEN bull:video-transcode:wait
   ```
2. **Scale Worker Replicas Horizontally**:
   ```bash
   # Scale worker fleet from 2 to 6 containers
   docker compose -f docker-compose.prod.yml up -d --scale workers=6
   ```
3. **Drain Poison Pill Jobs**:
   - If a corrupted video input causes repetitive worker crashes, move the job to the dead-letter queue:
   - Identify failed job ID and mark status `FAILED_QUARANTINED` in database.
