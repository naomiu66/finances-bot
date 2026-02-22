import { Injectable, Logger } from '@nestjs/common';
import { Category } from 'src/generated/prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { GetCategoriesByUserId } from './dto/get-by-userId.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  constructor(
    private readonly repository: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async getByUserId(dto: GetCategoriesByUserId): Promise<Category[]> {
    try {
      const cacheKey = `categories:userId:${dto.userId}:take:${dto.take || 'all'}:page:${dto.page || 1}`;
      const cachedCategories =
        await this.redisService.get<Category[]>(cacheKey);
      if (cachedCategories) return cachedCategories;

      const whereCondition = dto.showDefault
        ? {
            OR: [{ userId: dto.userId }, { userId: null }],
          }
        : { userId: dto.userId };

      const categories: Category[] = await this.repository.category.findMany({
        where: whereCondition,
        take: dto.take || undefined,
        skip: dto.page && dto.take ? (dto.page - 1) * dto.take : undefined,
        orderBy: { name: 'asc' },
      });

      await this.redisService.set<Category[]>(cacheKey, categories);
      return categories;
    } catch (error) {
      this.logger.error('Error fetching categories by user ID:', error);
      throw error;
    }
  }

  async create(userId: string, name: string) {
    try {
      await this.repository.category.create({
        data: {
          userId,
          name,
        },
      });

      await this.redisService.invalidate(`categories:userId:${userId}:*`);
    } catch (error) {
      this.logger.error('Error creating category:', error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await this.repository.category.delete({
        where: { id },
      });
    } catch (error) {
      this.logger.error('Error deleting category', error);
      throw error;
    }
  }
}
