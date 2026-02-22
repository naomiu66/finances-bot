import { Injectable, Logger } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { UsersService } from 'src/users/users.service';
import { Context, Markup } from 'telegraf';

@Injectable()
export class CommandsHandler {
  constructor(private readonly usersService: UsersService) {}
  private readonly logger = new Logger(CommandsHandler.name);

  async startCommand(ctx: Context, i18n: I18nContext) {
    try {
      const reply = i18n.t('telegram.start.message', {
        args: { name: ctx.from?.first_name || '' },
      });

      await this.usersService.createUser({
        telegramId: ctx.from?.id.toString() || '',
      });

      await ctx.reply(reply);
    } catch (error: unknown) {
      this.logger.error(
        `Error processing /start command: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      const errorMsg = i18n.t('telegram.start.error');
      await ctx.reply(errorMsg);
    }
  }

  async menuCommand(ctx: Context, i18n: I18nContext) {
    try {
      const text = i18n.t('telegram.menu.message');

      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback(
            i18n.t('telegram.markup.addExpense'),
            'add_expense',
          ),
        ],
        [
          Markup.button.callback(
            i18n.t('telegram.markup.showStats'),
            'show_stats',
          ),
        ],
        [
          Markup.button.callback(
            i18n.t('telegram.markup.categories.name'),
            'show_categories',
          ),
        ],
        [
          Markup.button.callback(
            i18n.t('telegram.markup.settings'),
            'settings',
          ),
        ],
      ]);

      if (ctx.updateType === 'callback_query') {
        await ctx.editMessageText(text, keyboard);
      } else {
        await ctx.reply(text, keyboard);
      }
    } catch (error) {
      this.logger.error(
        `Error processing /menu command: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      const errorMsg = i18n.t('telegram.menu.error');
      await ctx.reply(errorMsg);
    }
  }
}
