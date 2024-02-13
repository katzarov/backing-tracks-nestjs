import { Module } from '@nestjs/common';
import { FileConverterController } from './file-converter.controller';
import { FileConverterService } from './file-converter.service';
import { LocalDiskFileStorageModule } from '@app/local-disk-file-storage';
import { ConfigModule } from '@nestjs/config';
import configuration from 'config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    LocalDiskFileStorageModule,
  ],
  controllers: [FileConverterController],
  providers: [FileConverterService],
})
export class FileConverterModule {}
