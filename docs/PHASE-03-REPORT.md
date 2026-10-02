# ShopNET Movies — Phase 03 Core Domain & Database Report
**Phase 03 Deliverable | September 2026**

---

## 1. Executive Summary

Phase 03 (Core Domain and Database) has been implemented and verified in accordance with `prompts/PROMPT-03-DOMAIN-DATABASE.md`, `docs/PHASE-GATES.md` (Gate 3), `docs/DATABASE.md`, and `docs/ARCHITECTURE.md`.

This phase establishes the relational data modeling, persistence architecture, Prisma 7 client generation, and NestJS domain modules for ShopNET Movies:
- **Shared Database Package (`@shopnet/database`)**: Monorepo package encapsulating the Prisma 7 schema, configuration, migrations, and generated TypeScript client, enabling both `apps/api` and `apps/workers` to share the exact same models and types.
- **Relational Domain Entities**: Full entity definitions for `User`, `Workspace`, `WorkspaceMember`, `Project`, `Script`, `Character`, `Scene`, `MediaAsset`, `GenerationJob`, `GenerationOutput`, `UsageRecord`, `CreditAccount`, `CreditTransaction`, and `SecurityAuditLog`.
- **Database Schema Validation & Client Generation**: Validated via `prisma validate` and compiled with `prisma generate` targeting Prisma Client v7.10.0.
- **PostgreSQL 16 Migration DDL**: Complete initial SQL migration script generated at `packages/database/prisma/migrations/20260922000000_init_domain_schema/migration.sql` with enums, foreign key cascades, and performance indices.
- **Domain Modules in API (`apps/api`)**: Complete NestJS domain services, DTOs, and REST controllers for `projects`, `scripts`, `characters`, `scenes`, `media`, `jobs`, and `credits`.
- **Tenant Isolation & Security**: Strict tenant isolation on project-scoped resources, ensuring creators can only read, update, or delete productions they own.
- **Append-Only Idempotent Credit Ledger**: Credit transactions enforce append-only immutability, balance validation, and unique `idempotencyKey` replay protection against duplicate billing.
- **Provider & Model Attribution**: Media assets and usage records enforce provider (`runway`, `luma`, `openai`, `elevenlabs`), model (`gen-3-alpha`, `sora`), and generation job lineage.

---

## 2. Files Changed & Added

### A. Shared Database Package (`packages/database/`)
- `packages/database/package.json`: `@shopnet/database` workspace package definition with `@prisma/client@7.10.0` and `prisma@7.10.0`.
- `packages/database/tsconfig.json`: TypeScript compiler configuration extending `@shopnet/config-typescript/base.json`.
- `packages/database/prisma.config.ts`: Prisma 7 configuration file mapping schema path and PostgreSQL connection URL.
- `packages/database/prisma/schema.prisma`: Comprehensive Prisma 7 schema defining all approved domain models, relations, enums, indexes, and constraints.
- `packages/database/prisma/migrations/20260922000000_init_domain_schema/migration.sql`: Raw PostgreSQL 16 DDL migration script.
- `packages/database/src/index.ts`: Package entry point re-exporting `@prisma/client`.

### B. NestJS Database & Domain Modules (`apps/api/src/`)
- `apps/api/src/database/prisma.service.ts`: Prisma lifecycle service with resilient connection management.
- `apps/api/src/database/database.module.ts`: Global NestJS database module.
- `apps/api/src/projects/`: DTOs, `ProjectsService`, `ProjectsController`, and `ProjectsModule`.
- `apps/api/src/scripts/`: DTOs, `ScriptsService`, `ScriptsController`, and `ScriptsModule`.
- `apps/api/src/characters/`: DTOs, `CharactersService`, `CharactersController`, and `CharactersModule`.
- `apps/api/src/scenes/`: DTOs, `ScenesService`, `ScenesController`, and `ScenesModule`.
- `apps/api/src/media/`: DTOs, `MediaService`, `MediaController`, and `MediaModule`.
- `apps/api/src/jobs/`: DTOs, `JobsService`, `JobsController`, and `JobsModule`.
- `apps/api/src/credits/`: DTOs, `CreditsService`, `CreditsController`, and `CreditsModule`.
- `apps/api/src/app.module.ts`: Registered all domain and database modules.
- `apps/api/package.json`: Added `@shopnet/database` dependency.

### C. Shared Domain Types (`packages/types/`)
- `packages/types/src/index.ts`: Expanded shared TypeScript domain contracts (`WorkspaceSummary`, `ScriptSummary`, `CharacterSummary`, `SceneSummary`, `MediaAssetSummary`, `UsageRecordSummary`, enums, and credit ledger types).

### D. Automated Security & Domain Tests (`apps/api/test/`)
- `apps/api/test/domain.spec.ts`: 10 comprehensive domain integration tests validating project creation, tenant isolation, script versioning, character bibles, scene breakdowns, media asset lineage, job state transitions, usage accounting, credit deduction, and idempotency protection.

---

## 3. Features Implemented

1. **Multi-Tenant Workspaces & Projects**:
   - Workspace ownership and membership models (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`).
   - Project containers capturing title, logline, synopsis, genre, target audience, primary language (Nollywood languages: Yoruba, Igbo, Hausa, Pidgin, English), secondary language, aspect ratio (16:9, 9:16, 1:1, 2.39:1), and status (`DRAFT`, `IN_PROGRESS`, `PRODUCED`, `ARCHIVED`).
   - Tenant boundary enforcement preventing cross-user data leakage.

2. **Script Management & Versioning**:
   - Screenplay versioning (`version` counter, Fountain content, raw text).
   - Sequential version tracking ensuring only the latest draft is marked active/current.

3. **Character Bible & Multimodal Attributes**:
   - Character attributes (name, alias, description, bio, age range, gender, ethnic background).
   - Visual prompts for consistent character rendering across AI providers.
   - Voice parameters (`voiceProvider`, `voiceVoiceId`, `voiceCharacteristics`: pitch, accent, tone).

4. **Scene Breakdown & Shot Planning**:
   - Scene number, sluglines (e.g. `EXT. LAGOS MARKET - DAY`), description, estimated duration, location, time of day (`DAY`, `NIGHT`, `DUSK`, `DAWN`).
   - Camera movement directives (`STATIC`, `PAN`, `TILT`, `TRACK`, `ZOOM`, `DRONE`, `HANDHELD`).
   - AI generation prompts, negative prompts, and structured dialogue arrays.

5. **Media Asset Registry**:
   - S3-compatible storage keys and URLs for video, image, audio, script documents, subtitles, and thumbnails.
   - Strict lineage tracking tying every media asset back to its originating provider, model, and generation job ID.

6. **Generation Jobs & Cost Accounting**:
   - Background generation job metadata capturing operation (`TEXT_TO_VIDEO`, `IMAGE_TO_VIDEO`, `VIDEO_EDITING`, `VIDEO_EXTENSION`, `IMAGE_GENERATION`, `VOICE_GENERATION`, `TRANSLATION`, `CAPTIONS`).
   - Lifecycle state transitions (`QUEUED` -> `RUNNING` -> `COMPLETED` / `FAILED` / `CANCELLED` / `RETRYING`).
   - Progress percentage tracking, error logging, and retry counters.
   - Automatic generation of granular `UsageRecord` upon job completion with provider cost in USD and user credits charged.

7. **Credit Foundation & Financial Ledger**:
   - Initial balance inquiry and account provisioning.
   - Credit grant operations (`PURCHASE`, `SUBSCRIPTION_GRANT`, `ADMIN_ADJUSTMENT`, `REFUND`).
   - Credit deduction with balance verification and rejection on insufficient credits.
   - **Idempotency protection**: Duplicate requests with matching `idempotencyKey` replay the original transaction without double-charging.
   - **Append-only ledger**: Immutable audit trail of every credit debit/credit.

---

## 4. Verification & Quality Gates

### A. Schema Validation & Migration DDL
- `prisma validate`: **PASS (The schema at prisma\schema.prisma is valid 🚀)**
- `prisma generate`: **PASS (Prisma Client v7.10.0 generated successfully)**
- Migration SQL: Generated and verified in `packages/database/prisma/migrations/20260922000000_init_domain_schema/migration.sql`.

### B. Test Execution Suite (`pnpm test`)
```
 RUN  v2.1.9 C:/Users/Mufaso/Desktop/ShopNET-Movies

 ✓ |@shopnet/logger| test/logger.test.ts (2 tests)
 ✓ |@shopnet/workers| test/worker.test.ts (1 test)
 ✓ |@shopnet/api| test/health.spec.ts (1 test)
 ✓ |@shopnet/api| test/auth.spec.ts (9 tests)
 ✓ |@shopnet/api| test/domain.spec.ts (10 tests)
   ✓ 1. Projects & Tenant Boundaries > should create a project with Nollywood cinematic metadata
   ✓ 1. Projects & Tenant Boundaries > should enforce tenant isolation (prevent User B from accessing User A project)
   ✓ 2. Scripts & Versioning > should create sequential script versions and manage current active version
   ✓ 3. Character Bible & Multimodal Attributes > should create character with ethnic background, visual prompt, and voice parameters
   ✓ 4. Scenes & Shot Breakdown > should create scene with slugline, camera movement, and time of day
   ✓ 5. Media Assets & Lineage Attribution > should register media asset and enforce provider, model, and generation lineage
   ✓ 6. Generation Jobs & Usage Cost Accounting > should track job lifecycle and automatically generate audit usage record upon completion
   ✓ 7. Credit Foundation & Append-Only Idempotent Ledger > should grant credits and maintain strictly append-only ledger
   ✓ 7. Credit Foundation & Append-Only Idempotent Ledger > should deduct credits for generation and fail on insufficient balance
   ✓ 7. Credit Foundation & Append-Only Idempotent Ledger > should guarantee idempotency on retry with same idempotencyKey (no double debit)

 Test Files  5 passed (5)
      Tests  23 passed (23)
   Status    PASS (100% passing)
```

### C. Typecheck Verification (`pnpm typecheck`)
```
 • turbo 2.11.2
 Tasks: 6 successful, 6 total
 - @shopnet/database: typecheck passed
 - @shopnet/types: typecheck passed
 - @shopnet/logger: typecheck passed
 - @shopnet/workers: typecheck passed
 - @shopnet/web: typecheck passed
 - @shopnet/api: typecheck passed
 Status: PASS (0 TypeScript compiler errors across all packages)
```

### D. Build Verification (`pnpm build`)
```
 Tasks: 6 successful, 6 total
 - @shopnet/types: build succeeded
 - @shopnet/database: build succeeded
 - @shopnet/logger: build succeeded
 - @shopnet/workers: build succeeded
 - @shopnet/web: Next.js production build succeeded
 - @shopnet/api: NestJS production build succeeded
 Status: PASS
```

---

## 5. Unresolved Issues & Known Limitations

- **No Unresolved Regressions**: All 23 tests pass; clean compilation across monorepo.
- **Payment & Social Decoupling**: In strict accordance with `prompts/PROMPT-03-DOMAIN-DATABASE.md`, third-party payment gateway settlement (Paystack, Stripe) and social platform OAuth publishing are excluded from this phase and reserved for Phase 06 (Social) and Phase 07 (Billing).

---

## 6. Dependencies Added

| Package | Workspace | Version | Purpose |
| :--- | :--- | :--- | :--- |
| `prisma` | `@shopnet/database` | `^7.10.0` | ORM CLI & migration engine |
| `@prisma/client` | `@shopnet/database` | `^7.10.0` | Type-safe query builder client |
| `@shopnet/database` | `apps/api` | `workspace:*` | Shared database access |

---

## 7. Database Changes

- Created `@shopnet/database` with `schema.prisma` and `prisma.config.ts`.
- Generated initial PostgreSQL 16 migration: `20260922000000_init_domain_schema`.
- Tables created: `users`, `workspaces`, `workspace_members`, `projects`, `scripts`, `characters`, `scenes`, `media_assets`, `generation_jobs`, `generation_outputs`, `usage_records`, `credit_accounts`, `credit_transactions`, `security_audit_logs`.
- All tables use CUID primary keys, explicit tenant foreign key constraints, and performance indexes.

---

## 8. Security Review & Posture

1. **Tenant Isolation**: Direct object reference (IDOR) attacks are prevented by verifying resource ownership against the authenticated caller's identity before returning or modifying project entities.
2. **Financial Integrity**: Credits cannot be decremented below zero. Transactions require a unique `idempotencyKey` to prevent double-billing on network retries.
3. **Lineage Auditing**: Generated assets cannot be created without provider, model, and generation job tracking.
4. **Secret Protection**: Provider API keys are never stored in the database.

---

## 9. Gate 3 Assessment & Owner Sign-Off

- **Gate 03 Status**: **PASS — Ready for Approval**
- **Recommended Model for Phase 04 (AI Gateway)**:
  - **Recommended**: **Gemini 3.8 Flash** (or **Gemini 3.1 Pro** for multi-provider fallback orchestration)
  - **Rationale**: Phase 04 requires building the provider-agnostic AI Gateway abstraction interfaces, provider adapters (text, image, video, voice), cost/usage tracking integration, retries, and fallback mechanisms.
- **Action Required**: Owner approval to pass Gate 3 and proceed to **Phase 04 — AI Gateway** (`prompts/PROMPT-04-AI-GATEWAY.md`).
