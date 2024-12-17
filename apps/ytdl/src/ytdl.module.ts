import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { YtdlController } from './ytdl.controller';
import { YoutubeDownloaderService } from './youtube-downloader.service';
import { FfmpegService } from './ffmpeg.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ytdlConfig, storageConfig, redisConfig } from 'config';
import { TrackStorageModule } from '@app/track-storage';
import { StorageConfigFactory } from '@app/track-storage/storage-config.provider';
import { YtDlpModule } from '@app/yt-dlp-nestjs-module';
import { YtDlpOptionsFactory } from '@app/yt-dlp-nestjs-module/yt-dlp.options.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ytdlConfig, redisConfig, storageConfig],
      envFilePath: ['.env.nest', '.env.secret'],
    }),
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const host = configService.getOrThrow<string>('redis.host');
        const port = configService.getOrThrow<number>('redis.port');

        return {
          connection: { host, port, connectionName: 'ytdl' },
        };
      },
      inject: [ConfigService],
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
