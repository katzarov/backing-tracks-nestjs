import { Injectable } from '@nestjs/common';
import { PlaylistRepository } from '@app/database/repositories';
import { CreatePlaylistDto } from './dto/create-playlist.dto';

@Injectable()
export class PlaylistsService {
  constructor(private playlistRepository: PlaylistRepository) {}

  create(userId: number, createPlaylistDto: CreatePlaylistDto) {
    return this.playlistRepository.create(
      userId,
      createPlaylistDto.name,
      createPlaylistDto.description,
    );
  }

  findAll(userId: number) {
    return this.playlistRepository.findAllPlaylists(userId);
  }

  findOne(userId: number, playlistId: number) {
    return this.playlistRepository.getPlaylistWithAllTracks(userId, playlistId);
  }

  editPlaylistsOfTrack(
    userId: number,
    trackId: number,
    playlistsOfTrack: Array<{ id: number }>,
  ) {
    // TODO Here (and in general), don't just return the typeorm response to the client.
    return this.playlistRepository.editPlaylistsOfTrack(
      userId,
      trackId,
      playlistsOfTrack,
    );
  }
}
