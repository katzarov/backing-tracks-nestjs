import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Track, TrackMeta, Artist } from '../entities';
import { EntityManager, Repository, Equal } from 'typeorm';
import { CreateTrackMatchedWithSpotifyRepositoryDto } from './dto';
import { UserRepository } from './';

@Injectable()
export class TrackRepository {
  constructor(
    @InjectRepository(Track)
    private readonly trackRepository: Repository<Track>,
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
    });
    const track = new Track({
      resourceId: dto.track.uri,
      duration: dto.track.duration,
      trackType: dto.track.trackType,
      trackInstrument: dto.track.trackInstrument,
      meta: trackMeta,
      // user: new User(userId),
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
      relations: { meta: { artist: true }, playlists: true },
      where: { user: Equal(userId) },
      select: {
        id: true,
        resourceId: true,
        duration: true,
        trackType: true,
        trackInstrument: true,
        meta: { trackName: true, artist: { artistName: true } },
        playlists: { id: true, name: true, description: true },
      },
      order: { id: 'ASC' },
    });

    // return this.tracksRepository.findBy({ user: Equal(userId) });
  }

  findOneByUri(userId: number, resourceId: string) {
    return this.trackRepository.find({
      relations: { meta: { artist: true } },
      where: {
        user: Equal(userId),
        resourceId: Equal(resourceId),
      },
      select: {
        resourceId: true,
        duration: true,
        trackType: true,
        trackInstrument: true,
        meta: { trackName: true, artist: { artistName: true } },
      },
    });

    // https://typeorm.io/find-options#basic-options
    // WHERE OR
    // where: [{ user: Equal(userId) }, { resourceId: Equal(resourceId) }]
    // WHERE AND
    // where: { user: Equal(userId), resourceId: Equal(resourceId),}

    // return this.tracksRepository.findBy({
    //   user: Equal(userId),
    //   resourceId: Equal(resourceId),
    // });
  }

  deleteByUri(userId: number, resourceId: string) {
    return this.trackRepository.delete({
      user: Equal(userId),
      resourceId: Equal(resourceId),
    });
  }
}
