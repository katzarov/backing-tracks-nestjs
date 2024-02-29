import { Module } from '@nestjs/common';
import { AcquireTracksService } from './acquire-tracks.service';
import { AcquireTracksController } from './acquire-tracks.controller';
import { TracksModule } from '../tracks/tracks.module';
import { SpotifyService } from './spotify.service';

@Module({
  imports: [TracksModule],
  controllers: [AcquireTracksController],
  providers: [AcquireTracksService, SpotifyService],
})
export class AcquireTracksModule {}
