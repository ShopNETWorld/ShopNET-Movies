# ShopNET Movies — Disaster Recovery & Backup Plan

## 1. Overview & Recovery Objectives
This document establishes the Disaster Recovery (DR) protocols, backup methodologies, and Point-In-Time Recovery (PITR) procedures for the ShopNET Movies production infrastructure.

### Service Level Objectives
- **Recovery Point Objective (RPO)**: **< 5 minutes**. Data loss in a worst-case catastrophic failure must not exceed 5 minutes of transactional ledger and creative data.
- **Recovery Time Objective (RTO)**: **< 15 minutes**. Total time to restore production database, queue state, and API functionality.

---

## 2. Backup Architecture & Cadence

```
+------------------------+
| Production PostgreSQL  |
+-----------+------------+
            |
            | Continuous WAL Archiving (< 1 min)
            +--------------------------------------------+
            | Daily Full Compressed Dump (02:00 UTC)     |
            v                                            v
+------------------------+                  +------------------------+
| Primary S3 / R2 Bucket | -- Cross-Region ->| Secondary Disaster Bucket
| (Object Lock 30 Days)  |    Replication    | (Immutable Cold Archive)|
+------------------------+                  +------------------------+
```

### 2.1 Backup Tiers
1. **Continuous Write-Ahead Log (WAL) Archiving**:
   - PostgreSQL `archive_mode = on` with `archive_command` shipping closed WAL segments (16MB) to Cloudflare R2 / S3 every 60 seconds.
   - Provides sub-5-minute point-in-time recovery for transaction roll-forward.
2. **Daily Full Snapshots**:
   - Automated via `scripts/backup-db.sh` using custom compressed format (`pg_dump -Fc -Z9`).
   - Accompanied by SHA256 cryptographic verification digests.
   - Retained locally for 7 days, remotely for 30 days.
3. **Weekly & Monthly Cold Archives**:
   - Weekly snapshots retained for 90 days.
   - Monthly compliance archives retained for 12 months in immutable Cloudflare R2 / AWS Glacier storage.

---

## 3. Step-by-Step Restoration Protocols

### 3.1 Scenario A: Fast Recovery from Daily Snapshot
Use when restoring following application error, test corruption, or hardware failure where recent transaction replay is not required:

```bash
# 1. Download snapshot and checksum from remote S3/R2
aws s3 cp s3://shopnet-media-prod/database-backups/daily/shopnet_prod_latest.dump ./backups/
aws s3 cp s3://shopnet-media-prod/database-backups/daily/shopnet_prod_latest.dump.sha256 ./backups/

# 2. Execute restoration script (automatically takes safety pre-restore snapshot)
./scripts/restore-db.sh ./backups/shopnet_prod_latest.dump

# 3. Run Prisma migration status check
pnpm --filter @shopnet/database run db:deploy

# 4. Verify API readiness probe
curl -f http://localhost:3001/health/readiness
```

### 3.2 Scenario B: Point-In-Time Recovery (PITR)
Use when an accidental drop or corruption occurred at an exact known timestamp (e.g., `2026-09-23 14:15:00 UTC`):

1. **Stop PostgreSQL service** to prevent new writes:
   ```bash
   docker compose -f docker-compose.prod.yml stop api workers
   ```
2. **Restore the base backup** taken immediately prior to the incident timestamp.
3. **Configure `recovery.signal`** in PostgreSQL data directory:
   ```ini
   restore_command = 'aws s3 cp s3://shopnet-media-prod/wal-archive/%f %p'
   recovery_target_time = '2026-09-23 14:14:59 UTC'
   recovery_target_action = 'promote'
   ```
4. **Start PostgreSQL**: The engine replays WAL logs up to the exact target second and halts before the corrupting transaction, promoting itself to read-write.
5. **Verify data integrity** and restart API and worker fleets.

---

## 4. Media Asset & Storage Disaster Recovery
All user video renders, audio tracks, script PDFs, and reference images reside in Cloudflare R2 / AWS S3:
- **Bucket Versioning**: Enabled globally. Accidental file deletion can be restored immediately by removing the delete marker.
- **Cross-Region Replication**: Objects replicated to an asynchronous secondary bucket in an alternate geographical zone.
- **Lifecycle Rules**: Intermediate AI generation artifacts older than 14 days transitioned to lower-cost infrequent access storage; finalized exports retained perpetually.

---

## 5. DR Rehearsal & Verification Schedule
- **Bi-Monthly Automated Drill**: Staging environment is automatically reseeded from the latest production snapshot to verify backup integrity, decryption keys, and restore duration.
- **Bi-Annual Simulated Region Failover**: Primary region traffic rerouted to standby cluster to validate DNS failover, Redis replica promotion, and SSL certificate continuity.
