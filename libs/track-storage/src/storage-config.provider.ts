import { ConfigService } from '@nestjs/config';
import { TrackStorageOptions } from './track-storage-options.interface';

// TODO https://docs.nestjs.com/recipes/sql-typeorm
export const StorageConfigFactory = (configService: ConfigService) => {
  const config: TrackStorageOptions = {
    disk: {
      downloadedTracksPath: configService.getOrThrow<string>(
        'storage.disk.downloadedTracksPath',
      ),
      convertedTracksPath: configService.getOrThrow<string>(
        'storage.disk.convertedTracksPath',
      ),
    },
    s3: {
      isEnabled: configService.getOrThrow<boolean>('storage.s3.isEnabled'),
      urlExpiration: configService.getOrThrow<number>(
        'storage.s3.urlExpiration',
      ),
      region: configService.getOrThrow<string>('storage.s3.region'),
      bucket: configService.getOrThrow<string>('storage.s3.bucket'),
    },
  };

  return config;
};
