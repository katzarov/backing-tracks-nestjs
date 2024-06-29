import { Module } from '@nestjs/common';
import { YoutubeController } from './youtube-downloader.controller';
import { YoutubeDownloaderService } from './youtube-downloader.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from 'config/configuration';
import { TrackStorageModule } from '@app/track-storage';
// import * as ytdl from 'ytdl-core';

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
  controllers: [YoutubeController],
  providers: [
    // {
    //   provide: 'YTDL_LIB',
    //   useValue: ytdl,
    // },
    YoutubeDownloaderService,
  ],
})
export class YoutubeDownloaderModule {}
