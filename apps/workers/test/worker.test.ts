import { describe, it, expect, vi } from 'vitest';
import { WorkerManager } from '../src/index.js';
import { QUEUE_NAMES } from '../src/queues/queue.constants.js';

vi.mock('@shopnet/database', () => {
  return {
    PrismaClient: class {
      $disconnect = vi.fn();
    }
  };
});


describe('WorkerManager Foundation', () => {
  it('should initialize with registered queues and correct status', async () => {
    const manager = new WorkerManager();
    const status = manager.getStatus();

    expect(status.running).toBe(false);
    expect(status.queues).toContain(QUEUE_NAMES.MEDIA_GENERATION);
    expect(status.queues).toContain(QUEUE_NAMES.VIDEO_TRANSCODE);
    expect(status.queues).toContain(QUEUE_NAMES.SOCIAL_PUBLISH);

    await manager.start();
    expect(manager.getStatus().running).toBe(true);

    await manager.stop();
    expect(manager.getStatus().running).toBe(false);
  });
});
