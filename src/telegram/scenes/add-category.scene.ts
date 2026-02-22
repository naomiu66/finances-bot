import { Injectable, Logger } from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { CategoriesService } from 'src/categories/categories.service';
import type { WizardContext } from 'telegraf/scenes';

@Wizard('add_category')
@Injectable()
export class AddCategoryScene {
  private readonly logger = new Logger(AddCategoryScene.name);
  constructor(private categoriesService: CategoriesService) {}
  @WizardStep(1)
  async stepName(@Ctx() ctx: WizardContext, @I18n() i18n: I18nContext) {
    try {
      await ctx.reply(i18n.t('telegram.scenes.addCategory.stepName'));
      return ctx.wizard.next();
    } catch (error) {
      this.logger.error('Error processing stepName', error);
      await ctx.reply(i18n.t('telegram.scenes.error'));
    }
  }

  @WizardStep(2)
  async stepEnd(@Ctx() ctx: WizardContext, @I18n() i18n: I18nContext) {
    try {
      this.logger.log(ctx.text);
      await ctx.reply(i18n.t('telegram.scenes.addCategory.stepEnd'));
      await ctx.scene.leave();
    } catch (error) {
      this.logger.error('Error processing stepEnd', error);
      await ctx.reply(i18n.t('telegram.scenes.error'));
    }
  }
}
