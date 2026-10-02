import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException, HttpStatus } from '@nestjs/common';
import { HealthController } from '../src/health/health.controller';
import { PrismaService } from '../src/database/prisma.service';

describe('HealthController', () => {
  let healthController: HealthController;
  let mockClient: { $queryRaw: ReturnType<typeof vi.fn> };
  let mockPrisma: { getClient: ReturnType<typeof vi.fn>; connected: boolean };

  beforeEach(async () => {
    mockClient = {
      $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }])
    };
    mockPrisma = {
      getClient: vi.fn().mockReturnValue(mockClient),
      connected: true
    };

    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: PrismaService,
          useValue: mockPrisma
        }
      ]
    }).compile();

    healthController = moduleRef.get<HealthController>(HealthController);
  });

  it('should return health status ok', () => {
    const result = healthController.check();
    expect(result.status).toBe('ok');
    expect(result.service).toBe('shopnet-api');
    expect(result.version).toBe('0.1.0');
    expect(result.timestamp).toBeDefined();
    expect(result.uptimeSeconds).toBeGreaterThanOrEqual(0);
  });

  it('should return liveness status ok', () => {
    const result = healthController.liveness();
    expect(result.status).toBe('ok');
    expect(result.check).toBe('liveness');
    expect(result.timestamp).toBeDefined();
  });

  it('should return readiness status ready when database is reachable', async () => {
    const result = await healthController.readiness();
    expect(result.status).toBe('ready');
    expect(result.check).toBe('readiness');
    expect(result.database).toBe('connected');
    expect(mockClient.$queryRaw).toHaveBeenCalled();
  });

  it('should throw ServiceUnavailableException (503) when database is unreachable', async () => {
    mockClient.$queryRaw.mockRejectedValueOnce(new Error('Connection terminated'));

    await expect(healthController.readiness()).rejects.toThrow(HttpException);
    try {
      await healthController.readiness();
    } catch (err: any) {
      expect(err.getStatus()).toBe(HttpStatus.SERVICE_UNAVAILABLE);
      expect(err.getResponse()).toMatchObject({
        status: 'unready',
        check: 'readiness',
        database: 'unreachable'
      });
    }
  });
});
