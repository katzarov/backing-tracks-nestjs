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

  findOne(userId: number, resourceId: string) {
    return this.trackRepository.findOneByUri(userId, resourceId);
  }

  getFile(resourceId: string) {
    const file = this.trackStorageService
      .createTrackFromUri(resourceId)
      .getTrackFromDisk();

    return new StreamableFile(file);
  }

  async getFileViaPresignedS3Url(resourceId: string) {
    const presignedUrl = await this.trackStorageService
      .createTrackFromUri(resourceId)
      .getTrackPresignedUrlFromS3();

    const response = { url: presignedUrl };

    return response;
  }

  remove(userId: number, resourceId: string) {
    // TODO delete file as well
    return this.trackRepository.deleteByUri(userId, resourceId);
  }
}
