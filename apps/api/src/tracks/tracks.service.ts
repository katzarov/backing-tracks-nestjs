import { Injectable, NotFoundException, StreamableFile } from '@nestjs/common';
import { TrackStorageService } from '@app/track-storage';
import { TrackRepository } from '@app/database/repositories';

@Injectable()
export class TracksService {
  constructor(
    private trackRepository: TrackRepository,
    private trackStorageService: TrackStorageService,
  ) {}

  findAll(userId: number) {
    return this.trackRepository.findAll(userId);
  }

  async findOne(userId: number, trackId: number) {
    const result = await this.trackRepository.findOne(userId, trackId);

    if (result === null) {
      throw new NotFoundException(`Track with id:${trackId} not found.`);
    }

    return result;
  }

  findAllPlaylists(userId: number, trackId: number) {
    return this.trackRepository.findAllPlaylists(userId, trackId);
  }

  updatePlaylists(
    userId: number,
    trackId: number,
    playlists: Array<{ id: number }>,
  ) {
    // TODO Here (and in general), don't just return the typeorm response to the client.
    return this.trackRepository.updatePlaylists(userId, trackId, playlists);
  }

  // TODO check if belongs to user
  getFile(resourceId: string) {
    const file = this.trackStorageService
      .createTrackFromUri(resourceId)
      .getTrackFromDisk();

    return new StreamableFile(file);
  }

  // TODO check if belongs to user
  async getFileViaPresignedS3Url(resourceId: string) {
    const presignedUrl = await this.trackStorageService
      .createTrackFromUri(resourceId)
      .getTrackPresignedUrlFromS3();

    const response = { url: presignedUrl };

    return response;
  }

  remove(userId: number, trackId: number) {
    // TODO delete file as well
    return this.trackRepository.delete(userId, trackId);
  }
}
