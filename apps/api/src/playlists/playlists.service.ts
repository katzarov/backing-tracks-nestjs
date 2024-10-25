import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.playlistRepository.findAll(userId);
  }

  async findOne(userId: number, playlistId: number) {
    const result = await this.playlistRepository.findOne(userId, playlistId);

    if (result === null) {
      throw new NotFoundException(`Playlist with id:${playlistId} not found.`);
    }

    return result;
  }

  findAllTracks(userId: number, playlistId: number) {
    return this.playlistRepository.findAllTracks(userId, playlistId);
  }

  remove(userId: number, playlistId: number) {
    return this.playlistRepository.delete(userId, playlistId);
  }
}
