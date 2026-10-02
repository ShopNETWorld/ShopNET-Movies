# ShopNET Movies — Initial Architectural & Requirement Analysis
**Phase 0 Deliverable | September 2026**

---

## 1. Executive Summary & Product Understanding

ShopNET Movies is an AI-powered, mobile-responsive studio and production operating system designed for filmmakers, producers, content creators, scriptwriters, and marketers. The platform specifically bridges culturally nuanced storytelling and modern digital distribution, with a deliberate initial focus on **Nigerian (Nollywood) and American film and content workflows**.

### Key Value Propositions
- **Comprehensive Creative Lifecycle**: Unifies scriptwriting, scene/character design, multi-modal generation (image, text-to-video, image-to-video, video editing/extension), voice acting, translation, and automated subtitling in a single workspace.
- **Dual-Market Specialization**: Built-in support for Nigerian English, Yoruba, Nigerian Pidgin, and American English, alongside authentic local settings (e.g., Lagos, Abeokuta) and cultural context.
- **Direct-to-Audience Distribution**: Built-in OAuth publishing and scheduling for YouTube, TikTok, Instagram, and Facebook.
- **Strict Commercial & Economic Accountability**: Real-time per-generation cost tracking, credit accounting, idempotent billing (Paystack / Flutterwave), and true-cost monitoring.
- **Provider-Agnostic Core**: Zero hard vendor lock-in. A standardized AI Gateway ensures underlying models (Gemini Omni Flash, Google Veo, OpenAI Sora, Runway, ElevenLabs, etc.) can be swapped, combined, or routed based on benchmarked cost per usable clip.

---

## 2. Major System Components

```
+-------------------------------------------------------------------------+
|                        Client & Presentation Tier                       |
|  - Web Creator Studio (Script Editor, Character/Scene Hub, Gen Studio)   |
|  - Social Publishing & Scheduling UI                                    |
|  - Billing, Credits & Subscription Portal                               |
|  - Admin Dashboard & Audit Viewer                                       |
+------------------------------------+------------------------------------+
                                     |
                                     v
+-------------------------------------------------------------------------+
|                    API Gateway & Application Backend                    |
|  - Authentication & RBAC (Session/Token security, MFA-ready)            |
|  - Workspace, Project, Script & Character Domain Management             |
|  - Media Metadata & Asset Vault (Signed URL generation, upload checks)  |
|  - Credits & Usage Ledger (Atomic deductions, audit trail)              |
|  - Social Account Manager (OAuth token encryption, post scheduler)      |
|  - Payment Engine (Paystack / Flutterwave webhooks, idempotency)        |
+------------------+----------------------------------+-------------------+
                   |                                  |
                   v                                  v
+--------------------------------------+   +------------------------------+
|       Asynchronous Job Subsystem     |   |      Provider-Neutral        |
|  - Message Broker & Queue (BullMQ)   |   |         AI Gateway           |
|  - Workers: Video, Image, Audio      |   |  - Unified Capability Specs  |
|  - Social Publishing Scheduler       |   |  - Dynamic Provider Registry |
|  - Status & Webhook Polling Watchers |<->|  - Adapter Layer (Omni, Veo, |
|  - Retry & Bounded Backoff Handler   |   |    Sora, Runway, ElevenLabs) |
+------------------+-------------------+   |  - Cost & Request Telemetry  |
                   |                       |  - Fallback Routing Circuit  |
                   v                       +------------------------------+
+--------------------------------------+
|            Data & Storage            |
|  - Relational DB (Users, Jobs, etc.) |
|  - Object Store (S3/GCS/R2) & CDN    |
+--------------------------------------+
```

### Component Details
1. **Frontend / Creator Studio**: Modern, mobile-responsive UI with rich aesthetic standards, enabling real-time generation previews, timeline editing, multi-aspect ratio preview (16:9 cinematic, 9:16 vertical), and credit tracking.
2. **API Backend**: RESTful/versioned endpoints enforcing strict input validation, rate limiting, and RBAC across tenants.
3. **AI Gateway**: Decouples application logic from vendor APIs. Exposes uniform contracts (`generateText`, `generateImage`, `generateVideo`, `generateVideoFromImage`, `editVideo`, `extendVideo`, `generateSpeech`, `translate`, `generateCaptions`).
4. **Queue & Worker Engine**: Offloads heavy, non-blocking media generation and social publishing jobs with state tracking (`queued`, `running`, `completed`, `failed`, `cancelled`, `retrying`).
5. **Persistence & Asset Store**: Relational database with immutable audit logs for credits/payments, paired with object storage using pre-signed private URLs.

---

## 3. Development Phases & Governance

The platform follows a strict sequential phased model governed by human approval gates (`docs/PHASE-GATES.md`):

| Phase | Designation | Key Objectives & Deliverables | Approval Gate |
|---|---|---|---|
| **0** | **Initial Analysis** *(Current)* | Architectural review, risk discovery, dependency mapping, model recommendation (`docs/ANTIGRAVITY-INITIAL-ANALYSIS.md`). | Owner approval |
| **0.5** | **Provider Benchmark** | Standalone benchmark harness testing video/image/audio candidate providers on authentic Nollywood & cinematic prompts; output facts report (`docs/PROVIDER-BENCHMARK-REPORT.md`). | Owner approves candidate providers |
| **1** | **Project Foundation** | Scaffolding, TypeScript configuration, linting, formatting, test runners, structured logging, environment configuration (`docs/PHASE-01-REPORT.md`). | Owner approval |
| **2** | **Identity & Auth** | User registration, authentication, RBAC, session/token management, secure account flows, audit security tests (`docs/PHASE-02-REPORT.md`). | Owner approval |
| **3** | **Domain & Database** | Relational schemas, migrations, UUID entities for projects, scripts, scenes, characters, jobs, credit accounts (`docs/PHASE-03-REPORT.md`). | Owner approval |
| **4** | **AI Gateway** | Provider abstraction interfaces, adapters, capability registry, request ID tracing, cost logging, retry/fallback mechanisms (`docs/PHASE-04-REPORT.md`). | Owner approval |
| **5** | **Media Generation** | Generation UI/API, background worker pipeline, approved vendor integration, media storage, job state management (`docs/PHASE-05-REPORT.md`). | Owner approval |
| **6** | **Social Publishing** | OAuth integration (YouTube, TikTok, IG, FB), multi-platform publishing, scheduling, retry/status engine (`docs/PHASE-06-REPORT.md`). | Owner approval |
| **7** | **Billing & Credits** | Subscriptions, payment gateways (Paystack/Flutterwave), idempotent webhooks, credit accounting ledger (`docs/PHASE-07-REPORT.md`). | Owner approval |
| **8** | **Security & Hardening** | Rate limiting, abuse prevention, generation quotas, upload sanitization, SSRF protection, prompt injection defenses (`docs/PHASE-08-SECURITY-REPORT.md`). | Owner approval |
| **9** | **Full QA & Verification** | End-to-end user flows, cross-browser verification, provider failure simulations, regression suite (`docs/PHASE-09-QA-REPORT.md`). | Owner approval |
| **10** | **Production Readiness** | Deployment runbook, monitoring/alerting, disaster recovery, secret audit, environment verification (`docs/PRODUCTION-READINESS-REPORT.md`). No auto-deploy. | Explicit authorization |

---

## 4. AI Provider-Selection Process

### The Philosophy
- **Zero Vendor Lock-In**: No model is hard-coded or declared the default without measured empirical evidence.
- **Consumer vs. API Distinction**: Subscriptions (e.g. ChatGPT Plus or Gemini Advanced) do not equal API quotas. API access, tier limits, and commercial terms must be validated.
- **True Cost per Usable Clip**: Success is measured by:
  $$\text{Effective Cost} = \frac{\sum \text{Total Expenses (Generation + Retries + Audio + Storage + Gateway Fees)}}{\text{Usable Deliverables}}$$
  A cheap model that fails frequently or produces warped human anatomy costs more than a higher-priced model with high prompt adherence and character consistency.

### Benchmark Execution Plan (Phase 0.5)
The benchmark harness evaluates candidate models using 10 standardized scenarios:
1. Nigerian family drama (subtle dialogue, indoor Nollywood lighting)
2. Action / chase scene (rapid motion, spatial consistency)
3. Three consecutive scenes preserving character identity
4. Image-to-video fidelity and motion coherence
5. Integrated dialogue and audio lip sync
6. Dynamic camera movements (panning, tracking, zooming)
7. Authentic Nigerian environments (Lagos traffic, Abeokuta rocky backdrop)
8. Multilingual workflows (English, Yoruba, Nigerian Pidgin)
9. 9:16 vertical social video formats
10. 16:9 cinematic widescreen formats

### Provider Roster
- **Video**: Gemini Omni Flash (`gemini-omni-1.1-flash`), Google Veo 3.1 & Veo 3.1 Fast, OpenAI Sora 2 & Sora 2 Pro, Runway (Gen-4 Turbo, Gen-4.5, Omni Flash proxy), Luma Ray 3.2, Pika.
- **Image**: OpenAI GPT Image 1 / 2.5, Runway Gen-4 Image / Turbo / Muse, Google Imagen/Gemini Image.
- **Voice**: ElevenLabs (testing Nigerian English, American English, Yoruba accents).
- **Translation**: Google Cloud Translation (NMT & LLM).
- **Captions**: Timestamp accuracy, SRT/VTT export, Pidgin/Yoruba transcription, background noise robustness, speaker diarization.
- **Script/LLM**: Google Gemini, OpenAI, Anthropic (long screenplay context, structured JSON scene breakdowns).

### Owner Approval Matrix
The agent creates the factual comparison in `docs/PROVIDER-BENCHMARK-REPORT.md`. The owner explicitly fills and signs the approval table in `docs/PROVIDER-SELECTION.md` before Phase 4 & 5 implementation.

---

## 5. Approved Technical Architecture & Stack Specification

The formal system architecture, monorepo layout, and technology stack for ShopNET Movies have been approved by the owner as follows:

```
ShopNET Movies
│
├── Frontend
│   └── Next.js + React + TypeScript (Tailwind + shadcn/ui)
│
├── API
│   └── NestJS + TypeScript
│
├── Workers
│   └── Node.js + TypeScript (BullMQ + Redis)
│
├── Database
│   └── PostgreSQL
│
├── ORM
│   └── Prisma 7
│
├── Queue
│   └── Redis + BullMQ
│
├── Storage
│   └── S3-compatible (MinIO / Cloudflare R2 / AWS S3)
│
├── Media
│   └── FFmpeg (local / containerized binary)
│
├── Auth
│   └── Better Auth (PostgreSQL sessions & tokens)
│
├── UI
│   └── Tailwind CSS + shadcn/ui
│
├── Monorepo Tooling
│   └── pnpm workspaces + Turborepo + Docker
│
└── AI
    └── Provider-agnostic AI Gateway (NestJS abstraction)
```

### Phase-to-Stack Mapping

| Phase | Subsystem | Approved Stack / Technology |
|---|---|---|
| **00 — Analysis** | Architecture & Planning | Architectural specifications, human approval gates |
| **00.5 — Provider Benchmark** | Benchmark Harness | Provider SDKs + standalone evaluation harness |
| **01 — Foundation** | App Scaffolding | **pnpm** + **Turborepo** monorepo (`apps/web`, `apps/api`, `apps/workers`, `packages/*`) + **Docker** |
| **02 — Authentication** | Identity & Access | **Better Auth** + **PostgreSQL** |
| **03 — Domain/Database** | Data Layer | **PostgreSQL** + **Prisma 7** |
| **04 — AI Gateway** | Provider Abstraction | **NestJS** + Provider interfaces/adapters (Omni Flash, Veo, Sora, Runway, ElevenLabs) |
| **05 — Generation** | Media Processing | AI Gateway + **BullMQ** + **Redis** + **Node.js Workers** + **S3-compatible Storage** + **FFmpeg** |
| **06 — Social** | Distribution & Publishing | **NestJS** + OAuth + platform APIs (YouTube, TikTok, IG, FB) + **BullMQ** |
| **07 — Billing** | Payments & Ledger | **Paystack / Flutterwave & Stripe** + PostgreSQL + webhooks + credits |
| **08 — Security** | Hardening & Resilience | WAF / rate limiting / validation / secrets / audit logs |
| **09 — QA** | Testing & Verification | **Vitest** (Unit/Integration) + **Playwright** (E2E & Browser) + load/failure testing |
| **10 — Production** | Operations & Deploy | Docker + CI/CD + monitoring + backups + deployment runbooks |

---

## 6. Resolved Decisions & Next Steps

1. **Monorepo Engine**: `pnpm workspaces` combined with `Turborepo` for unified builds and pipeline caching across `apps/web` (Next.js), `apps/api` (NestJS), and `apps/workers` (Node.js).
2. **UI Framework**: `Tailwind CSS` coupled with `shadcn/ui` components for rich, modern design aesthetics.
3. **ORM Selection**: `Prisma 7` with PostgreSQL.
4. **Media Processing Architecture**: Asynchronous worker fleet powered by `BullMQ` and `Redis`, running `FFmpeg` for media manipulation, targeting `S3-compatible` object storage.
5. **Auth Architecture**: `Better Auth` backed by PostgreSQL.
6. **Billing Scope**: Dual-rail architecture supporting Nigerian regional payments (**Paystack** and **Flutterwave**) alongside global payments (**Stripe**).
7. **Next Immediate Phase**: **Phase 00.5 — Provider Benchmark Harness** (Prompt 00.5).

---

## 7. Model Policy & Phase 0.5 Recommendation

Per `docs/ANTIGRAVITY-MODEL-POLICY.md`, the agent does not switch reasoning models autonomously.

- **Current Active Model**: Gemini 3.8 Flash
- **Recommended Model for Phase 00.5 Provider Benchmark**: **Gemini 3.8 Flash** (or **Gemini 3.7 Flash**)
- **Alternative Model**: **Gemini 3.1 Pro**
- **Reason**: Phase 00.5 involves creating an isolated TypeScript/Node.js benchmark harness to ping and record candidate AI provider APIs against standardized prompts. Flash has ample capability for script creation and prompt evaluation with high speed.
- **Next Step**: Prompt 00.5 (`prompts/PROMPT-00.5-PROVIDER-BENCHMARK.md`).
