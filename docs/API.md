# ShopNET Movies — API Contract Principles

## API domains
- Auth
- Users
- Projects
- Scripts
- Characters
- Scenes
- Media
- Generation
- Jobs
- Credits
- Billing
- Social Accounts
- Publishing
- Scheduling
- Notifications
- Admin

## Rules
- Version public APIs where appropriate.
- Validate every request.
- Return stable machine-readable errors.
- Never leak provider credentials.
- Long-running generation returns a job/resource identifier.
- Use idempotency keys for operations that can create charges or duplicate side effects.
- Webhooks must be verified and replay-safe.
- Document authentication/authorization requirements per endpoint.
