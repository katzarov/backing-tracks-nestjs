import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist, User } from '../entities';
import { PlaylistRepository } from '../repositories';

@Module({
  imports: [TypeOrmModule.forFeature([User, Playlist])],
  providers: [PlaylistRepository],
  exports: [PlaylistRepository],
})
export class PlaylistRepositoryModule {}
