import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from '@redis/client';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: RedisClientType;

  constructor(private configService: ConfigService) {
    this.client = createClient({
      url: configService.get<string>('REDIS_URL'),
    });

    this.client
      .connect()
      .then(() => {
        this.logger.log('Redis client connected');
      })
      .catch((err) => {
        this.logger.error('Failed to connect redis client', err);
        throw err;
      });
  }

  async onModuleDestroy() {
    try {
      await this.client.quit();
      this.logger.log('Redis disconnected');
    } catch (err) {
      this.logger.error('Failed to disconnect redis client', err);
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number) {
    try {
      if (ttlSeconds) {
        await this.client.set(key, JSON.stringify(value), {
          expiration: { type: 'EX', value: ttlSeconds },
        });
      } else {
        const ttl = this.configService.get<number>('REDIS_DEFAULT_TTL_SECONDS');
        if (!ttl)
          throw new Error('REDIS_DEFAULT_TTL_SECONDS is not set in config');
        await this.client.set(key, JSON.stringify(value), {
          expiration: { type: 'EX', value: ttl },
        });
      }
    } catch (err: any) {
      this.logger.error(`Failed to set key ${key} in redis`, err);
      throw err;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) as T : null;
    } catch (err: any) {
      this.logger.error(`Failed to get key ${key} from redis`, err);
      throw err;
    }
  }

  async invalidate(pattern: string) {
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) await this.client.del(keys);
    } catch (error: any) {
      this.logger.error(`Failed to invalidate pattern ${pattern} in redis`, error);
      throw error;
    }
  }
}
