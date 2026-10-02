import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Logger } from '@shopnet/logger';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('database');
  private client: any;
  private isConnected = false;

  async onModuleInit() {
    try {
      const { PrismaClient } = await import('@shopnet/database');
      this.client = new PrismaClient({
        log: ['error', 'warn'],
      });
      await this.client.$connect();
      this.isConnected = true;
      this.logger.info('Connected to PostgreSQL via Prisma');
    } catch (err: any) {
      this.logger.warn('PostgreSQL connection unavailable; running in resilient mode', {
        error: err.message,
      });
    }
  }

  async onModuleDestroy() {
    if (this.client && this.isConnected) {
      await this.client.$disconnect();
    }
  }

  getClient(): any {
    return this.client;
  }

  get connected(): boolean {
    return this.isConnected;
  }
}
