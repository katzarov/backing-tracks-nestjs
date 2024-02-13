import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AuthGuard } from './auth/auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());
  // cors
  // morgan ? - write log to file ?

  app.useGlobalGuards(new AuthGuard(configService));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // disableErrorMessages: true, // for prod
      enableDebugMessages: true,
    }),
  );
  // todo, need to configure exceptions better, & log these

  const port = configService.getOrThrow('apiPort'); // TODO; swithc all to getOrThrow
  await app.listen(port);
}
bootstrap();

// const app = await NestFactory.create(AppModule, express, {
//   bufferLogs: true,
//   abortOnError: false, // create a nest module and rethrow an error, instead of aborting the startup
// }).catch(console.error) as INestApplication

/**
 * TODO:
 *
 * createa DTOs
 * do validation & exception handling
 * security - helmet , cors
 * obserbavble fails when no value returned
 * more abstract storage
 *
 * setup an ORM
 * start the crud parts
 *
 * add an auth provider
 * guards
 *
 * do the whole flow : download track and save per user & default playlist
 *
 * do s3 file storage
 * give client presigned urls
 *
 * export postman collection
 *
 * prob check via node dev/prod env for some flags
 *
 * generate waveforms service
 *
 */