import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public isDatabaseConnected = false;

  async onModuleInit() {
    try {
      await Promise.race([
        this.$connect().then(() => this.darshanSlot.findFirst()),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 2000)),
      ]);
      this.isDatabaseConnected = true;
      this.logger.log('Connected to MongoDB Database successfully.');
    } catch (err: any) {
      this.isDatabaseConnected = false;
      this.logger.warn(`MongoDB is not reachable (${err.message}). High-speed instant fallback mode activated.`);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

