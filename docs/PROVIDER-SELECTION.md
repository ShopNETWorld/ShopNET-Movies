# ShopNET Movies — Provider Selection & Unit Economics
## September 2026 snapshot

## Decision rule
ShopNET must remain provider-agnostic. No production AI provider becomes a hard-coded dependency until API access, current pricing, commercial/data terms, quality, reliability, and unit economics have been tested and approved.

A consumer subscription is not automatically an API entitlement.

## Video shortlist

### Gemini Omni Flash
Model: `gemini-omni-1.1-flash`

Google currently documents Omni Flash as a paid Gemini API video generation/editing model. It accepts text, image and video input and produces 3–10 second video outputs at 360p/720p/1080p/4K, 24 FPS. Google documents editing, extension, upscaling and interpolation.

Current published pricing: $1.50/1M input tokens and $17.50/1M video-output tokens; Google states this is approximately $0.10/second for 720p under its published tokenization rate.

Illustrative provider cost:
- 3 sec: ~$0.30
- 5 sec: ~$0.50
- 6 sec: ~$0.60
- 8 sec: ~$0.80
- 10 sec: ~$1.00
- 60-sec equivalent: ~$6.00

These are equivalent calculations, not a claim that Omni natively generates 60-second clips.

**Status: CANDIDATE — MUST BENCHMARK**

### Google Veo 3.1 / 3.1 Fast
Google currently documents 8-second video generation, native audio, portrait/landscape, reference images, extension, and 720p/1080p/4K.

Current Google Cloud pricing includes:
- Veo 3.1 video: $0.20/sec
- Veo 3.1 video + audio: $0.40/sec
- Veo 3.1 4K video: $0.40/sec
- Veo 3.1 4K video + audio: $0.60/sec
- Veo 3.1 Fast 720p video: $0.08/sec
- Fast 1080p video: $0.10/sec
- Fast 720p video + audio: $0.10/sec
- Fast 1080p video + audio: $0.12/sec
- Fast 4K video + audio: $0.30/sec

**Status: STRONG BENCHMARK CANDIDATE**

### OpenAI Sora 2
Current OpenAI documentation lists Sora 2 at $0.10/sec and Sora 2 Pro at $0.30/sec. Sora 2 accepts text/image input and produces synchronized-audio video.

Illustrative 6-sec cost:
- Sora 2: ~$0.60
- Sora 2 Pro: ~$1.80

**Status: STRONG BENCHMARK CANDIDATE**

### Runway
Current Runway developer pricing includes:
- Gen-4 Turbo: $0.05/sec
- Gen-4.5: $0.12/sec
- Gemini Omni Flash text-to-video: $0.10/sec
- Gemini Omni Flash image-to-video: $0.10/sec + first-frame image credit
- Gemini Omni Flash video-to-video: $0.11/sec of input video + reference-image credit

Runway developer credits are $0.01/credit.

Illustrative 6-sec cost:
- Gen-4 Turbo: ~$0.30
- Gen-4.5: ~$0.72
- Omni Flash route: ~$0.60

**Status: STRONG SECONDARY ROUTING/FALLBACK CANDIDATE**

### Luma
Luma's current developer surface uses Ray 3.2 for video and supports pay-as-you-go plus provisioned throughput for production workloads.

**Status: BENCHMARK CANDIDATE**

Record exact Ray 3.2 operation pricing before approval.

### Pika
Pika's current developer API uses usage-based pricing. Its public pricing currently lists Happyhorse 1.0 from approximately $0.098/sec.

**Status: SECONDARY CANDIDATE**

## Image generation shortlist

### OpenAI GPT Image
Current OpenAI pricing examples for GPT Image 1 at 1024x1024:
- low: $0.011/image
- medium: $0.042/image
- high: $0.167/image

OpenAI also lists newer GPT Image 2.5 variants for generation/editing.

**Status: PRIMARY IMAGE BENCHMARK CANDIDATE**

### Runway image models
Current examples:
- Gen-4 Image: $0.05/image at 720p, $0.08/image at 1080p
- Gen-4 Image Turbo: $0.02/image
- Muse: $0.01/image

**Status: LOW-COST BENCHMARK CANDIDATE**

### Google image generation
Benchmark current Gemini image-generation models and record exact API model/pricing at final selection time.

## Voice

### ElevenLabs
Current plans list Starter $6/30k credits, Creator $22/121k, Pro $99/600k, Scale $299/1.8M, Business $990/6M. Credit usage depends on model; multilingual V2 is approximately 1 credit/character, while some Flash/Turbo API models have discounted rates.

Test Nigerian English, American English, Yoruba, multilingual narration, character consistency and commercial voice rights.

**Status: PRIMARY VOICE BENCHMARK CANDIDATE**

## Translation

### Google Cloud Translation
Current pricing includes NMT at about $20 per 1M characters after the first 500k monthly credit. Translation LLM is listed at $10/1M input characters and $10/1M output characters.

Benchmark English, Yoruba, Nigerian Pidgin, French and Spanish.

**Status: PRIMARY TRANSLATION BENCHMARK**

## Captions

Benchmark providers on:
- timestamps
- SRT/VTT
- Nigerian English
- Nigerian Pidgin
- Yoruba
- noisy audio
- speaker separation

Do not select captions by raw transcription price alone.

## Script / LLM

Benchmark Google Gemini, OpenAI, Anthropic and other commercially suitable LLM APIs on:
- long screenplay context
- scene structure
- character continuity
- JSON/schema reliability
- multilingual quality
- cost
- latency

Use an internal `LLMProvider` interface.

## Payments

### Paystack
Paystack currently documents recurring subscriptions. Its Nigeria subscription documentation supports Card and Direct Debit.

**Status: PRIMARY NIGERIA PAYMENT CANDIDATE**

### Flutterwave
Current Nigeria pricing lists local transactions at 1.4% transaction fee + 0.6% platform fee, subject to VAT, and international transactions at 4.8%. It supports cards, bank account, USSD, bank transfer and other methods.

**Status: PRIMARY ALTERNATIVE / SECOND GATEWAY CANDIDATE**

## 6-second illustrative video cost

| Provider/model | Approx cost |
|---|---:|
| Runway Gen-4 Turbo | $0.30 |
| Veo 3.1 Fast 720p video | $0.48 |
| Gemini Omni Flash | $0.60 |
| Sora 2 | $0.60 |
| Veo 3.1 Fast 1080p video | $0.60 |
| Runway Omni Flash | $0.60 |
| Runway Gen-4.5 | $0.72 |
| Sora 2 Pro | $1.80 |

These are provider-cost illustrations, not quality rankings. They exclude retries, storage, processing, voice, captions, delivery and payment fees.

## 60-second equivalent

| Provider/model | Approx equivalent |
|---|---:|
| Runway Gen-4 Turbo | $3.00 |
| Veo 3.1 Fast 720p video | $4.80 |
| Gemini Omni Flash | $6.00 |
| Sora 2 | $6.00 |
| Veo 3.1 Fast 1080p video | $6.00 |
| Runway Omni Flash | $6.00 |
| Runway Gen-4.5 | $7.20 |
| Sora 2 Pro | $18.00 |

This is a stitched-output equivalent, not a native one-minute generation price.

## True ShopNET cost

`true_generation_cost = provider_cost + retry_cost + processing_cost + storage + voice + translation + captions + delivery + payment_fee + infrastructure_overhead`

The key business metric is **cost per usable clip**, not cost per attempt.

## Mandatory benchmark
Use identical prompts/reference assets for:
1. Nigerian family drama
2. action/chase
3. same character across three clips
4. image-to-video
5. dialogue/audio
6. camera movement
7. Lagos/Abeokuta environment
8. English + Yoruba/Pidgin workflow
9. 9:16 social video
10. 16:9 cinematic video

Record prompt adherence, character consistency, motion, audio, artifacts, editability, latency, API reliability, cost and commercial suitability.

Do not choose a provider from price alone.

## Approval table

| Capability | Primary | Fallback | Owner Approved | Date |
|---|---|---|---|---|
| Image | TBD | TBD | NO | TBD |
| Text-to-video | TBD | TBD | NO | TBD |
| Image-to-video | TBD | TBD | NO | TBD |
| Video editing | TBD | TBD | NO | TBD |
| Script/LLM | TBD | TBD | NO | TBD |
| Voice | TBD | TBD | NO | TBD |
| Translation | TBD | TBD | NO | TBD |
| Captions | TBD | TBD | NO | TBD |
| Payments | Paystack (NGN) / Stripe (USD) | Stripe / Paystack | YES | 2026-09-22 |

## Sources
- Google Gemini API pricing: https://ai.google.dev/gemini-api/docs/pricing
- Gemini Omni Flash: https://ai.google.dev/gemini-api/docs/models/gemini-omni-flash
- Google Veo: https://ai.google.dev/gemini-api/docs/veo
- Google Cloud AI pricing: https://cloud.google.com/gemini-enterprise-agent-platform/generative-ai/pricing
- OpenAI Sora 2: https://developers.openai.com/api/docs/models/sora-2
- OpenAI GPT Image: https://developers.openai.com/api/docs/models/gpt-image-1
- Runway API pricing: https://docs.dev.runwayml.com/guides/pricing/
- Luma API pricing: https://docs.agents.lumalabs.ai/guides/pricing
- Pika API pricing: https://mcp.pika.art/pricing
- ElevenLabs pricing: https://elevenlabs.io/pricing
- Google Cloud Translation: https://cloud.google.com/products/translate/pricing
- Paystack subscriptions: https://paystack.com/docs/payments/subscriptions/
- Flutterwave Nigeria pricing: https://flutterwave.com/ng/pricing
