import { GenerationOperation } from '@shopnet/database';

export interface AiJobResult {
  providerRequestId: string;
  outputs: any[];
  inputUnits: number;
  outputUnits: number;
  estimatedCostUsd: number;
  durationSeconds: number;
}

export interface AiProvider {
  name: string;
  supportsOperation(operation: GenerationOperation): boolean;
  supportsModel(model: string): boolean;
  executeJob(operation: GenerationOperation, model: string, inputParams: any): Promise<AiJobResult>;
}
