import { createHash } from 'node:crypto';
import { access, constants, writeFile } from 'node:fs/promises';
import { spawnYtDlpChild } from './yt-dlp.spawn-child';
import { objToCommandLineArgs } from './obj-to-command-line-args';
import { IArgs } from './yt-dlp.args.interface';
import { IDumpSingleJson } from './yt-dlp.json_response.interface';
import {
  getParseAndCallClientCb,
  getProgressTemplate,
  ProgressDataDto,
} from './yt-dlp.progress-utils';
import { Logger } from '@nestjs/common';

interface IYtDlpUserOptions {
  url: string;
  // downloadRate: string; TODO
}

interface IYtDlpSystemOptions {
  downloadsPath: string;
  convertedPath: string;
  sleepInterval: number;
  sleepRequests: number;
  maxDownloadRate: string;
  cookiesEnabled: boolean;
  cookiesTxtPath?: string;
}

interface IYtDlpNoCookiesFactory {
  userOptions: IYtDlpUserOptions;
  systemOptions: IYtDlpSystemOptions;
}

interface IYtDlpFactory extends IYtDlpNoCookiesFactory {
  systemOptions: IYtDlpSystemOptions & { cookiesTxtPath: string };
}

/**
 * yt-dlp is currently the best yt download lib, but it is in Python. The simplest thing we can do is to just call the program from a child process and parse its stdout when necessary.
 * Which is what this lib does.
 *
 * TODO: In future, will create a new repo just for it and publish to npm.
 * But will need to make the yt-dlp command builder more like a builder pattern / fluent interface, like this, as right now its quite flexible but requiers great deal of knowledge with the actual python lib.
 *  https://shaky.sh/fluent-interfaces-in-typescript/
 *  https://www.youtube.com/watch?v=bH61wRMqp-o
 *
 */
export class YtDlp {
  private readonly logger = new Logger(YtDlp.name);

  // no multiple constructors in JS, but can remove that static methods and define a couple of TS overloads here... not sure what I prefer.
  private constructor(
    private userOptions: IYtDlpUserOptions,
    private systemOptions: IYtDlpSystemOptions,
  ) {}

  static YtDlpFactory({ userOptions, systemOptions }: IYtDlpFactory) {
    return new YtDlp(userOptions, systemOptions);
  }

  static YtDlpNoCookiesFactory({
    userOptions,
    systemOptions,
  }: IYtDlpNoCookiesFactory) {
    return new YtDlp(userOptions, systemOptions);
  }

  private isCookiesEnabled(
    systemOptions: IYtDlpSystemOptions,
  ): systemOptions is Required<IYtDlpSystemOptions> {
    return systemOptions.cookiesEnabled;
  }

  /**
   *
   * @throws {Error} - when cookies cannot be written to fs
   */
  static async writeCookiesToFs(cookies: string, path: string) {
    const digest = createHash('md5').update(cookies).digest('hex');
    const cookie = `cookie_${digest}.txt`;
    const cookiePath = `${path}/${cookie}`;

    try {
      await access(cookiePath, constants.F_OK);
      // cookie exists, and is the latest current version as in the env.
      return cookiePath;
    } catch (e) {
      // cookie does not exists or is older version and needs to be rewritten.
      // remove all other cookies from dir first ??
      await writeFile(cookiePath, cookies);

      return cookiePath;
    }
  }

  private buildYtDlpArgs(argsObj: Partial<IArgs>) {
    const commandLineArgs = objToCommandLineArgs(argsObj);
    const ytDlpCommand = [this.userOptions.url].concat(commandLineArgs);

    this.logger.debug(commandLineArgs, this.buildYtDlpArgs.name);

    return ytDlpCommand;
  }

  /**
   * Silently, gets info for youtube url.
   * // TODO: check if we can get some metadata for google music or whatever its called and get the track name from there
   */
  async getInfo() {
    // dumpSingleJson sets --simulate so nothing is downloaded or written to disk
    //  https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#verbosity-and-simulation-options
    const args = this.buildYtDlpArgs({
      dumpSingleJson: true,
      sleepInterval: this.systemOptions.sleepInterval,
      sleepRequests: this.systemOptions.sleepRequests,
      ...(this.isCookiesEnabled(this.systemOptions) && {
        cookies: this.systemOptions.cookiesTxtPath,
      }),
    });

    try {
      const result = await spawnYtDlpChild(args);

      // TODO: try catch and validate shape of obj... only the fields we actually use.
      const parsedResult: IDumpSingleJson = JSON.parse(result);

      return parsedResult;
    } catch (error) {
      this.logger.error(
        `Error with getting yt info about: ${this.userOptions.url}`,
        this.getInfo.name,
        error,
      );
    }
  }

  /**
   * Downloads youtube video and converts it to mp3 to local disk.
   * calls onProgressUpdateHandler on download progress updates
   */
  async download(
    uri: string,
    onProgressUpdateHandler: (data: ProgressDataDto) => void,
  ) {
    const args = this.buildYtDlpArgs({
      sleepInterval: this.systemOptions.sleepInterval,
      sleepRequests: this.systemOptions.sleepRequests,
      limitRate: this.systemOptions.maxDownloadRate,
      format: 'bestaudio', // TODO figure out if this is actually the best
      extractAudio: true,
      audioFormat: 'mp3',
      paths: [
        `home:/usr/src/app/${this.systemOptions.convertedPath}`, // TODO: get /usr/src/app from env config
        `temp:/usr/src/app/${this.systemOptions.downloadsPath}`,
      ],
      output: `${uri}.%(ext)s`, // `%(title)s-%(id)s-${uri}.%(ext)s`,
      outputNaPlaceholder: 'null',
      progressTemplate: getProgressTemplate(uri),
      ...(this.isCookiesEnabled(this.systemOptions) && {
        cookies: this.systemOptions.cookiesTxtPath,
      }),
    });

    try {
      const onProgressUpdateCb = getParseAndCallClientCb(
        onProgressUpdateHandler,
      );

      await spawnYtDlpChild(args, onProgressUpdateCb);
      this.logger.log(
        `Successfully downloaded (or is already downloaded) yt video: ${uri}`,
      );
    } catch (error) {
      this.logger.error(
        `Error with downloading yt video: ${uri}`,
        this.download.name,
        error,
      );
    }
  }
}
