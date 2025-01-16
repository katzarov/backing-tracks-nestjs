import { ConfigService } from '@nestjs/config';
import { YtDlpOptions } from './yt-dlp.options.interface';

export const YtDlpOptionsFactory = (configService: ConfigService) => {
  const noCookiesConfig: YtDlpOptions = {
    downloadsPath: configService.getOrThrow<string>(
      'storage.disk.downloadedTracksPath',
    ),
    convertedPath: configService.getOrThrow<string>(
      'storage.disk.convertedTracksPath',
    ),
    cookiesEnabled: configService.getOrThrow<boolean>('ytdl.cookiesEnabled'),
  };

  if (noCookiesConfig.cookiesEnabled) {
    return {
      ...noCookiesConfig,
      cookies: configService.getOrThrow<string>('ytdl.cookies'),
    } satisfies YtDlpOptions;
  }

  return noCookiesConfig;
};
