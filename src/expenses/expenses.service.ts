import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense } from 'src/generated/prisma/client';
import { GetExpensesById } from './dto/get-by-id.dto';
import { GetExpenseByDateDto } from './dto/get-by-date.dto';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);
  constructor(
    private readonly repository: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async create(dto: CreateExpenseDto) {
    try {
      await this.repository.expense.create({
        data: {
          amount: dto.amount,
          date: dto.date,
          categoryId: dto.categoryId,
          userId: dto.userId,
          currency: dto.currency || 'USD',
        },
      });

      await this.redisService.invalidate(`expenses:userId:${dto.userId}:*`);
    } catch (error) {
      this.logger.error('Error creating expense', error);
      throw error;
    }
  }

  async getByUserId(dto: GetExpensesById): Promise<Expense[]> {
    try {
      const cacheKey = `expenses:userId:${dto.userId}:take:${dto.take || 'all'}, page:${dto.page || 1}`;
      const cachedExpenses = await this.redisService.get<Expense[]>(cacheKey);
      if (cachedExpenses) return cachedExpenses;

      const expenses = await this.repository.expense.findMany({
        where: { userId: dto.userId },
        take: dto.take || undefined,
        skip: dto.page && dto.take ? (dto.page - 1) * dto.take : undefined,
        orderBy: { date: 'desc' },
      });
      await this.redisService.set<Expense[]>(cacheKey, expenses);
      return expenses;
    } catch (error) {
      this.logger.error('Error fetching expenses by userId', error);
      throw error;
    }
  }

  async getByDate(dto: GetExpenseByDateDto): Promise<Expense[]> {
    try {
      const date = dto.date || new Date();
      const cacheKey = `expenses:userId:${dto.userId}:date:${date.toISOString()}:take:${dto.take || 'all'}, page:${dto.page || 1}`;
      const cachedExpenses = await this.redisService.get<Expense[]>(cacheKey);
      if (cachedExpenses) return cachedExpenses;

      const expenses = await this.repository.expense.findMany({
        where: { userId: dto.userId, date },
      });

      await this.redisService.set<Expense[]>(cacheKey, expenses);
      return expenses;
    } catch (error) {
      this.logger.error('Error fetching expenses by date and userId', error);
      throw error;
    }
  }

  async deleteAll(userId: string) {
    try {
      await this.repository.expense.deleteMany({
        where: { userId },
      });
      await this.redisService.invalidate(`expenses:userId:${userId}:*`);
    } catch (error) {
      this.logger.error('Error deleting all expenses by userId', error);
      throw error;
    }
  }

  async deleteById(id: string, userId: string) {
    try {
      await this.repository.expense.delete({
        where: { id },
      });
      await this.redisService.invalidate(`expenses:userId:${userId}:*`);
    } catch (error) {
      this.logger.error('Error deleting expense by Id', error);
      throw error;
    }
  }
}
