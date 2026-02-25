import { Injectable, Logger } from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';
import { Action, Ctx, Message, On, Wizard, WizardStep } from 'nestjs-telegraf';
import { CategoriesService } from 'src/categories/categories.service';
import { ExpensesService } from 'src/expenses/expenses.service';
import { UsersService } from 'src/users/users.service';
import { Markup } from 'telegraf';
import type { WizardContext } from 'telegraf/scenes';
import { CommandsHandler } from '../handlers/commands.handler';

@Wizard('add_expense')
@Injectable()
export class AddExpenseScene {
  private readonly logger = new Logger(AddExpenseScene.name);
  constructor(
    private categoriesService: CategoriesService,
    private expensesService: ExpensesService,
    private usersService: UsersService,
    private commandsHandler: CommandsHandler
  ) {}
  @WizardStep(1)
  async stepAmount(@Ctx() ctx: WizardContext, @I18n() i18n: I18nContext) {
    try {
      ctx.wizard.next();
      return i18n.t('telegram.scenes.addExpense.stepAmount');
    } catch (error) {
      await ctx.scene.leave();
      this.logger.error('Error processing stepAmount', error);
      await ctx.reply(i18n.t('telegram.scenes.error'));
    }
  }

  @On('text')
  @WizardStep(2)
  async stepCategory(
    @Ctx() ctx: WizardContext,
    @Message() msg: { text: string },
    @I18n() i18n: I18nContext,
  ) {
    try {
      const amount = Number(msg.text);

      if (Number.isNaN(amount)) {
        ctx.wizard.selectStep(1);
        return i18n.t('telegram.scenes.addExpense.nanError');
      }

      if (amount < 0) {
        ctx.wizard.selectStep(1);
        return i18n.t('telegram.scenes.addExpense.negNumError');
      }

      ctx.wizard.state['amount'] = amount;

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

      ctx.wizard.state['userId'] = user.id;

      const categories = await this.categoriesService.getByUserId({
        userId: user.id,
        showDefault: true,
        take: 5,
        page: 1,
      });

      const keyboard = Markup.inlineKeyboard([
        ...categories.map((category) => [
          Markup.button.callback(`${category.name}`, `category_${category.id}`),
        ]),
      ]);

      await ctx.reply(
        i18n.t('telegram.scenes.addExpense.stepCategory'),
        keyboard,
      );
    } catch (error) {
      await ctx.scene.leave();
      this.logger.error('Error processing stepCategory', error);
      await ctx.reply(i18n.t('telegram.scenes.error'));
    }
  }

  @Action(/category_(.+)/)
  async onCategoryClick(
    @Ctx() ctx: WizardContext & { match: RegExpExecArray },
    @I18n() i18n: I18nContext,
  ) {
    try {
      ctx.wizard.state['categoryId'] = ctx.match[1];
      return await this.stepEnd(ctx, i18n);
    } catch (error) {
      await ctx.scene.leave();
      this.logger.error('Error processing stepCategory', error);
      await ctx.reply(i18n.t('telegram.scenes.error'));
    }
  }

  @WizardStep(3)
  async stepEnd(@Ctx() ctx: WizardContext, @I18n() i18n: I18nContext) {
    try {
      this.logger.log(
        `amount: ${ctx.wizard.state['amount']}, category: ${ctx.wizard.state['category']}`,
      );

      await this.expensesService.create({
        userId: ctx.wizard.state['userId'] as string,
        amount: ctx.wizard.state['amount'] as number,
        date: new Date(),
        categoryId: ctx.wizard.state['categoryId'] as string,
      });

      await ctx.scene.leave();
      await ctx.reply(i18n.t('telegram.scenes.addExpense.stepEnd'));
      await this.commandsHandler.menuCommand(ctx, i18n);
    } catch (error) {
      await ctx.scene.leave();
      this.logger.error('Error processing stepEnd', error);
      await ctx.reply(i18n.t('telegram.scenes.error'));
    }
  }
}
