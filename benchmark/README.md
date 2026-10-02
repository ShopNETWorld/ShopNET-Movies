# ShopNET Movies — AI Provider Benchmark Harness

This benchmark harness evaluates the 8 candidate video AI providers for ShopNET Movies without coupling production code to any vendor:

1. **Gemini Omni Flash** (`gemini-omni-1.1-flash`)
2. **Google Veo 3.1 Fast** (`veo-3.1-fast`)
3. **Google Veo 3.1** (`veo-3.1`)
4. **OpenAI Sora 2** (`sora-2`)
5. **Runway Gen-4 Turbo** (`gen-4-turbo`)
6. **Runway Gen-4.5** (`gen-4.5`)
7. **Luma Ray 3.2** (`ray-3.2`)
8. **Pika** (`happyhorse-1.0`)

## Standard Test Suite (A–J)

The benchmark executes 10 standardized scenarios:
- **A. Nigerian Family Drama**: Intimate dialogue, living room setting, authentic Nollywood lighting and natural skin tones.
- **B. Action / Chase Scene**: High kinetic motion, dynamic framing, fast Lagos street tracking.
- **C. Character Consistency Across Three Clips**: Multi-clip character identity, clothing, and facial stability across changing environments.
- **D. Image-to-Video**: Motion initiation and fidelity from a reference image.
- **E. Dialogue & Audio Sync**: Integrated spoken audio, lip-sync coherence, ambient background balance.
- **F. Camera Movement**: Controlled crane, dolly zoom, and orbit movements.
- **G. Lagos / Abeokuta Environment**: Authentic architectural backdrops (Balogun market, Olumo rock).
- **H. Multilingual Workflow**: English, Yoruba, and Nigerian Pidgin delivery.
- **I. 9:16 Social Output**: Mobile-first vertical video composition.
- **J. 16:9 Cinematic Output**: Anamorphic/cinematic widescreen framing.

## Metrics Captured

For every test execution:
- Provider, model, operation, input prompt/assets, output metadata, resolution, duration.
- Provider Request ID, latency (ms), status, retry count, failure reason.
- Provider-reported and estimated cost.
- Effective cost per usable clip:
  $$\text{Effective Cost} = \frac{\sum \text{Total Expenses (Generations + Retries)}}{\text{Usable Deliverables}}$$
- Success rate, usable-output rate, failure rate, and median latency.

## How to Run

### 1. Verification / Mock Benchmark Mode (Zero API Keys required)
Runs the test harness against verified September 2026 telemetry and pricing curves:
```bash
npm run benchmark:mock
```

### 2. Live API Mode
Set your candidate API keys in `benchmark/.env` and execute:
```bash
npm run benchmark:live
```

Outputs are stored in `benchmark/results/` and the consolidated report is automatically written to `docs/PROVIDER-BENCHMARK-REPORT.md`.
