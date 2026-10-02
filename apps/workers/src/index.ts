import { Logger } from '@shopnet/logger';
import { QUEUE_NAMES } from './queues/queue.constants.js';
import { GenerationWorker } from './queues/generation.worker.js';

import { socialPublishingWorker } from './queues/social-publishing.worker.js';

const logger = new Logger('workers-service');

export class WorkerManager {
  private isRunning = false;
  private generationWorker?: GenerationWorker;

  async start(): Promise<void> {
    logger.info('Starting ShopNET Worker fleet...', {
      activeQueues: Object.values(QUEUE_NAMES)
    });

    this.isRunning = true;
    this.generationWorker = new GenerationWorker();

    // Graceful shutdown traps
    const handleShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down workers gracefully...`);
      await this.stop();
      process.exit(0);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

    logger.info('Worker fleet initialized and awaiting background jobs.');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.generationWorker) {
      await this.generationWorker.close();
    }
    await socialPublishingWorker.close();
    logger.info('Worker fleet stopped.');
  }

  getStatus(): { running: boolean; queues: string[] } {
    return {
      running: this.isRunning,
      queues: Object.values(QUEUE_NAMES)
    };
  }
}

// Auto-start if executed as main
if (process.argv[1] && process.argv[1].endsWith('index.ts')) {
  const manager = new WorkerManager();
  manager.start().catch(err => {
    logger.error('Worker failed to start', {}, err);
    process.exit(1);
  });
}
