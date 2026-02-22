import { Injectable, Logger } from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Ctx, Message, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { CategoriesService } from 'src/categories/categories.service';
import { UsersService } from 'src/users/users.service';
import type { WizardContext } from 'telegraf/scenes';
import { CallbacksHandler } from '../handlers/callbacks.handlers';

@Wizard('add_category')
@Injectable()
export class AddCategoryScene {
  private readonly logger = new Logger(AddCategoryScene.name);
  constructor(
    private categoriesService: CategoriesService,
    private usersService: UsersService,
    private callbacksHandler: CallbacksHandler,
  ) {}

  @WizardStep(1)
  async stepName(@Ctx() ctx: WizardContext, @I18n() i18n: I18nContext) {
    try {
      await ctx.reply(i18n.t('telegram.scenes.addCategory.stepName'));
      ctx.wizard.next();
    } catch (error) {
      this.logger.error('Error processing stepName', error);
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
      if (msg.text.length > 25) {
        ctx.wizard.selectStep(1);
        return i18n.t('telegram.scenes.addCategory.largeMessageError');
      }

      const userId = ctx.from?.id.toString();

      if (!userId) {
        await ctx.reply(i18n.t('telegram.scenes.error'));
        await ctx.scene.leave();
        return;
      }

      const user = await this.usersService.getUserByTelegramId(userId);

      if (!user) {
        await ctx.reply(i18n.t('telegram.notRegistered'));
        await ctx.scene.leave();
        return;
      }

      await this.categoriesService.create(user.id, msg.text);

      await ctx.scene.leave();
      await ctx.reply(i18n.t('telegram.scenes.addCategory.stepEnd'));
      await this.callbacksHandler.onCategoryCallback(ctx, i18n);
    } catch (error) {
      this.logger.error('Error processing stepEnd', error);
      await ctx.reply(i18n.t('telegram.scenes.error'));
      await ctx.scene.leave();
    }
  }
}
