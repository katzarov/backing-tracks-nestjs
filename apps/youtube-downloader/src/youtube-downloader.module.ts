import { Module } from '@nestjs/common';
import { YoutubeController } from './youtube-downloader.controller';
import { YoutubeDownloaderService } from './youtube-downloader.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { youtubeDownloaderConfig, storageConfig } from 'config';
import { TrackStorageModule } from '@app/track-storage';
import { StorageConfigFactory } from '@app/track-storage/storage-config.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [youtubeDownloaderConfig, storageConfig],
      envFilePath: ['.env.nest', '.env.secret'],
    }),
    TrackStorageModule.registerAsync({
      useFactory: StorageConfigFactory,
      inject: [ConfigService],
    }),
  ],
  controllers: [YoutubeController],
  providers: [YoutubeDownloaderService],
})
export class YoutubeDownloaderModule {}
