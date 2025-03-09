import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { YtDlpOptions } from './yt-dlp.options.interface';
import { MODULE_OPTIONS_TOKEN } from './yt-dlp.module-definition';
import { YtDlp } from '@app/yt-dlp';

@Injectable()
export class YtDlpService implements OnApplicationBootstrap {
  private cookiesTxtPath: string | undefined;

  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: YtDlpOptions) {}
  // there are a bunch of (better) ways to do this.. but for now we'll do it here as a Nest lifecycle hook until I decide how I want to handle the cookie.txt locking issues
  // https://docs.nestjs.com/fundamentals/lifecycle-events#asynchronous-initialization async is supported
  async onApplicationBootstrap() {
    if (!this.options.cookiesEnabled) {
      return;
    }

    this.cookiesTxtPath = await YtDlp.writeCookiesToFs(
      this.options.cookies,
      this.options.downloadsPath,
    );
  }

  YtDlp(url: string) {
    if (this.options.cookiesEnabled) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { cookies, ...optionsWithoutCookies } = this.options;

      return YtDlp.YtDlpFactory({
        userOptions: {
          url,
        },
        systemOptions: {
          ...optionsWithoutCookies,
          cookiesTxtPath: this.cookiesTxtPath,
        },
      });
    }

    return YtDlp.YtDlpNoCookiesFactory({
      userOptions: {
        url,
      },
      systemOptions: this.options,
    });
  }
}
