import { NestFactory } from '@nestjs/core';
import { FileConverterModule } from './file-converter.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

// TODO: Right now there is no good way to get the config module
// wait for this https://github.com/nestjs/nest/pull/12622 to be merged and released.
// main issue https://github.com/nestjs/nest/issues/2343
import { ConfigService } from '@nestjs/config';
const configService = new ConfigService();
const host = configService.getOrThrow<string>('FILE_CONVERTER_HOST');
const port = parseInt(
  configService.getOrThrow<string>('FILE_CONVERTER_PORT'),
  10,
);

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FileConverterModule,
    {
      transport: Transport.TCP,
      options: { host, port },
      // , retryAttempts: 5, retryDelay: 3000 }
    },
  );
  await app.listen();
}
bootstrap();
