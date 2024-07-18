import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Track } from '../entities';
import { TrackRepository } from '../repositories';
import { UserRepositoryModule } from './';

@Module({
  imports: [TypeOrmModule.forFeature([Track]), UserRepositoryModule],
  providers: [TrackRepository],
  exports: [TrackRepository],
})
export class TrackRepositoryModule {}
