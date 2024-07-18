import { NestFactory } from '@nestjs/core';
import { YoutubeDownloaderModule } from './youtube-downloader.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // https://github.com/nestjs/nest/pull/12622, https://github.com/nestjs/nest/issues/2343
  const configService = new ConfigService();
  const host = configService.getOrThrow<string>('YOUTUBE_DOWNLOADER_HOST');
  const port = parseInt(
    configService.getOrThrow<string>('YOUTUBE_DOWNLOADER_PORT'),
    10,
  );

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    YoutubeDownloaderModule,
    {
      transport: Transport.TCP,
      options: { host, port, retryAttempts: 0, retryDelay: 0 },
    },
  );
  await app.listen();
}
bootstrap();
