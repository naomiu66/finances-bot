import { Injectable, Logger } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';
import { Context, Markup, Scenes } from 'telegraf';

@Injectable()
export class CallbacksHandler {
  private readonly logger = new Logger(CallbacksHandler.name);

  async onCategoryCallback(ctx: Context, i18n: I18nContext) {
    try {
      await ctx.editMessageText(
        i18n.t('telegram.markup.categories.message'),
        Markup.inlineKeyboard([
          [
            Markup.button.callback(
              i18n.t('telegram.markup.back'),
              'back_to_menu',
            ),
          ],
          [
            Markup.button.callback(
              i18n.t('telegram.markup.categories.showCustomCategories'),
              'show_categories',
            ),
          ],
          [
            Markup.button.callback(
              i18n.t('telegram.markup.categories.addCustomCategory'),
              'add_category',
            ),
          ],
          [
            Markup.button.callback(
              i18n.t('telegram.markup.categories.deleteCustomCategory'),
              'delete_category',
            ),
          ],
        ]),
      );
    } catch (error) {
      this.logger.error(
        `Error processing category callback: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      const errorMsg = i18n.t('telegram.markup.categories.error');
      await ctx.reply(errorMsg);
    }
  }

  async onAddCategoryCallback(ctx: Context, i18n: I18nContext) {
    try {
      const sceneCtx = ctx as unknown as Scenes.WizardContext;
      await sceneCtx.scene.enter('add_category'); // теперь работает
    } catch (error) {
      this.logger.error('Error processing add category callback', error);
      await ctx.reply(i18n.t('telegram.scenes.error'));
    }
  }
}
