import { Injectable, Logger } from '@nestjs/common';
import { AiProvider, AiJobResult } from '../../interfaces/ai-provider.interface';
import { GenerationOperation } from '@shopnet/database';
import { randomUUID } from 'crypto';

@Injectable()
export class MockProvider implements AiProvider {
  name = 'mock';
  private readonly logger = new Logger(MockProvider.name);

  supportsOperation(operation: GenerationOperation): boolean {
    return true; // Supports everything as a fallback
  }

  supportsModel(model: string): boolean {
    return model.startsWith('mock-');
  }

  async executeJob(operation: GenerationOperation, model: string, inputParams: any): Promise<AiJobResult> {
    this.logger.log(`Executing ${operation} with ${model} (MOCK)`);
    
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockOutput = {
      url: `https://mock-storage.shopnet.com/mock/${randomUUID()}.png`,
      metadata: { generatedBy: 'mock-provider' }
    };

    return {
      providerRequestId: `mock-${randomUUID()}`,
      outputs: [mockOutput],
      inputUnits: 10,
      outputUnits: 1,
      estimatedCostUsd: 0.0001,
      durationSeconds: 0.5,
    };
  }
}
