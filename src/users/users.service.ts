import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { RedisService } from 'src/redis/redis.service';
import { User } from '../generated/prisma/client';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private readonly repository: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async createUser(dto: CreateUserDto) {
    try {
      await this.repository.user.create({
        data: {
          telegramId: dto.telegramId,
        },
      });
      const cacheKey = `user:telegramId:${dto.telegramId}`;
      await this.redisService.invalidate(cacheKey);
    } catch (error: any) {
      this.logger.error(
        `Failed to create user with telegramId: ${dto.telegramId}`,
        error,
      );
      throw error;
    }
  }

  async getUserByTelegramId(telegramId: string) {
    try {
      const cacheKey = `user:telegramId:${telegramId}`;
      const cachedUser = await this.redisService.get<User>(cacheKey);
      if (cachedUser) {
        return cachedUser;
      }

      const user = await this.repository.user.findUnique({
        where: {
          telegramId,
        },
      });

      if (user) {
        await this.redisService.set<User>(cacheKey, user);
      }

      return user;
    } catch (error: any) {
        this.logger.error(`Failed to get user with telegramId: ${telegramId}`, error);
        throw error;
    }
  }
}
