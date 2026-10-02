import { GenerationOperation } from '@shopnet/database';
import { ModelRegistry, ProviderRegistry } from '../index.js';

export interface BenchmarkTestConfig {
  id: string;
  name: string;
  operation: GenerationOperation;
  prompt: string;
  resolution: string;
  aspectRatio: string;
}

export interface BenchmarkResult {
  testId: string;
  provider: string;
  model: string;
  operation: GenerationOperation;
  status: 'SUCCESS' | 'FAILED';
  durationSeconds?: number;
  latencyMs?: number;
  providerCostUsd?: number;
  estimatedCostUsd?: number;
  failureReason?: string;
  outputAssetRef?: string;
}

export class BenchmarkHarness {
  constructor(private providerRegistry: ProviderRegistry) {}

  public async runTest(
    modelId: string,
    test: BenchmarkTestConfig,
    simulateLatency: boolean = false
  ): Promise<BenchmarkResult> {
    const modelMeta = ModelRegistry.getModel(modelId);
    if (!modelMeta) {
      return {
        testId: test.id,
        provider: 'UNKNOWN',
        model: modelId,
        operation: test.operation,
        status: 'FAILED',
        failureReason: 'Model not registered',
      };
    }

    const provider = this.providerRegistry.getProvider(modelMeta.provider);
    if (!provider) {
      return {
        testId: test.id,
        provider: modelMeta.provider,
        model: modelId,
        operation: test.operation,
        status: 'FAILED',
        failureReason: 'Provider not configured',
      };
    }

    const startTime = Date.now();
    try {
      if (simulateLatency) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
      
      const result = await provider.executeJob(test.operation, modelId, {
        prompt: test.prompt,
        resolution: test.resolution,
        aspectRatio: test.aspectRatio,
      });

      return {
        testId: test.id,
        provider: provider.name,
        model: modelId,
        operation: test.operation,
        status: 'SUCCESS',
        latencyMs: Date.now() - startTime,
        durationSeconds: result.durationSeconds,
        providerCostUsd: result.estimatedCostUsd,
        estimatedCostUsd: result.estimatedCostUsd,
        outputAssetRef: result.outputs[0]?.url,
      };
    } catch (err: any) {
      return {
        testId: test.id,
        provider: provider.name,
        model: modelId,
        operation: test.operation,
        status: 'FAILED',
        latencyMs: Date.now() - startTime,
        failureReason: err.message,
      };
    }
  }

  public async runSuite(
    modelIds: string[],
    tests: BenchmarkTestConfig[]
  ): Promise<BenchmarkResult[]> {
    const results: BenchmarkResult[] = [];
    for (const test of tests) {
      for (const modelId of modelIds) {
        const result = await this.runTest(modelId, test, true);
        results.push(result);
      }
    }
    return results;
  }
}
