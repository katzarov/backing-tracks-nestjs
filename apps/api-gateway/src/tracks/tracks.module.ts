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
  controllers: [TracksController],
  providers: [TracksService],
  exports: [TracksService],
})
export class TracksModule {}
