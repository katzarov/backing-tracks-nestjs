import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist, Track, User } from '../entities';
import { PlaylistRepository } from '../repositories';

@Module({
  imports: [TypeOrmModule.forFeature([User, Playlist, Track])],
  providers: [PlaylistRepository],
  exports: [PlaylistRepository],
})
export class PlaylistRepositoryModule {}
