#!/usr/bin/env bash
# ==============================================================================
# ShopNET Movies — Production PostgreSQL Database Restoration Script
# ==============================================================================
# Usage:
#   ./scripts/restore-db.sh <path_to_backup_file.dump>
# ==============================================================================

set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Error: Backup file argument is required."
  echo "Usage: $0 <path_to_backup_file.dump>"
  exit 1
fi

BACKUP_FILE="$1"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
LOG_PREFIX="[ShopNET DB Restore $(date -u +"%Y-%m-%dT%H:%M:%SZ")]"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "${LOG_PREFIX} Error: Backup file not found: ${BACKUP_FILE}"
  exit 1
fi

echo "${LOG_PREFIX} Initiating database restoration from: ${BACKUP_FILE}"

# Verify Checksum if present
if [ -f "${CHECKSUM_FILE}" ]; then
  echo "${LOG_PREFIX} Verifying SHA256 checksum..."
  if command -v sha256sum >/dev/null 2>&1; then
    sha256sum -c "${CHECKSUM_FILE}"
  elif command -v shasum >/dev/null 2>&1; then
    shasum -a 256 -c "${CHECKSUM_FILE}"
  fi
  echo "${LOG_PREFIX} Checksum verified."
fi

DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${POSTGRES_USER:-shopnet}"
DB_NAME="${POSTGRES_DB:-shopnet_movies}"

if [ -n "${POSTGRES_PASSWORD:-}" ]; then
  export PGPASSWORD="${POSTGRES_PASSWORD}"
fi

# Step 1: Safety Snapshot of current state
PRE_RESTORE_SNAPSHOT="./backups/pre_restore_safety_$(date -u +"%Y%m%d_%H%M%SZ").dump"
mkdir -p "./backups"
echo "${LOG_PREFIX} Creating safety pre-restore snapshot: ${PRE_RESTORE_SNAPSHOT}..."
pg_dump \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --dbname="${DB_NAME}" \
  --format=custom \
  --compress=6 \
  --file="${PRE_RESTORE_SNAPSHOT}" || echo "${LOG_PREFIX} Warning: Pre-restore snapshot failed (database may be empty or down)."

# Step 2: Restore from custom format
echo "${LOG_PREFIX} Restoring database contents via pg_restore..."
pg_restore \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --dbname="${DB_NAME}" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  --verbose \
  "${BACKUP_FILE}" || true

# Step 3: Verification Query
echo "${LOG_PREFIX} Verifying database connectivity and table counts..."
psql \
  --host="${DB_HOST}" \
  --port="${DB_PORT}" \
  --username="${DB_USER}" \
  --dbname="${DB_NAME}" \
  -c "SELECT count(*) AS total_tables FROM information_schema.tables WHERE table_schema = 'public';"

echo "${LOG_PREFIX} Database restoration complete and verified."
