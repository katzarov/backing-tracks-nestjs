import { ConfigService } from '@nestjs/config';
import { YtDlpOptions } from './yt-dlp.options.interface';

export const YtDlpOptionsFactory = (configService: ConfigService) => {
  const cookiesEnabled = configService.getOrThrow<boolean>(
    'ytdl.ytDlp.cookiesEnabled',
  );

  const noCookiesConfig: YtDlpOptions = {
    downloadsPath: configService.getOrThrow<string>(
      'storage.disk.downloadedTracksPath',
    ),
    convertedPath: configService.getOrThrow<string>(
      'storage.disk.convertedTracksPath',
    ),
    sleepInterval: configService.getOrThrow<number>('ytdl.ytDlp.sleepInterval'),
    sleepRequests: configService.getOrThrow<number>('ytdl.ytDlp.sleepRequests'),
    maxDownloadRate: configService.getOrThrow<string>(
      'ytdl.ytDlp.maxDownloadRate',
    ),
    cookiesEnabled: cookiesEnabled,
  };

  if (cookiesEnabled) {
    return {
      ...noCookiesConfig,
      cookies: configService.getOrThrow<string>('ytdl.ytDlp.cookies'),
    } satisfies YtDlpOptions;
  }

  return noCookiesConfig;
};
