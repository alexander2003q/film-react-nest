import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfig } from './app.config.provider';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get<AppConfig>('CONFIG');

  app.setGlobalPrefix('api/afisha');
  app.enableCors();
  await app.listen(config.port);
}
bootstrap();
