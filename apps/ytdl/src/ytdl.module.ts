import { Module } from '@nestjs/common';
import { YtdlController } from './ytdl.controller';
import { YoutubeDownloaderService } from './youtube-downloader.service';
import { FfmpegService } from './ffmpeg.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ytdlConfig, storageConfig } from 'config';
import { TrackStorageModule } from '@app/track-storage';
import { StorageConfigFactory } from '@app/track-storage/storage-config.provider';
import { YtDlpModule } from '@app/yt-dlp-nestjs-module';
import { YtDlpOptionsFactory } from '@app/yt-dlp-nestjs-module/yt-dlp.options.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ytdlConfig, storageConfig],
      envFilePath: ['.env.nest', '.env.secret'],
    }),
    TrackStorageModule.registerAsync({
      useFactory: StorageConfigFactory,
      inject: [ConfigService],
    }),
    YtDlpModule.registerAsync({
      useFactory: YtDlpOptionsFactory,
      inject: [ConfigService],
    }),
  ],
  controllers: [YtdlController],
  providers: [YoutubeDownloaderService, FfmpegService],
})
export class YtdlModule {}
