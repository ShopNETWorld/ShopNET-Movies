# ShopNET Movies — Database Plan

## Core entities
- users
- organizations/workspaces if approved
- projects
- characters
- scenes
- scripts
- media_assets
- generation_jobs
- generation_outputs
- providers
- provider_models
- usage_records
- credit_accounts
- credit_transactions
- subscriptions
- payments
- payment_events
- social_accounts
- social_publish_jobs
- scheduled_posts
- notifications
- audit_logs
- admin_actions

## Rules
- Use UUIDs or another safe stable identifier strategy.
- Define ownership and tenant boundaries explicitly.
- Financial records must be append-only where appropriate.
- Payment events must be idempotent.
- Usage/credit records must be auditable.
- Do not store provider API keys in the database unless specifically designed as encrypted secrets storage.
- Media metadata must identify provider/model and generation job.

## Migration policy
- No destructive migration without explicit approval.
- Backward-compatible migration first where practical.
- Every schema change requires migration and tests.
