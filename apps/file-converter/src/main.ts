import { NestFactory } from '@nestjs/core';
import { FileConverterModule } from './file-converter.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    FileConverterModule,
    {
      transport: Transport.TCP,
      options: { port: 3002 },
      // , retryAttempts: 5, retryDelay: 3000 }
    },
  );
  await app.listen();
}
bootstrap();
