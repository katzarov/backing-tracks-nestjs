import { Module } from '@nestjs/common';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { TrackStorageModule } from '@app/track-storage';
import { ConfigService } from '@nestjs/config';
import { StorageConfigFactory } from '@app/track-storage/storage-config.provider';
import { TrackRepositoryModule } from '@app/database/modules';

@Module({
  imports: [
    TrackRepositoryModule,
    TrackStorageModule.registerAsync({
      useFactory: StorageConfigFactory,
      inject: [ConfigService],
    }),
  ],
  controllers: [TracksController],
  providers: [TracksService],
  exports: [TracksService],
})
export class TracksModule {}
