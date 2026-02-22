import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [RedisModule, PrismaModule],
  providers: [ExpensesService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
