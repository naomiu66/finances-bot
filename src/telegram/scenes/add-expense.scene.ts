import { Injectable, Logger } from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Ctx, Wizard, WizardStep } from 'nestjs-telegraf';
import { CategoriesService } from 'src/categories/categories.service';
import { ExpensesService } from 'src/expenses/expenses.service';
import type { WizardContext } from 'telegraf/scenes';

@Wizard('add_expense')
@Injectable()
export class AddExpenseScene {
  private readonly logger = new Logger(AddExpenseScene.name);
  constructor(
    private categoriesService: CategoriesService,
    private expensesService: ExpensesService,
  ) {}
  @WizardStep(1)
  async stepAmount(@Ctx() ctx: WizardContext, @I18n() i18n: I18nContext) {
    try {
      await ctx.reply(i18n.t('telegram.scenes.addExpense.stepAmount'));
      return ctx.wizard.next();
    } catch (error) {
      this.logger.error('Error processing stepAmount', error);
      await ctx.reply(i18n.t('telegram.scenes.error'));
    }
  }

  @WizardStep(2)
  async stepCategory(@Ctx() ctx: WizardContext, @I18n() i18n: I18nContext) {
    try {
        const amount = ctx.text;
        this.logger.log(amount);
      await ctx.reply(i18n.t('telegram.scenes.addExpense.stepCategory'));
      return ctx.wizard.next();
    } catch (error) {
      this.logger.error('Error processing stepCategory', error);
      await ctx.reply(i18n.t('telegram.scenes.error'));
    }
  }

  @WizardStep(3)
  async stepEnd(@Ctx() ctx: WizardContext, @I18n() i18n: I18nContext) {
    try {
        this.logger.log(ctx.text);
        await ctx.reply('ended scene');
        return ctx.scene.leave();
    } catch (error) {
      this.logger.error('Error processing stepEnd', error);
      await ctx.reply(i18n.t('telegram.scenes.error'));
    }
  }
}
