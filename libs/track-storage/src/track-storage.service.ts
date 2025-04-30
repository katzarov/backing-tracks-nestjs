import {
  Inject,
  Injectable,
  Logger,
  OnApplicationShutdown,
  Scope,
} from '@nestjs/common';
import { MODULE_OPTIONS_TOKEN } from './track-storage.module-definition';
import { TrackStorageOptions } from './track-storage-options.interface';
import { TrackFile } from './impl/TrackFile';
import { DiskDriver } from './impl/DiskDriver';
import { S3Driver } from './impl/S3Driver';

@Injectable({ scope: Scope.DEFAULT })
// default = singleton, explicitly calling it here since this is the only scope that should ever be used for this provider.
export class TrackStorageService implements OnApplicationShutdown {
  diskDriver: DiskDriver;
  s3IsEnabled: boolean;
  s3Driver: S3Driver | undefined;
  private readonly logger = new Logger(TrackStorageService.name);

  constructor(
    @Inject(MODULE_OPTIONS_TOKEN) private options: TrackStorageOptions,
  ) {
    this.diskDriver = new DiskDriver({
      downloadedTracksPath: this.options.disk.downloadedTracksPath,
      convertedTracksPath: this.options.disk.convertedTracksPath,
    });

    this.s3IsEnabled = options.s3.isEnabled;

    if (this.s3IsEnabled) {
      this.s3Driver = new S3Driver({
        region: options.s3.region,
        bucket: options.s3.bucket,
        urlExpiration: options.s3.urlExpiration,
      });
      this.logger.debug('Track Storage Module Config', options);
    }
  }

  onApplicationShutdown(signal: string) {
    if (this.isS3Enabled()) {
      this.logger.log('S3 client destroyed on: ', signal);
      this.s3Driver.destroy();
    }
  }

  private isS3Enabled(): this is TrackStorageService & {
    s3Driver: S3Driver;
  } {
    return this.s3IsEnabled;
  }

  createTrack() {
    const options = {
      diskDriver: this.diskDriver,
      s3IsEnabled: this.s3IsEnabled,
      s3Driver: this.s3Driver,
    };

    return new TrackFile(options);
  }

  createTrackFromUri(uri: string) {
    const options = {
      diskDriver: this.diskDriver,
      s3IsEnabled: this.s3IsEnabled,
      s3Driver: this.s3Driver,
    };

    return new TrackFile(options, uri);
  }
}
