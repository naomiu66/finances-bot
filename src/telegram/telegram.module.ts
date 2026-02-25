import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { TelegramUpdate } from './telegram.update';
import { UsersModule } from 'src/users/users.module';
import { CommandsHandler } from './handlers/commands.handler';
import { CallbacksHandler } from './handlers/callbacks.handler';
import { AddExpenseScene } from './scenes/add-expense.scene';
import { AddCategoryScene } from './scenes/add-category.scene';
import { CategoriesModule } from 'src/categories/categories.module';
import { ExpensesModule } from 'src/expenses/expenses.module';
import { session } from 'telegraf';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    CategoriesModule,
    ExpensesModule,
    TelegrafModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const token = configService.get<string>('BOT_TOKEN');
        if (!token) throw new Error('BOT_TOKEN is not defined in .env');
        return {
          middlewares: [
            session()
          ],
          token,
          //       launchOptions: {
          // webhook: {
          //   domain,
          //   hookPath: `/bot${token}`,
        };
      },
    }),
  ],
  providers: [
    CommandsHandler,
    CallbacksHandler,
    TelegramUpdate,
    AddExpenseScene,
    AddCategoryScene,
  ],
})
export class TelegramModule {}
