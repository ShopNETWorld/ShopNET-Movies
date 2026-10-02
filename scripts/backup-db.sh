#!/usr/bin/env bash
# ==============================================================================
# ShopNET Movies — Production PostgreSQL Automated Backup Script
# ==============================================================================
# Usage:
#   ./scripts/backup-db.sh
#   Cron recommendation: 0 2 * * * (Daily at 02:00 UTC)
# ==============================================================================

set -euo pipefail

# Configuration
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date -u +"%Y%m%d_%H%M%SZ")
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${POSTGRES_USER:-shopnet}"
DB_NAME="${POSTGRES_DB:-shopnet_movies}"
BACKUP_FILE="${BACKUP_DIR}/shopnet_${DB_NAME}_${TIMESTAMP}.dump"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
LOG_PREFIX="[ShopNET DB Backup $(date -u +"%Y-%m-%dT%H:%M:%SZ")]"

mkdir -p "${BACKUP_DIR}"

echo "${LOG_PREFIX} Starting automated database backup for database: ${DB_NAME} at ${DB_HOST}:${DB_PORT}..."

# Export password if set
if [ -n "${POSTGRES_PASSWORD:-}" ]; then
  export PGPASSWORD="${POSTGRES_PASSWORD}"
fi

# Execute pg_dump with custom compressed archive format (-Fc)
pg_dump \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --dbname="${DB_NAME}" \
  --format=custom \
  --compress=9 \
  --verbose \
  --file="${BACKUP_FILE}"

# Generate SHA256 integrity checksum
echo "${LOG_PREFIX} Computing SHA256 checksum..."
if command -v sha256sum >/dev/null 2>&1; then
  sha256sum "${BACKUP_FILE}" > "${CHECKSUM_FILE}"
elif command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "${BACKUP_FILE}" > "${CHECKSUM_FILE}"
fi

FILESIZE=$(du -h "${BACKUP_FILE}" | cut -f1)
echo "${LOG_PREFIX} Backup completed successfully: ${BACKUP_FILE} (${FILESIZE})"

# Optional Remote Object Storage Upload (Cloudflare R2 / AWS S3)
if [ -n "${S3_BUCKET_NAME:-}" ] && command -v aws >/dev/null 2>&1; then
  echo "${LOG_PREFIX} Uploading backup to S3/R2 bucket: ${S3_BUCKET_NAME}..."
  ENDPOINT_FLAG=""
  if [ -n "${S3_ENDPOINT:-}" ]; then
    ENDPOINT_FLAG="--endpoint-url=${S3_ENDPOINT}"
  fi
  aws s3 cp "${BACKUP_FILE}" "s3://${S3_BUCKET_NAME}/database-backups/daily/" ${ENDPOINT_FLAG}
  aws s3 cp "${CHECKSUM_FILE}" "s3://${S3_BUCKET_NAME}/database-backups/daily/" ${ENDPOINT_FLAG}
  echo "${LOG_PREFIX} S3/R2 remote upload verified."
fi

# Retention Pruning (Keep last 7 daily local backups)
echo "${LOG_PREFIX} Pruning local backups older than 7 days..."
find "${BACKUP_DIR}" -name "shopnet_*.dump" -mtime +7 -exec rm -f {} \;
find "${BACKUP_DIR}" -name "shopnet_*.dump.sha256" -mtime +7 -exec rm -f {} \;

echo "${LOG_PREFIX} Backup routine completed cleanly."
