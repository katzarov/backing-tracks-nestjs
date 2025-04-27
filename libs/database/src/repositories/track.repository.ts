import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Track, TrackMeta, Artist, Playlist } from '../entities';
import { EntityManager, Repository, Equal, In } from 'typeorm';
import { CreateTrackMatchedWithSpotifyRepositoryDto } from './dto';
import { UserRepository } from './';

@Injectable()
export class TrackRepository {
  constructor(
    @InjectRepository(Track)
    private readonly trackRepository: Repository<Track>,
    @InjectRepository(Playlist)
    private readonly playlistRepository: Repository<Playlist>,
    private readonly userRepository: UserRepository,
    private entityManager: EntityManager,
  ) {}

  async createTrackMatchedWithSpotify(
    dto: CreateTrackMatchedWithSpotifyRepositoryDto,
  ) {
    const artist = new Artist({
      spotifyUri: dto.artist.spotifyUri,
      artistName: dto.artist.name,
    });
    const trackMeta = new TrackMeta({
      spotifyUri: dto.trackMeta.spotifyUri,
      trackName: dto.trackMeta.name,
      albumArt: dto.trackMeta.albumArt,
    });
    const track = new Track({
      resourceId: dto.track.uri,
      duration: dto.track.duration,
      trackType: dto.track.trackType,
      trackInstrument: dto.track.trackInstrument,
      meta: trackMeta,
    });

    const user = await this.userRepository.findOneById(dto.user.id);
    track.user = user;

    await this.entityManager.transaction(async (transactionalEntityManager) => {
      const newArtist = await transactionalEntityManager.save(artist);
      trackMeta.artist = newArtist;
      const newTrackMeta = await transactionalEntityManager.save(trackMeta);
      track.meta = newTrackMeta;
      await transactionalEntityManager.save(track);
    });
  }

  findAll(userId: number) {
    return this.trackRepository.find({
      relations: { meta: { artist: true } },
      where: { user: Equal(userId) },
      order: { id: 'ASC' },
    });
  }

  findOne(userId: number, trackId: number) {
    return this.trackRepository.findOne({
      relations: { meta: { artist: true } },
      where: {
        user: Equal(userId),
        id: Equal(trackId),
      },
    });
  }

  findAllPlaylists(userId: number, trackId: number) {
    return this.trackRepository.findOne({
      relations: { playlists: true },
      where: { user: Equal(userId), id: Equal(trackId) },
      select: {
        id: true,
        playlists: { id: true, name: true, description: true },
      },
      order: { id: 'ASC' },
    });
  }

  async updatePlaylists(
    userId: number,
    trackId: number,
    newPlaylistsOfTrack: Array<{ id: number }>,
  ) {
    const track = await this.trackRepository.findOneOrFail({
      where: { user: Equal(userId), id: Equal(trackId) },
    });

    const playlistEntities = await this.playlistRepository.findBy({
      user: Equal(userId),
      id: In(newPlaylistsOfTrack.map((playlist) => playlist.id)),
    });

    track.playlists = playlistEntities;

    return this.trackRepository.save(track);
  }

  delete(userId: number, trackId: number) {
    return this.trackRepository.delete({
      user: Equal(userId),
      id: Equal(trackId),
    });
  }
}
