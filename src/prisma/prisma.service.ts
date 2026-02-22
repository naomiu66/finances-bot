import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';
import { SqlDriverAdapterFactory } from '@prisma/client/runtime/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private readonly configService: ConfigService) {
    const connectionString = configService.get<string>('DATABASE_URL');
    if(!connectionString) {
      throw new Error('DATABASE_URL is not defined in environment variables');
    }
    super({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      adapter: new PrismaPg({
        connectionString,
      }) as SqlDriverAdapterFactory
    })
  }

  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
