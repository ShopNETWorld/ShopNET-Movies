import { Controller, Get, Optional, Inject, HttpStatus, HttpException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Controller('health')
export class HealthController {
  private readonly startTime = Date.now();

  constructor(
    @Optional()
    @Inject(PrismaService)
    private readonly prisma?: PrismaService
  ) {}

  @Get()
  check(): Record<string, any> {
    return {
      status: 'ok',
      service: 'shopnet-api',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      environment: process.env.NODE_ENV || 'development',
      version: '0.1.0'
    };
  }

  @Get('liveness')
  liveness(): Record<string, any> {
    return {
      status: 'ok',
      check: 'liveness',
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString()
    };
  }

  @Get('readiness')
  async readiness(): Promise<Record<string, any>> {
    let databaseStatus = 'skipped';
    
    if (this.prisma) {
      try {
        const client = this.prisma.getClient();
        if (client) {
          if (typeof client.$queryRaw === 'function') {
            await client.$queryRaw`SELECT 1`;
          }
          databaseStatus = 'connected';
        } else if (this.prisma.connected) {
          databaseStatus = 'connected';
        }
      } catch (err: any) {
        throw new HttpException(
          {
            status: 'unready',
            check: 'readiness',
            database: 'unreachable',
            error: err.message,
            timestamp: new Date().toISOString()
          },
          HttpStatus.SERVICE_UNAVAILABLE
        );
      }
    }

    return {
      status: 'ready',
      check: 'readiness',
      database: databaseStatus,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      timestamp: new Date().toISOString()
    };
  }
}
