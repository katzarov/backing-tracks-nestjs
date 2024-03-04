import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Artist } from '../meta/artist.entity';
import { TrackMeta } from '../meta/trackMeta.entity';

// TODO: this module and entitites is temporary
@Module({
  imports: [TypeOrmModule.forFeature([Artist, TrackMeta])],
})
export class MetaModule {}
