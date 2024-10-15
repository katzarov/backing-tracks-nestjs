import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlist, Track } from '../entities';
import { TrackRepository } from '../repositories';
import { UserRepositoryModule } from './';

@Module({
  imports: [TypeOrmModule.forFeature([Track, Playlist]), UserRepositoryModule],
  providers: [TrackRepository],
  exports: [TrackRepository],
})
export class TrackRepositoryModule {}
