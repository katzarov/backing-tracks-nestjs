import { Module } from '@nestjs/common';
import { FileConverterController } from './file-converter.controller';
import { FileConverterService } from './file-converter.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { fileConverterConfig, storageConfig } from 'config';
import { TrackStorageModule } from '@app/track-storage';
import { StorageConfigFactory } from '@app/track-storage/storage-config.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [fileConverterConfig, storageConfig],
      envFilePath: ['.env.nest', '.env.secret'],
    }),
    TrackStorageModule.registerAsync({
      useFactory: StorageConfigFactory,
      inject: [ConfigService],
    }),
  ],
  controllers: [FileConverterController],
  providers: [FileConverterService],
})
export class FileConverterModule {}
