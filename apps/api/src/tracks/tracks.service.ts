import { Injectable, StreamableFile } from '@nestjs/common';
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

  findOne(userId: number, trackId: number) {
    return this.trackRepository.findOneById(userId, trackId);
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
    return this.trackRepository.deleteById(userId, trackId);
  }
}
