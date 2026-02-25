import { Injectable, Logger } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { CategoriesService } from 'src/categories/categories.service';
import { UsersService } from 'src/users/users.service';
import { Context, Markup } from 'telegraf';
import { WizardContext } from 'telegraf/scenes';

@Injectable()
export class CallbacksHandler {
  private readonly logger = new Logger(CallbacksHandler.name);

  constructor(
    private usersService: UsersService,
    private categoriesService: CategoriesService,
  ) {}

  async onCategoryCallback(ctx: Context, i18n: I18nContext) {
    try {
      const userId = ctx.from?.id.toString();

      if (!userId) {
        await ctx.reply(i18n.t('telegram.unexpectedError'));
        return;
      }

      const user = await this.usersService.getUserByTelegramId(userId);

      if (!user) {
        await ctx.reply(i18n.t('telegram.notRegistered'));
        return;
      }

      const categories = await this.categoriesService.getByUserId({
        userId: user.id,
        take: 5,
        showDefault: true,
      });

      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback(
            i18n.t('telegram.markup.back'),
            'back_to_menu',
          ),
        ],
        [
          Markup.button.callback(
            i18n.t('telegram.markup.categories.addCustomCategory'),
            'add_category',
          ),
        ],
        ...categories.map((category) => [
          Markup.button.callback(`${category.name}`, `category_${category.id}`),
        ]),
      ]);

      if (ctx.updateType === 'callback_query') {
        await ctx.editMessageText(
          i18n.t('telegram.markup.categories.message'),
          keyboard,
        );
      } else {
        await ctx.reply(i18n.t('telegram.markup.categories.message'), keyboard);
      }
    } catch (error) {
      this.logger.error(
        `Error processing category callback: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      const errorMsg = i18n.t('telegram.markup.categories.error');
      await ctx.reply(errorMsg);
    }
  }

  async onAddCategoryCallback(ctx: WizardContext, i18n: I18nContext) {
    try {
      await ctx.deleteMessage();
      await ctx.scene.enter('add_category');
    } catch (error) {
      this.logger.error('Error processing add category callback', error);
      await ctx.reply(i18n.t('telegram.scenes.error'));
    }
  }

  async onClickCategory(
    ctx: Context & { match: RegExpExecArray },
    i18n: I18nContext,
  ) {
    try {
      const categoryId = ctx.match[1];
      const category = await this.categoriesService.getById(categoryId);

      if (!category) {
        await ctx.reply(i18n.t('telegram.markup.categories.notFound'));
        return;
      }

      const keyboard = Markup.inlineKeyboard([
        [
          Markup.button.callback(
            i18n.t('telegram.markup.categories.deleteCustomCategory'),
            `delete_category_${categoryId}`,
          ),
        ],
        [
          Markup.button.callback(
            i18n.t('telegram.markup.categories.renameCustomCategory'),
            `rename_category_${categoryId}`,
          ),
        ],
      ]);

      await ctx.editMessageText(
        i18n.t('telegram.markup.categories.actions', {
          args: { name: category.name },
        }),
        keyboard,
      );
    } catch (error) {
      this.logger.error(
        `Error processing category callback: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      const errorMsg = i18n.t('telegram.markup.categories.error');
      await ctx.reply(errorMsg);
    }
  }

  async onDeleteCategory(
    ctx: Context & { match: RegExpExecArray },
    i18n: I18nContext,
  ) {
    try {
      const categoryId = ctx.match[1];

      const userId = ctx.from?.id.toString();

      if(!userId) {
        await ctx.reply(i18n.t('telegram.scenes.error'));
        return;
      }

      const user = await this.usersService.getUserByTelegramId(userId);

      if(!user) {
        await ctx.reply(i18n.t('telegram.scenes.error'));
        return;
      }

      await this.categoriesService.delete(categoryId, user.id);

      await ctx.reply(i18n.t('telegram.deletedCategory'));

      await this.onCategoryCallback(ctx, i18n);
    } catch (error) {
      this.logger.error(
        `Error processing category callback: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      const errorMsg = i18n.t('telegram.markup.categories.error');
      await ctx.reply(errorMsg);
    }
  }

  async onRenameCategory(
    ctx: WizardContext & { match: RegExpExecArray },
    i18n: I18nContext,
  ) {
    try {
      const categoryId = ctx.match[1];
      await ctx.deleteMessage();
      await ctx.scene.enter('rename_category');
      ctx.wizard.state['categoryId'] = categoryId;
    } catch (error) {
      this.logger.error(
        `Error processing category callback: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      const errorMsg = i18n.t('telegram.markup.categories.error');
      await ctx.reply(errorMsg);
    }
  }

  async onAddExpenseCallback(ctx: WizardContext, i18n: I18nContext) {
    try {
      await ctx.deleteMessage();
      await ctx.scene.enter('add_expense');
    } catch (error) {
      this.logger.error('Error processing add category callback', error);
      await ctx.reply(i18n.t('telegram.scenes.error'));
    }
  }
}
