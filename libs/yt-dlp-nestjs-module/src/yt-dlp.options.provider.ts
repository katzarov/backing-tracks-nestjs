import { ConfigService } from '@nestjs/config';
import { YtDlpOptions } from './yt-dlp.options.interface';

export const YtDlpOptionsFactory = (configService: ConfigService) => {
  const config: YtDlpOptions = {
    downloadsPath: configService.getOrThrow<string>(
      'storage.disk.downloadedTracksPath',
    ),
    convertedPath: configService.getOrThrow<string>(
      'storage.disk.convertedTracksPath',
    ),
  };

  return config;
};
