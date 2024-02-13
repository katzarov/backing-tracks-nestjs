import { Module } from '@nestjs/common';
import { YoutubeController } from './youtube-downloader.controller';
import { YoutubeDownloaderService } from './youtube-downloader.service';
import { LocalDiskFileStorageModule } from '@app/local-disk-file-storage';
import { ConfigModule } from '@nestjs/config';
import configuration from 'config/configuration';
// import * as ytdl from 'ytdl-core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    LocalDiskFileStorageModule,
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
