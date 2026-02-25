import { Injectable, Logger } from '@nestjs/common';
import { Action, Command, Ctx, Start, Update } from 'nestjs-telegraf';
import { Context } from 'telegraf';
import { I18n, I18nContext } from 'nestjs-i18n';
import { CommandsHandler } from './handlers/commands.handler';
import { CallbacksHandler } from './handlers/callbacks.handler';
import type { WizardContext } from 'telegraf/scenes';

@Update()
@Injectable()
export class TelegramUpdate {
  private readonly logger = new Logger(TelegramUpdate.name);

  constructor(
    private commandsHandler: CommandsHandler,
    private callbacksHandler: CallbacksHandler,
  ) {}
  @Start()
  async onStart(@Ctx() ctx: Context, @I18n() i18n: I18nContext) {
    this.logger.log(`Received /start command from user ${ctx.from?.id}`);
    await this.commandsHandler.startCommand(ctx, i18n);
  }

  @Command('menu')
  async onMenu(@Ctx() ctx: Context, @I18n() i18n: I18nContext) {
    this.logger.log(`Received /menu command from user ${ctx.from?.id}`);
    await this.commandsHandler.menuCommand(ctx, i18n);
  }

  @Action('back_to_menu')
  async onBackToMenu(@Ctx() ctx: Context, @I18n() i18n: I18nContext) {
    this.logger.log(`Received back_to_menu action from user ${ctx.from?.id}`);
    await this.commandsHandler.menuCommand(ctx, i18n);
  }

  @Action('show_categories')
  async onShowCategories(@Ctx() ctx: Context, @I18n() i18n: I18nContext) {
    this.logger.log(
      `Received show_categories action from user ${ctx.from?.id}`,
    );
    await this.callbacksHandler.onCategoryCallback(ctx, i18n);
  }

  @Action('add_expense')
  async onAddExpense(@Ctx() ctx: WizardContext, @I18n() i18n: I18nContext) {
    this.logger.log(`Received add_expense action from user ${ctx.from?.id}`);
    await this.callbacksHandler.onAddExpenseCallback(ctx, i18n);
  }

  @Action('click_category')
  async onClickCategory(@Ctx() ctx: Context, @I18n() i18n: I18nContext) {
    this.logger.log(`Received click_category action from user ${ctx.from?.id}`);
    await ctx.reply(i18n.t('telegram.notImplemented'));
  }

  @Action('add_category')
  async onAddCategory(@Ctx() ctx: WizardContext, @I18n() i18n: I18nContext) {
    this.logger.log(`Received add_category action from user ${ctx.from?.id}`);
    await this.callbacksHandler.onAddCategoryCallback(ctx, i18n);
  }

  @Action('rename_category')
  async onRenameCategory(@Ctx() ctx: Context, @I18n() i18n: I18nContext) {
    this.logger.log(
      `Received rename_category action from user ${ctx.from?.id}`,
    );
    await ctx.reply(i18n.t('telegram.notImplemented'));
  }

  @Action('delete_category')
  async onDeleteCategory(@Ctx() ctx: Context, @I18n() i18n: I18nContext) {
    this.logger.log(
      `Received delete_category action from user ${ctx.from?.id}`,
    );
    await ctx.reply(i18n.t('telegram.notImplemented'));
  }

  @Action('show_stats')
  async onShowStats(@Ctx() ctx: Context, @I18n() i18n: I18nContext) {
    this.logger.log(`Received show_stats action from user ${ctx.from?.id}`);
    await ctx.reply(i18n.t('telegram.notImplemented'));
  }

  @Action('settings')
  async onSettings(@Ctx() ctx: Context, @I18n() i18n: I18nContext) {
    this.logger.log(`Received settings action from user ${ctx.from?.id}`);
    await ctx.reply(i18n.t('telegram.notImplemented'));
  }
}
