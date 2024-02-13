import { Module } from '@nestjs/common';
import { AcquireTracksService } from './acquire-tracks.service';
import { AcquireTracksController } from './acquire-tracks.controller';

@Module({
  controllers: [AcquireTracksController],
  providers: [AcquireTracksService],
})
export class AcquireTracksModule {}
