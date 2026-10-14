import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to MongoDB Database successfully.');
    } catch (err: any) {
      this.logger.warn(`MongoDB connection deferred (${err.message}). Server running with fallback handlers.`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

