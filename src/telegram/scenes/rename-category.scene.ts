import { Injectable, Logger } from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Ctx, Message, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { CategoriesService } from 'src/categories/categories.service';
import { UsersService } from 'src/users/users.service';
import type { WizardContext } from 'telegraf/scenes';
import { CallbacksHandler } from '../handlers/callbacks.handler';

@Wizard('rename_category')
@Injectable()
export class RenameCategoryScene {
  private readonly logger = new Logger(RenameCategoryScene.name);

  constructor(
    private categoriesService: CategoriesService,
    private usersService: UsersService,
    private callbacksHandler: CallbacksHandler,
  ) {}

  @WizardStep(1)
  async askName(@Ctx() ctx: WizardContext, @I18n() i18n: I18nContext) {
    try {
      ctx.wizard.next();
      return i18n.t('telegram.scenes.renameCategory.stepName');
    } catch (error) {
      await ctx.scene.leave();
      this.logger.error('Error processing askName step', error);
      await ctx.reply(i18n.t('telegram.scenes.error'));
    }
  }

  @On('text')
  @WizardStep(2)
  async stepEnd(
    @Ctx() ctx: WizardContext,
    @Message() msg: { text: string },
    @I18n() i18n: I18nContext,
  ) {
    try {
      const userId = ctx.from?.id.toString();

      if (!userId) {
        await ctx.scene.leave();
        await ctx.reply(i18n.t('telegram.scenes.error'));
        return;
      }

      const user = await this.usersService.getUserByTelegramId(userId);

      if (!user) {
        await ctx.scene.leave();
        await ctx.reply(i18n.t('telegram.scenes.error'));
        return;
      }

      await this.categoriesService.rename(
        ctx.wizard.state['categoryId'] as string,
        msg.text,
        user.id,
      );
      await ctx.scene.leave();
      await ctx.reply(i18n.t('telegram.scenes.renameCategory.stepEnd'));
      await this.callbacksHandler.onCategoryCallback(ctx, i18n);
    } catch (error) {
      await ctx.scene.leave();
      this.logger.error('Error processing stepEnd', error);
      await ctx.reply(i18n.t('telegram.scenes.error'));
    }
  }
}
