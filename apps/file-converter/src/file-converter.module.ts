import { Module } from '@nestjs/common';
import { FileConverterController } from './file-converter.controller';
import { FileConverterService } from './file-converter.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from 'config/configuration';
import { TrackStorageModule } from '@app/track-storage';
import { StorageConfigFactory } from '@app/track-storage/storage-config.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
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
