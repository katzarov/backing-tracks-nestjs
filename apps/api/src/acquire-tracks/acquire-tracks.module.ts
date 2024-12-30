import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { AcquireTracksService } from './acquire-tracks.service';
import { AcquireTracksController } from './acquire-tracks.controller';
import { TracksModule } from '../tracks/tracks.module';
import { SpotifyService } from './spotify.service';
import { TrackStorageModule } from '@app/track-storage';
import { StorageConfigFactory } from '@app/track-storage/storage-config.provider';
import { TrackRepositoryModule } from '@app/database/modules';
import { YTDL_SERVICE_TOKEN } from './acquire-tracks.injection-tokens';
import { YtdlQueueModule } from '@app/job-queue';
import { AcquireTracksOnYtdlQueueEvents } from './acquire-tracks.on-ytdl-queue-events';

@Module({
  imports: [
    TracksModule,
    TrackRepositoryModule,
    TrackStorageModule.registerAsync({
      useFactory: StorageConfigFactory,
      inject: [ConfigService],
    }),
    YtdlQueueModule,
  ],
  controllers: [AcquireTracksController],
  providers: [
    AcquireTracksService,
    SpotifyService,
    {
      provide: YTDL_SERVICE_TOKEN,
      useFactory: (configService: ConfigService) => {
        const host = configService.getOrThrow<string>('ytdl.host');
        const port = configService.getOrThrow<number>('ytdl.port');

        return ClientProxyFactory.create({
          transport: Transport.TCP,
          options: { host, port },
        });
      },
      inject: [ConfigService],
    },
    AcquireTracksOnYtdlQueueEvents,
  ],
})
export class AcquireTracksModule {}
