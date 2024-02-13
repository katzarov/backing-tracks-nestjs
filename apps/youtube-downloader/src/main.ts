import { NestFactory } from '@nestjs/core';
import { YoutubeDownloaderModule } from './youtube-downloader.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

// TODO: this whole microservice will be thrown away as we need to switch to a better youtube download lib, likely in a different language, probably python.

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    YoutubeDownloaderModule,
    {
      transport: Transport.TCP,
      options: { port: 3001 },
      // , retryAttempts: 5, retryDelay: 3000 }
    },
  );
  await app.listen();
}
bootstrap();
