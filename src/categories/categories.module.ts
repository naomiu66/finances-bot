import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { RedisModule } from 'src/redis/redis.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [RedisModule, PrismaModule],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
