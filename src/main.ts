import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const logger = new Logger('App');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  await app.listen(configService.get('PORT') ?? 3000, () => {
    logger.log(`App listening on port ${configService.get('PORT')}`);
  });
}
bootstrap().catch((err) => {
  logger.error('Failed to start application', err);
  process.exit(1);
});
