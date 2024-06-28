import { Module } from '@nestjs/common';
import { FileConverterController } from './file-converter.controller';
import { FileConverterService } from './file-converter.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from 'config/configuration';
import { TrackStorageModule } from '@app/track-storage';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TrackStorageModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const downloadedTracksPath = configService.getOrThrow<string>(
          'storage.downloadedTracksPath',
        );
        const convertedTracksPath = configService.getOrThrow<string>(
          'storage.convertedTracksPath',
        );

        return {
          downloadedTracksPath,
          convertedTracksPath,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [FileConverterController],
  providers: [FileConverterService],
})
export class FileConverterModule {}
