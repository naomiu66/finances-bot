import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule, PrismaModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
