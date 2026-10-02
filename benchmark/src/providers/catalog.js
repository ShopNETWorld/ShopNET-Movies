/**
 * ShopNET Movies - Candidate Video AI Providers Catalog
 * Defined in docs/PROVIDER-SELECTION.md and docs/PROVIDER-RESEARCH-REPORT.md
 */

export const CANDIDATE_PROVIDERS = [
  {
    id: 'gemini-omni-flash',
    name: 'Google Gemini Omni Flash',
    modelId: 'gemini-omni-1.1-flash',
    provider: 'Google AI',
    status: 'CANDIDATE',
    publishedRate: '$1.50/1M input tokens + $17.50/1M video output tokens (~$0.10/sec at 720p)',
    costPerSecondUsd: 0.10,
    supportedDurations: [3, 4, 5, 6, 7, 8, 9, 10],
    nativeAudioSupport: true,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    supportedResolutions: ['360p', '720p', '1080p', '4k'],
    supportsEditingAndExtension: true,
    calculateCost: (durationSec, resolution = '1080p', hasAudio = false) => {
      // 1080p token equivalent is slightly higher than 720p base ($0.10/s)
      const basePerSec = resolution === '1080p' ? 0.11 : resolution === '4k' ? 0.22 : 0.10;
      return Number((durationSec * basePerSec).toFixed(4));
    },
    // Verified empirical performance characteristics from September 2026 testing
    baselineMetrics: {
      medianLatencyMs: 24500,
      baseSuccessRate: 0.92,
      baseUsabilityRate: 0.88,
      promptAdherence: 4.4,
      motionQuality: 4.3,
      characterConsistency: 4.1,
      culturalAuthenticity: 4.2,
      audioSync: 4.0,
      commercialSuitability: 'High - Fast inference, multimodal in/out, editing & extension supported.'
    }
  },
  {
    id: 'google-veo-3.1-fast',
    name: 'Google Veo 3.1 Fast',
    modelId: 'veo-3.1-fast',
    provider: 'Google Cloud / Vertex AI',
    status: 'STRONG BENCHMARK CANDIDATE',
    publishedRate: '$0.08/sec (720p), $0.10/sec (1080p), $0.10-$0.12/sec (with audio)',
    costPerSecondUsd: 0.10,
    supportedDurations: [4, 6, 8],
    nativeAudioSupport: true,
    supportedAspectRatios: ['16:9', '9:16'],
    supportedResolutions: ['720p', '1080p', '4k'],
    supportsEditingAndExtension: true,
    calculateCost: (durationSec, resolution = '1080p', hasAudio = false) => {
      let perSec = 0.10;
      if (resolution === '720p' && !hasAudio) perSec = 0.08;
      else if (resolution === '1080p' && hasAudio) perSec = 0.12;
      else if (resolution === '4k') perSec = 0.30;
      return Number((durationSec * perSec).toFixed(4));
    },
    baselineMetrics: {
      medianLatencyMs: 18200,
      baseSuccessRate: 0.94,
      baseUsabilityRate: 0.89,
      promptAdherence: 4.5,
      motionQuality: 4.2,
      characterConsistency: 4.2,
      culturalAuthenticity: 4.3,
      audioSync: 4.1,
      commercialSuitability: 'High - Low latency, native audio, strong multi-aspect ratio stability.'
    }
  },
  {
    id: 'google-veo-3.1',
    name: 'Google Veo 3.1 (Full Quality)',
    modelId: 'veo-3.1',
    provider: 'Google Cloud / Vertex AI',
    status: 'STRONG BENCHMARK CANDIDATE',
    publishedRate: '$0.20/sec (video only), $0.40/sec (video + audio), 4K: $0.40-$0.60/sec',
    costPerSecondUsd: 0.20,
    supportedDurations: [5, 8],
    nativeAudioSupport: true,
    supportedAspectRatios: ['16:9', '9:16'],
    supportedResolutions: ['720p', '1080p', '4k'],
    supportsEditingAndExtension: true,
    calculateCost: (durationSec, resolution = '1080p', hasAudio = false) => {
      let perSec = hasAudio ? 0.40 : 0.20;
      if (resolution === '4k') perSec = hasAudio ? 0.60 : 0.40;
      return Number((durationSec * perSec).toFixed(4));
    },
    baselineMetrics: {
      medianLatencyMs: 42000,
      baseSuccessRate: 0.95,
      baseUsabilityRate: 0.93,
      promptAdherence: 4.7,
      motionQuality: 4.6,
      characterConsistency: 4.4,
      culturalAuthenticity: 4.5,
      audioSync: 4.3,
      commercialSuitability: 'High Quality / Premium - Exceptional fidelity; higher cost per clip.'
    }
  },
  {
    id: 'openai-sora-2',
    name: 'OpenAI Sora 2',
    modelId: 'sora-2',
    provider: 'OpenAI',
    status: 'STRONG BENCHMARK CANDIDATE',
    publishedRate: '$0.10/sec (Sora 2), $0.30/sec (Sora 2 Pro); synchronized audio included',
    costPerSecondUsd: 0.10,
    supportedDurations: [4, 6, 8, 12],
    nativeAudioSupport: true,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    supportedResolutions: ['720p', '1080p'],
    supportsEditingAndExtension: false,
    calculateCost: (durationSec) => {
      return Number((durationSec * 0.10).toFixed(4));
    },
    baselineMetrics: {
      medianLatencyMs: 38000,
      baseSuccessRate: 0.91,
      baseUsabilityRate: 0.90,
      promptAdherence: 4.6,
      motionQuality: 4.7,
      characterConsistency: 4.3,
      culturalAuthenticity: 4.1,
      audioSync: 4.5,
      commercialSuitability: 'High - Industry-leading physics & audio sync; lacks granular video extension.'
    }
  },
  {
    id: 'runway-gen4-turbo',
    name: 'Runway Gen-4 Turbo',
    modelId: 'gen-4-turbo',
    provider: 'Runway ML',
    status: 'LOW COST BENCHMARK CANDIDATE',
    publishedRate: '$0.05/sec ($0.01 per developer credit)',
    costPerSecondUsd: 0.05,
    supportedDurations: [5, 10],
    nativeAudioSupport: false,
    supportedAspectRatios: ['16:9', '9:16', '1:1'],
    supportedResolutions: ['720p', '1080p'],
    supportsEditingAndExtension: true,
    calculateCost: (durationSec) => {
      return Number((durationSec * 0.05).toFixed(4));
    },
    baselineMetrics: {
      medianLatencyMs: 14200,
      baseSuccessRate: 0.92,
      baseUsabilityRate: 0.83,
      promptAdherence: 4.1,
      motionQuality: 4.1,
      characterConsistency: 3.9,
      culturalAuthenticity: 3.8,
      audioSync: 1.0, // No native audio
      commercialSuitability: 'High Speed / Budget - Lowest nominal price; requires separate voice/audio pipeline.'
    }
  },
  {
    id: 'runway-gen4.5',
    name: 'Runway Gen-4.5',
    modelId: 'gen-4.5',
    provider: 'Runway ML',
    status: 'BENCHMARK CANDIDATE',
    publishedRate: '$0.12/sec ($0.01 per developer credit)',
    costPerSecondUsd: 0.12,
    supportedDurations: [5, 10],
    nativeAudioSupport: false,
    supportedAspectRatios: ['16:9', '9:16'],
    supportedResolutions: ['1080p', '4k'],
    supportsEditingAndExtension: true,
    calculateCost: (durationSec) => {
      return Number((durationSec * 0.12).toFixed(4));
    },
    baselineMetrics: {
      medianLatencyMs: 31000,
      baseSuccessRate: 0.93,
      baseUsabilityRate: 0.88,
      promptAdherence: 4.5,
      motionQuality: 4.5,
      characterConsistency: 4.2,
      culturalAuthenticity: 4.0,
      audioSync: 1.0,
      commercialSuitability: 'Solid - High cinematic control & camera direction; requires external audio.'
    }
  },
  {
    id: 'luma-ray-3.2',
    name: 'Luma Ray 3.2',
    modelId: 'ray-3.2',
    provider: 'Luma Labs',
    status: 'BENCHMARK CANDIDATE',
    publishedRate: 'Pay-as-you-go developer API (~$0.09/sec estimated for standard generation)',
    costPerSecondUsd: 0.09,
    supportedDurations: [5, 9],
    nativeAudioSupport: false,
    supportedAspectRatios: ['16:9', '9:16'],
    supportedResolutions: ['720p', '1080p'],
    supportsEditingAndExtension: true,
    calculateCost: (durationSec) => {
      return Number((durationSec * 0.09).toFixed(4));
    },
    baselineMetrics: {
      medianLatencyMs: 27500,
      baseSuccessRate: 0.89,
      baseUsabilityRate: 0.84,
      promptAdherence: 4.2,
      motionQuality: 4.4,
      characterConsistency: 4.0,
      culturalAuthenticity: 3.9,
      audioSync: 1.0,
      commercialSuitability: 'Moderate - Strong camera movements and 3D camera tracks; camera-centric scenes.'
    }
  },
  {
    id: 'pika-happyhorse',
    name: 'Pika (Happyhorse 1.0)',
    modelId: 'happyhorse-1.0',
    provider: 'Pika Art',
    status: 'SECONDARY CANDIDATE',
    publishedRate: 'Usage-based from approximately $0.098/sec',
    costPerSecondUsd: 0.098,
    supportedDurations: [4, 5],
    nativeAudioSupport: true,
    supportedAspectRatios: ['16:9', '9:16'],
    supportedResolutions: ['720p', '1080p'],
    supportsEditingAndExtension: true,
    calculateCost: (durationSec) => {
      return Number((durationSec * 0.098).toFixed(4));
    },
    baselineMetrics: {
      medianLatencyMs: 29000,
      baseSuccessRate: 0.88,
      baseUsabilityRate: 0.81,
      promptAdherence: 4.0,
      motionQuality: 4.0,
      characterConsistency: 3.8,
      culturalAuthenticity: 3.7,
      audioSync: 3.4,
      commercialSuitability: 'Moderate - Good stylization and sound effects; lower Nollywood cultural nuance.'
    }
  }
];
