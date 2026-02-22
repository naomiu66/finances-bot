import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegramModule } from './telegram/telegram.module';
import { I18nModule } from 'nestjs-i18n';
import path from 'path';
import { TelegramResolver } from './telegram/telegram.resolver';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ExpensesModule } from './expenses/expenses.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TelegramModule,
    I18nModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        fallbackLanguage: configService.getOrThrow('FALLBACK_LANGUAGE'),
        loaderOptions: {
          path: path.join(__dirname, '../i18n/'),
          watch: true,
        },
      }),
      resolvers: [new TelegramResolver()],
      inject: [ConfigService],
    }),
    PrismaModule,
    UsersModule,
    CategoriesModule,
    ExpensesModule,
  ],
})
export class AppModule {}
