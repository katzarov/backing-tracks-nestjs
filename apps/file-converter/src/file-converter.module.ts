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
        return {
          disk: {
            downloadedTracksPath: configService.getOrThrow<string>(
              'storage.disk.downloadedTracksPath',
            ),
            convertedTracksPath: configService.getOrThrow<string>(
              'storage.disk.convertedTracksPath',
            ),
          },
          s3: {
            isEnabled: configService.getOrThrow<boolean>(
              'storage.s3.isEnabled',
            ),
            region: configService.getOrThrow<string>('storage.s3.region'),
            bucket: configService.getOrThrow<string>('storage.s3.bucket'),
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [FileConverterController],
  providers: [FileConverterService],
})
export class FileConverterModule {}
