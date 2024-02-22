import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());
  // cors
  // morgan ? - write log to file ?

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // disableErrorMessages: true, // for prod
      enableDebugMessages: true,
    }),
  );
  // todo, need to configure exceptions better, & log these
  app.enableCors({ origin: 'http://localhost:8080' });

  const port = configService.getOrThrow<number>('apiPort');
  await app.listen(port);
}
bootstrap();

/**
 * TODO:
 *
 * createa DTOs
 * do validation & exception handling
 * security - helmet , cors
 * add swagger
 * set alarms for cloud resources
 * rate limit https://docs.nestjs.com/security/rate-limiting
 * obserbavble fails when no value returned
 * more abstract storage
 * sentry(or similar) for both this and FE
 *
 *
 * another guard to check if user is authzed to access a given resouce..? - shouldnt be necessary.
 *
 *
 * do s3 file storage
 * give client presigned urls
 *
 * export postman collection
 *
 * prob check via node dev/prod env for some flags
 *
 * generate waveforms service - await exec('audiowaveform -i /tmp/data.mp3 -o /tmp/data.json --pixels-per-second 20 --bits 8');
 *
 * g spotify service and think about to what extent do depend on the spotify api (when it comes to db schema as well)
 * when initally cataloguing a track, find it on spotify and use spotifies ids for the artist/track.
 * and later on searching for within our apps db, we need not rely on spotify, but can do elastic search for example.
 * rate limit some (or all) endpoints, but for sure the endpoint that will do the spotify search / the yt download endpoint as well,
 *
 *
 * abstractify the artist as tag ?
 * support genre tags as well ?
 *
 * track versions - bass, guitar, drums
 * support (generic) backing tracks that are not by a (spotify) artist
 *
 * ytdl also save video thumb image, uploader info and image as well - just for UI presentation pursposes, as we will be doing the same for spotiy
 *
 * mp3 file upload - check the builtin multer
 *
 */
