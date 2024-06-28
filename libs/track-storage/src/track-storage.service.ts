import { Inject, Injectable } from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from './track-storage.module-definition';
import { TrackStorageOptions } from './track-storage-options.interface';
import { TrackFile } from './impl/TrackFile';

@Injectable()
export class TrackStorageService {
  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private options: TrackStorageOptions,
  ) {
  }

  createTrack() {
    const options = {
      downloadedTracksPath: this.options.downloadedTracksPath,
      convertedTracksPath: this.options.convertedTracksPath,
    };
    return new TrackFile(options);
  }

  createTrackFromUri(uri: string) {
    const options = {
      downloadedTracksPath: this.options.downloadedTracksPath,
      convertedTracksPath: this.options.convertedTracksPath,
    };
    return new TrackFile(options, uri);
  }
  }
