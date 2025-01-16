import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { YtDlpOptions } from './yt-dlp.options.interface';
import { MODULE_OPTIONS_TOKEN } from './yt-dlp.module-definition';
import { YtDlp } from '@app/yt-dlp';

@Injectable()
export class YtDlpService implements OnApplicationBootstrap {
  private cookiePath: string | undefined;

  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: YtDlpOptions) {}
  // there are a bunch of (better) ways to do this.. but for now we'll do it here as a Nest lifecycle hook until I decide how I want to handle the cookie.txt locking issues
  async onApplicationBootstrap() {
    if (!this.options.cookiesEnabled) {
      return;
    }

    this.cookiePath = await YtDlp.writeCookiesToFs(
      this.options.cookies,
      this.options.downloadsPath,
    );
  }

  YtDlp(url: string) {
    if (this.options.cookiesEnabled) {
      return YtDlp.YtDlpFactory({
        url,
        options: { ...this.options, cookiesTxtPath: this.cookiePath },
      });
    }

    return YtDlp.YtDlpNoCookiesFactory({
      url,
      options: this.options,
    });
  }
}
