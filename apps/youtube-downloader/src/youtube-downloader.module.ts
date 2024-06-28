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
