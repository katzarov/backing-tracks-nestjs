import { NestFactory } from '@nestjs/core';
import { YoutubeDownloaderModule } from './youtube-downloader.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

// TODO: this whole microservice will be thrown away as we need to switch to a better youtube download lib, likely in a different language, probably python.

// TODO: Right now there is no good way to get the config module
// wait for this https://github.com/nestjs/nest/pull/12622 to be merged and released.
// main issue https://github.com/nestjs/nest/issues/2343
import { ConfigService } from '@nestjs/config';
const configService = new ConfigService();
const host = configService.getOrThrow<string>('YOUTUBE_DOWNLOADER_HOST');
const port = parseInt(
  configService.getOrThrow<string>('YOUTUBE_DOWNLOADER_PORT'),
  10,
);

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    YoutubeDownloaderModule,
    {
      transport: Transport.TCP,
      options: { host, port },
      // , retryAttempts: 5, retryDelay: 3000 }
    },
  );
  await app.listen();
}
bootstrap();
