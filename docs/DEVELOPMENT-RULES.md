# ShopNET Movies — Development Rules

## Engineering
- TypeScript-first where appropriate.
- Prefer explicit types.
- Keep modules cohesive.
- Avoid premature abstraction, but preserve provider boundaries.
- Use environment configuration.
- Use structured logging.
- Add tests with important business logic.
- Add integration tests for external boundaries.
- Add end-to-end tests for critical user flows.

## AI provider rules
- Provider adapters only.
- No direct provider calls from random UI components.
- Centralize usage/cost recording.
- Handle provider timeouts.
- Handle retries carefully.
- Respect provider rate limits.
- Preserve provider request IDs for diagnostics.

## Code quality
Before declaring a phase complete:
- lint
- typecheck
- unit tests
- integration tests where applicable
- build
- browser/e2e checks where applicable
- security checks where applicable

## Change control
Small, reversible changes are preferred over giant rewrites.
