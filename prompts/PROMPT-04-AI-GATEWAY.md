# Prompt 04 — AI Gateway and Provider Abstraction

Implement only Phase 4.

Create provider-neutral interfaces and adapters.

Required categories:
- LLM/script
- image
- text-to-video
- image-to-video
- voice
- translation
- captions

Include a Gemini Omni Flash adapter boundary using the currently approved API model identifier:
`gemini-omni-1.1-flash`

IMPORTANT:
Do not assume Omni is the final primary provider.
Do not bypass the provider abstraction.
Do not hard-code vendor-specific business logic into the frontend.

Implement:
- provider registry
- model registry
- capability metadata
- job submission interface
- provider request IDs
- cost/usage recording
- timeout handling
- retry policy
- fallback hooks

Use mocks/stubs for providers not yet approved.

Create:
`docs/PHASE-04-REPORT.md`

STOP at the phase gate.
