import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Repository, QueryFailedError } from 'typeorm';
import { Playlist, User } from '../entities';

@Injectable()
export class PlaylistRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
  ) {}

  async create(userId: number, name: string, description?: string) {
    const user = await this.userRepository.findOneByOrFail({ id: userId });
    const playlist = new Playlist({ name, description });
    playlist.user = user;
    try {
      const result = await this.playlistRepository.save(playlist);
      return result;
    } catch (e) {
      if (e instanceof QueryFailedError) {
        // Big TODO,
        // this is postgres specific and it is possible that we move to a different db.
        if (e.driverError.code === '23505') {
          // TODO: catch at playlist service and throw http exceptions there. At this level we should throw repository types of errors.
          throw new ConflictException('Name is already in use.');
        }
      }
      throw e;
    }
  }

  findAll(userId: number) {
    return this.playlistRepository.find({
      where: { user: Equal(userId) },
      select: {
        id: true,
        name: true,
        description: true,
      },
      order: { id: 'ASC' },
    });
  }

  findOne(userId: number, playlistId: number) {
    return this.playlistRepository.findOne({
      where: {
        user: Equal(userId),
        id: Equal(playlistId),
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });
  }

  findAllTracks(userId: number, playlistId: number) {
    return this.playlistRepository.findOne({
      relations: { tracks: { meta: { artist: true } } },
      where: { user: Equal(userId), id: Equal(playlistId) },
      order: { id: 'ASC' },
    });
  }

  delete(userId: number, playlistId: number) {
    return this.playlistRepository.delete({
      user: Equal(userId),
      id: Equal(playlistId),
    });
  }
}
