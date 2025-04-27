import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { YtDlpOptions } from './yt-dlp.options.interface';
import { MODULE_OPTIONS_TOKEN } from './yt-dlp.module-definition';
import { YtDlp } from '@app/yt-dlp';

type ICookiesTxtPath = string | undefined;

@Injectable()
export class YtDlpService implements OnApplicationBootstrap {
  private cookiesTxtPath: ICookiesTxtPath;

  constructor(@Inject(MODULE_OPTIONS_TOKEN) protected options: YtDlpOptions) {}
  // there are a bunch of (better) ways to do this.. but for now we'll do it here as a Nest lifecycle hook until I decide how I want to handle the cookie.txt locking issues
  // https://docs.nestjs.com/fundamentals/lifecycle-events#asynchronous-initialization async is supported
  async onApplicationBootstrap() {
    if (!this.options.cookiesEnabled) {
      return;
    }
    this.assertCookiesDefined();

    this.cookiesTxtPath = await YtDlp.writeCookiesToFs(
      this.options.cookies,
      this.options.downloadsPath,
    );
  }

  // Not sure i like this way of doing the type guard. it is easy to mess up the types of the whole class and requires more attention when creating this.
  // TODO Maybe create a TS utility so we can do this in a safer manner.
  protected assertCookiesDefined(): asserts this is YtDlpService & {
    options: Required<YtDlpOptions>;
  } {
    if (this.options.cookies === undefined) {
      throw new Error(
        'Cookies should have been defined when cookies are set to enabled.',
      );
    }
  }

  // Another way to do it - not as easy to mess up all the types but more manual work on client side.
  protected assertCookiesTxtPathDefined(
    cookiesTxtPath: ICookiesTxtPath,
  ): asserts cookiesTxtPath is NonNullable<ICookiesTxtPath> {
    if (cookiesTxtPath === undefined) {
      throw new Error(
        'Path should have been initialized/defined at app bootstrap.',
      );
    }
  }

  YtDlp(url: string) {
    if (this.options.cookiesEnabled) {
      this.assertCookiesTxtPathDefined(this.cookiesTxtPath);

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
