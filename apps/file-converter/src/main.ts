import { NestFactory } from '@nestjs/core';
import { FileConverterModule } from './file-converter.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  // https://github.com/nestjs/nest/pull/12622, https://github.com/nestjs/nest/issues/2343
  const configService = new ConfigService();
  const host = configService.getOrThrow<string>('FILE_CONVERTER_HOST');
  const port = parseInt(
    configService.getOrThrow<string>('FILE_CONVERTER_PORT'),
    10,
  );

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FileConverterModule,
    {
      transport: Transport.TCP,
      options: { host, port, retryAttempts: 0, retryDelay: 0 },
    },
  );
  await app.listen();
}
bootstrap();
