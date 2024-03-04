import { Module } from '@nestjs/common';
import { AcquireTracksService } from './acquire-tracks.service';
import { AcquireTracksController } from './acquire-tracks.controller';
import { TracksModule } from '../tracks/tracks.module';
import { SpotifyService } from './spotify.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TracksModule, UserModule],
  controllers: [AcquireTracksController],
  providers: [AcquireTracksService, SpotifyService],
})
export class AcquireTracksModule {}
