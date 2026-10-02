import { Test, TestingModule } from '@nestjs/testing';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AiGatewayService } from './ai-gateway.service';
import { PrismaService } from '../database/prisma.service';

describe('AiGatewayService', () => {
  let service: AiGatewayService;
  
  beforeEach(async () => {
    const prismaServiceMock = {
      getClient: () => ({
        generationJob: {
          create: vi.fn().mockResolvedValue({ id: 'job-123' }),
        }
      })
    };

    const mediaGenerationQueueMock = {
      add: vi.fn().mockResolvedValue({}),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiGatewayService,
        { provide: PrismaService, useValue: prismaServiceMock },
        { provide: 'BullQueue_media-generation', useValue: mediaGenerationQueueMock }
      ],
    }).compile();

    service = module.get<AiGatewayService>(AiGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
