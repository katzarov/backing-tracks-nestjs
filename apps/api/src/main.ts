import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // disableErrorMessages: true, // for prod
      enableDebugMessages: true,
    }),
  );

  const allowedOrigins =
    configService.getOrThrow<Array<string>>('api.allowedOrigins');

  app.enableCors({
    origin: allowedOrigins,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    // methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    maxAge: 60 * 60,
  });

  app.enableShutdownHooks();

  const port = configService.getOrThrow<number>('api.port');
  await app.listen(port);
}
bootstrap();
