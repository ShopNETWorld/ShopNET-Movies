# ShopNET Movies — Antigravity Package Manifest

## Version
September 2026 — consolidated old + provider-selection package

## Purpose
This is the complete consolidated planning and coding-agent package for ShopNET Movies. It combines the original 22-file Antigravity package with the newer provider-selection and benchmark material.

## Contents

### Core documentation
1. `README-ANTIGRAVITY-ORDER.md` — master operating order and human approval workflow.
2. `docs/PRD.md` — product requirements.
3. `docs/ARCHITECTURE.md` — system architecture and provider abstraction.
4. `docs/SECURITY.md` — security requirements, abuse controls and DDoS/WAF integration points.
5. `docs/DATABASE.md` — data model and migration rules.
6. `docs/API.md` — API contract principles.
7. `docs/AGENTS.md` — coding-agent rules.
8. `docs/DEVELOPMENT-RULES.md` — engineering rules and quality gates.
9. `docs/ANTIGRAVITY-MODEL-POLICY.md` — manual model-selection and escalation policy.
10. `docs/PHASE-GATES.md` — approval gates for Phases 0–10.

### New provider-selection material
11. `docs/PROVIDER-SELECTION.md` — candidate providers, current pricing snapshot, benchmark requirements and approval matrix.
12. `docs/PROVIDER-RESEARCH-REPORT.md` — current research findings and unit-economics guidance.

### Antigravity prompts
13. `prompts/PROMPT-00-INITIAL-ANALYSIS.md` — analysis only.
14. `prompts/PROMPT-00.5-PROVIDER-BENCHMARK.md` — controlled provider benchmark before production selection.
15. `prompts/PROMPT-01-FOUNDATION.md` — project foundation.
16. `prompts/PROMPT-02-AUTH.md` — authentication and identity.
17. `prompts/PROMPT-03-DOMAIN-DATABASE.md` — domain and database.
18. `prompts/PROMPT-04-AI-GATEWAY.md` — provider-neutral AI gateway.
19. `prompts/PROMPT-05-GENERATION.md` — media generation.
20. `prompts/PROMPT-06-SOCIAL.md` — YouTube/TikTok/Instagram/Facebook publishing and scheduling.
21. `prompts/PROMPT-07-BILLING.md` — payments, subscriptions and credits.
22. `prompts/PROMPT-08-SECURITY.md` — security, abuse prevention and resilience.
23. `prompts/PROMPT-09-QA.md` — QA and hardening.
24. `prompts/PROMPT-10-PRODUCTION-READINESS.md` — production-readiness review; no automatic deployment.

## Required execution order

1. Put this package into the ShopNET Movies repository.
2. Read the docs in the order specified by `README-ANTIGRAVITY-ORDER.md`.
3. Run Prompt 00 only; do not code.
4. Review the analysis and approve the foundation phase.
5. Run Prompt 00.5 to build/run the provider benchmark harness.
6. Review the benchmark results and explicitly approve the primary/fallback providers for each capability.
7. Run Prompts 01–10 in order, stopping at every phase gate.

## Important
Provider pricing, API access, quotas, model identifiers, commercial terms and capabilities are time-sensitive. Reverify them before production implementation. The provider documents are a decision-support snapshot, not a permanent contract.

Do not let the coding agent silently select, replace or add a production provider.
