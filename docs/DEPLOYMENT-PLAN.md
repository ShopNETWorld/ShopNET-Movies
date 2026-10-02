# ShopNET Movies — Deployment & Zero-Downtime Rollback Plan

## 1. Release Strategy Overview
ShopNET Movies employs a **Blue-Green / Canary** deployment topology for web and API gateways, paired with a **Graceful Rolling Update** for background workers. This guarantees zero downtime, continuous user session availability, and uninterrupted video rendering pipelines.

---

## 2. Monorepo CI/CD Deployment Pipeline

```
[ Git Push to main ]
         |
         v
+-------------------------------------------------------+
| Continuous Integration (CI) Checks                   |
| 1. pnpm typecheck (All 10 packages)                   |
| 2. pnpm lint (ESLint zero warning policy)             |
| 3. pnpm test (65 unit, integration, E2E, load tests)  |
+-------------------------------------------------------+
         | PASS
         v
+-------------------------------------------------------+
| Container Artifact Build & Publish                    |
| - docker build -f apps/api/Dockerfile                 |
| - docker build -f apps/web/Dockerfile                 |
| - docker build -f apps/workers/Dockerfile             |
| Tagged with Git SHA: ghcr.io/shopnet/api:${GITHUB_SHA}|
+-------------------------------------------------------+
         |
         v
+-------------------------------------------------------+
| Staging Verification Gate                             |
| Deploy to staging cluster -> automated smoke tests    |
+-------------------------------------------------------+
         | PASS & Owner Sign-Off
         v
+-------------------------------------------------------+
| Production Deployment (Blue-Green Switch)             |
+-------------------------------------------------------+
```

---

## 3. Database Migration Strategy: Expand-and-Contract

To achieve zero downtime during database schema updates, Prisma migrations must strictly adhere to the **Expand-and-Contract Pattern**:

```
Step 1: EXPAND                       Step 2: BACKFILL               Step 3: CONTRACT
(Release N)                          (Background Worker)            (Release N+1)
+-------------------------------+    +------------------------+     +-------------------------------+
| Add new optional column       | -> | Migrate existing rows  | ->  | Switch code to new column     |
| Code writes to OLD & NEW      |    | in batches of 1,000    |     | Drop OLD column in migration  |
+-------------------------------+    +------------------------+     +-------------------------------+
```

### Critical Rules for Production Migrations:
1. **Never rename columns directly**: Add the new column, dual-write, backfill, then drop the old column.
2. **Never add non-null columns without a default value**: Always supply a `DEFAULT` or make the column optional (`?`) in Prisma schema.
3. **Run migrations before application code deployment**: New schema must always be backward-compatible with running N-1 instances.
4. **Use Prisma Deploy**:
   ```bash
   pnpm --filter @shopnet/database run db:deploy
   ```

---

## 4. Production Blue-Green Release Procedure

1. **Deploy Green Stack**:
   - Spin up new API and Web containers running release `${GITHUB_SHA}` on alternate ports (e.g., 3011, 3010).
2. **Health Probe Verification**:
   - Poll `http://green-api:3011/health/readiness` until status returns HTTP 200 `ready` and database connection is active.
   - Run automated synthetic smoke tests against the Green endpoint.
3. **Traffic Cutover**:
   - Update reverse proxy (Cloudflare / Nginx / Caddy / AWS ALB) target group from Blue to Green.
   - Existing active connections on Blue are drained over a 60-second graceful window.
4. **Worker Fleet Rolling Update**:
   - Send `SIGTERM` to Blue workers. BullMQ workers finish in-flight video generations (up to 10-minute timeout) while Green workers immediately start picking up new queue jobs.
5. **Decommission Blue Stack**:
   - Once traffic and jobs are confirmed healthy on Green for 15 minutes, Blue containers are placed on standby for 1 hour before shutdown.

---

## 5. Instant Rollback Plan & Trigger Criteria

### 5.1 Automated Rollback Triggers
A rollback is triggered immediately if any of the following occur within 15 minutes post-deployment:
- **HTTP 5xx Error Rate**: Exceeds **1.0%** of total traffic over a 3-minute window.
- **API Latency (p95)**: Exceeds **1,500ms** (baseline < 250ms).
- **Readiness Probes**: `/health/readiness` fails on more than 20% of container replicas.
- **Payment Webhook Processing Failure Rate**: Exceeds **0%** (zero-tolerance for financial transaction drops).

### 5.2 Step-by-Step Rollback Execution
When a rollback is triggered:

1. **Revert Edge Proxy Traffic**:
   ```bash
   # Switch reverse proxy routing back to Blue stack immediately (< 10 seconds)
   ./scripts/switch-traffic.sh --target=blue
   ```
2. **Rollback Worker Fleet**:
   - Restart previous worker container images to process queue jobs with previous code logic.
3. **Database Schema State**:
   - Because all migrations follow the Expand-and-Contract model, the database schema remains 100% compatible with the previous application release. No schema rollback is required.
4. **Post-Rollback Audit**:
   - Capture container logs from the failed Green stack (`docker logs shopnet-prod-api > incident_logs.txt`).
   - Create post-mortem ticket and mark release as aborted.
