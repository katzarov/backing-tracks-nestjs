import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, In, Repository, QueryFailedError } from 'typeorm';
import { Playlist, Track, User } from '../entities';

@Injectable()
export class PlaylistRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
    @InjectRepository(Track)
    private readonly trackRepository: Repository<Track>,
  ) {}

  findAllPlaylists(userId: number) {
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

  async editPlaylistsOfTrack(
    userId: number,
    trackId: number,
    newPlaylistsOfTrack: Array<{ id: number }>,
  ) {
    const track = await this.trackRepository.findOne({
      where: { user: Equal(userId), id: Equal(trackId) },
    });

    const playlistEntities = await this.playlistRepository.findBy({
      user: Equal(userId),
      id: In(newPlaylistsOfTrack.map((playlist) => playlist.id)),
    });

    track.playlists = playlistEntities;

    return this.trackRepository.save(track);
  }

  async create(userId: number, name: string, description?: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
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
          throw new ConflictException('Name is already in use.');
        }
      }
      throw e;
    }
  }
}
