import { GenerationOperation } from '@shopnet/database';

export interface ModelMetadata {
  id: string;
  provider: string;
  operations: GenerationOperation[];
  description: string;
}

export class ModelRegistry {
  private static readonly models: ModelMetadata[] = [
    {
      id: 'gemini-omni-1.1-flash',
      provider: 'google',
      operations: ['IMAGE_GENERATION', 'TEXT_TO_VIDEO', 'VOICE_GENERATION', 'TRANSLATION', 'CAPTIONS'],
      description: 'Gemini Omni Flash 1.1 model for multipurpose generation',
    },
    {
      id: 'wan-2.1',
      provider: 'alibaba',
      operations: ['TEXT_TO_VIDEO', 'IMAGE_TO_VIDEO', 'VIDEO_EXTENSION'],
      description: 'Alibaba Wan 2.1 (Qwen Video) DiT 14B & 1.3B - High-motion 5s to 30s photorealistic video generation with free tier quota',
    },
    {
      id: 'qwen-wan-2.1',
      provider: 'alibaba',
      operations: ['TEXT_TO_VIDEO', 'IMAGE_TO_VIDEO', 'VIDEO_EXTENSION'],
      description: 'Qwen Wan 2.1 Video Foundation Model - Open weights 5s-30s cinema generator',
    },
    {
      id: 'seedance-2.5',
      provider: 'bytedance',
      operations: ['TEXT_TO_VIDEO', 'IMAGE_TO_VIDEO', 'VIDEO_EXTENSION', 'VIDEO_EDITING'],
      description: 'ByteDance Seedance 2.5 - Single-pass 5s to 30s 4K video generation with native synchronized sound and character consistency',
    },
    {
      id: 'kling-1.5',
      provider: 'kling',
      operations: ['TEXT_TO_VIDEO', 'IMAGE_TO_VIDEO', 'VIDEO_EXTENSION'],
      description: 'Kuaishou Kling AI 1.5 - High-physics 5s to 30s multi-shot scene motion with 66 free daily credits',
    },
    {
      id: 'hailuo-01',
      provider: 'minimax',
      operations: ['TEXT_TO_VIDEO', 'IMAGE_TO_VIDEO'],
      description: 'MiniMax Hailuo AI Video-01 - 6s to 30s cinematic camera moves and character expressiveness with free web tier',
    },
    {
      id: 'cogvideox-5b',
      provider: 'zhipu',
      operations: ['TEXT_TO_VIDEO', 'IMAGE_TO_VIDEO', 'VIDEO_EXTENSION'],
      description: 'Zhipu AI CogVideoX-5B - Open-source 3D Diffusion Transformer video generation (5s to 30s), free on HuggingFace Spaces',
    },
    {
      id: 'pollinations-free',
      provider: 'pollinations',
      operations: ['TEXT_TO_VIDEO', 'IMAGE_TO_VIDEO'],
      description: 'Pollinations Free AI Video Agent - 100% Free, zero-API-key instant 5s to 30s video synthesis agent',
    },
    {
      id: 'mock-image',
      provider: 'mock',
      operations: ['IMAGE_GENERATION'],
      description: 'Mock image generator',
    },
    {
      id: 'mock-video',
      provider: 'mock',
      operations: ['TEXT_TO_VIDEO', 'IMAGE_TO_VIDEO', 'VIDEO_EDITING', 'VIDEO_EXTENSION'],
      description: 'Mock video generator',
    },
    {
      id: 'mock-voice',
      provider: 'mock',
      operations: ['VOICE_GENERATION'],
      description: 'Mock voice generator',
    },
    {
      id: 'mock-translation',
      provider: 'mock',
      operations: ['TRANSLATION', 'CAPTIONS'],
      description: 'Mock translation generator',
    }
  ];

  static getModel(modelId: string): ModelMetadata | undefined {
    return this.models.find(m => m.id === modelId);
  }

  static getModelsByOperation(operation: GenerationOperation): ModelMetadata[] {
    return this.models.filter(m => m.operations.includes(operation));
  }
}
