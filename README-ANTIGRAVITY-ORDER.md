# ShopNET Movies — Antigravity Development Package

> **Consolidated package:** this folder contains the original development plan plus the September 2026 provider-selection research and benchmark phase. See `PACKAGE-MANIFEST.md` for the complete inventory.

## Purpose
This package is the controlled development workflow for ShopNET Movies. It is designed for Google Antigravity and assumes the project will be developed in approved phases rather than as one giant autonomous build.

## IMPORTANT MODEL RULE
Antigravity does NOT currently auto-switch its core reasoning model based on the task. The selected reasoning model is sticky within the conversation. If the model is changed while an agent turn is running, that running turn continues with the previously selected model until completion/cancellation.

Therefore:
1. The agent must NOT pretend it can select the next reasoning model.
2. At every phase boundary, the agent must stop and recommend the appropriate model.
3. It must wait for the owner to select/change the model and explicitly authorize the next phase.
4. The owner should use the Antigravity model selector or `/model`.
5. The agent may continue within the approved phase without asking to switch models unless a material model change is required.
6. If a task is unusually difficult, the agent should stop and request a stronger model rather than silently proceeding.

## HUMAN APPROVAL GATES
The agent must stop for approval before:
- changing the architecture
- selecting or replacing a provider
- changing database schema in a breaking way
- adding a major dependency
- changing authentication/authorization
- changing payment logic
- changing social OAuth architecture
- enabling production infrastructure
- deleting/renaming large groups of files
- moving to the next major phase
- switching to a different reasoning model

## DOCUMENT ORDER
Give Antigravity these files first, in this order:

1. `docs/PRD.md`
2. `docs/ARCHITECTURE.md`
3. `docs/PROVIDER-SELECTION.md`
4. `docs/SECURITY.md`
5. `docs/DATABASE.md`
6. `docs/API.md`
7. `docs/AGENTS.md`
8. `docs/DEVELOPMENT-RULES.md`
9. `docs/ANTIGRAVITY-MODEL-POLICY.md`
10. `docs/PHASE-GATES.md`

Then give it `prompts/PROMPT-00-INITIAL-ANALYSIS.md`.

Do not start with an implementation prompt.

## PROMPT ORDER
After Prompt 00:

1. Prompt 00 — analysis only
2. Human reviews analysis
3. Run Prompt 00.5 provider benchmark
4. Review provider benchmark and approve production providers
5. Select recommended model
4. Prompt 01 — project foundation
7. Stop/review
8. Select model recommended by agent
9. Prompt 02 — authentication and users
10. Prompt 03 — database and core domain
11. Prompt 04 — AI Gateway/provider abstraction
12. Prompt 05 — media-generation pipeline
13. Prompt 06 — social publishing
14. Prompt 07 — payments/subscriptions/credits
15. Prompt 08 — security, abuse prevention and resilience
16. Prompt 09 — QA, browser testing and hardening
17. Prompt 10 — production readiness/deployment

Only proceed when the previous phase reports PASS and the owner approves the next phase.

## HOW TO USE
Copy the contents of each prompt into the Antigravity conversation. Keep one main ShopNET engineering conversation if practical so the model has continuity, but maintain the documents as the source of truth.

If Antigravity asks for a model switch:
- stop
- inspect its recommendation
- manually select the requested model
- tell it: "Model switched. Continue the approved phase."

If it does not ask but the phase boundary is reached:
- do not automatically continue
- select the recommended model from the phase report
- then issue the next prompt.
