import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Track } from './track.entity';
import { TracksService } from './tracks.service';
import { TracksController } from './tracks.controller';
import { UserModule } from '../user/user.module';
import { TrackStorageModule } from '@app/track-storage';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([Track]),
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
  controllers: [TracksController],
  providers: [TracksService],
  exports: [TracksService],
})
export class TracksModule {}
