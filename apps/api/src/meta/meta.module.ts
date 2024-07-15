import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from './artist.entity';
import { TrackMeta } from './trackMeta.entity';

// TODO: this module and entitites is temporary
@Module({
  imports: [TypeOrmModule.forFeature([Artist, TrackMeta])],
})
export class MetaModule {}
