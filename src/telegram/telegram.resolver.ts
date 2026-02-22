import { ExecutionContext } from '@nestjs/common';
import { I18nResolver } from 'nestjs-i18n';
import { Context } from 'telegraf';

export class TelegramResolver implements I18nResolver {
  resolve(
    context: ExecutionContext,
  ): Promise<string | string[] | undefined> | string | string[] | undefined {
    const ctx: Context = context.getArgByIndex(0);

    const userLang = ctx.from?.language_code;
    if (userLang) {
      return [userLang];
    }
    return ['en'];
  }
}
