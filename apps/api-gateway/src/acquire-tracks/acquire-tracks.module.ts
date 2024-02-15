import { Module } from '@nestjs/common';
import { AcquireTracksService } from './acquire-tracks.service';
import { AcquireTracksController } from './acquire-tracks.controller';
import { TracksModule } from '../tracks/tracks.module';

@Module({
  imports: [TracksModule],
  controllers: [AcquireTracksController],
  providers: [AcquireTracksService],
})
export class AcquireTracksModule {}
