# ShopNET Movies — Provider Research Report
## September 2026 snapshot

## Executive finding

Do not build ShopNET around one universal "best" AI provider. Current pricing and capabilities make a capability-based routing layer more commercially sensible.

Gemini Omni Flash is currently about $0.10/sec under Google's published 720p token-equivalent calculation. Sora 2 is also $0.10/sec. Veo 3.1 Fast can be cheaper for video-only output, while Runway provides a useful multi-model aggregation layer. These are provider costs, not quality rankings. citeturn0search0turn0search3turn0search5turn0search7

## Key current findings

**Gemini Omni Flash:** `gemini-omni-1.1-flash`; text/image/video input; 3–10 sec output; 360p/720p/1080p/4K; 24 FPS; editing, extension, upscaling and interpolation. citeturn0search1

**Veo 3.1:** 8-second generation, native audio, portrait/landscape, reference images, extension and 720p/1080p/4K. Current Google Cloud pricing lists Veo 3.1 Fast at $0.08/sec for 720p video, $0.10/sec for 1080p video, and $0.10/sec for 720p video with audio. citeturn0search3turn0search4

**Sora 2:** $0.10/sec; Sora 2 Pro $0.30/sec. Supports text/image input and synchronized-audio video output. citeturn0search7

**Runway:** current developer pricing includes Gen-4 Turbo at $0.05/sec, Gen-4.5 at $0.12/sec, and Gemini Omni Flash at $0.10/sec for text-to-video/image-to-video. citeturn0search5

**Luma:** current developer API uses Ray 3.2 for video and supports pay-as-you-go plus provisioned throughput. citeturn1search4turn1search5

**Pika:** current developer API is usage-based and lists Happyhorse 1.0 from about $0.098/sec. citeturn1search6

**ElevenLabs:** current plans range from $6 Starter to $990 Business, with API/audio capabilities and shared credit pools. citeturn0search6

**Google Translation:** current NMT pricing is about $20/1M characters after the first 500k monthly credit; Translation LLM is $10/1M input and $10/1M output characters. citeturn1search0

**Payments:** Paystack documents recurring subscriptions in Nigeria; Flutterwave currently lists 1.4% transaction + 0.6% platform fee for local transactions and 4.8% for international transactions, subject to terms/VAT. citeturn1search1turn1search2

## 6-second illustrative video cost

| Provider/model | Approx provider cost |
|---|---:|
| Runway Gen-4 Turbo | $0.30 |
| Veo 3.1 Fast 720p video | $0.48 |
| Gemini Omni Flash | $0.60 |
| Sora 2 | $0.60 |
| Veo 3.1 Fast 1080p video | $0.60 |
| Runway Omni Flash | $0.60 |
| Runway Gen-4.5 | $0.72 |
| Sora 2 Pro | $1.80 |

These calculations use published rates and exclude retries, storage, processing, voice, captions, delivery and payment fees. They must not be interpreted as quality rankings. citeturn0search0turn0search3turn0search5turn0search7

## Business metric

Measure **cost per usable clip**, not cost per attempt. If a provider costs $0.30 but only 60% of outputs are usable, the illustrative usable-output cost is ~$0.50 before other costs. If another costs $0.60 but 90% are usable, the illustrative usable-output cost is ~$0.67. These are examples, not measured provider results.

## Benchmark requirements

Run identical tests for cinematic quality, character consistency, image adherence, motion, camera control, audio/dialogue, 9:16, 16:9, Nigerian environments, English/Yoruba/Pidgin workflow, latency, failure rate, retries and commercial terms.

The benchmark should produce facts and measured observations. The owner chooses the production provider.

## Reverification rule

All pricing, quotas, API access and commercial terms must be rechecked immediately before production implementation because they can change.
