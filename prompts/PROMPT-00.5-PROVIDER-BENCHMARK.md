# Prompt 00.5 — Provider Benchmark Before Production Selection

This phase occurs AFTER Prompt 00 analysis and BEFORE production AI implementation.

Do NOT implement production provider integrations yet.

Read:
- docs/PROVIDER-SELECTION.md
- docs/PROVIDER-RESEARCH-REPORT.md
- docs/ARCHITECTURE.md
- docs/AGENTS.md
- docs/DEVELOPMENT-RULES.md

OBJECTIVE
Build a controlled benchmark harness that tests candidate AI providers without coupling ShopNET production code to any vendor.

VIDEO CANDIDATES
- Gemini Omni Flash
- Google Veo 3.1 Fast
- Google Veo 3.1
- OpenAI Sora 2
- Runway Gen-4 Turbo
- Runway Gen-4.5
- Luma Ray 3.2
- Pika

Do not silently add providers.

CAPTURE FOR EACH TEST
- provider
- model
- operation
- input
- output
- resolution
- duration
- provider request ID
- latency
- status
- provider-reported cost where available
- estimated cost where necessary
- retry count
- failure reason
- output asset reference

VIDEO TESTS
A. Nigerian family-drama scene
B. action/chase scene
C. same character across three clips
D. image-to-video
E. dialogue/audio
F. camera movement
G. Lagos/Abeokuta-style environment
H. English + Yoruba/Pidgin workflow
I. 9:16 social output
J. 16:9 cinematic output

CALCULATE
- cost per attempt
- success rate
- usable-output rate
- effective cost per usable clip
- median latency
- failure rate

Do NOT assign an overall winner. Produce a factual comparison and identify which providers are technically and commercially suitable for owner review.

Create:
`docs/PROVIDER-BENCHMARK-REPORT.md`

STOP.
