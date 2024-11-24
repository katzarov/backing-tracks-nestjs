import { spawnYtDlpChild } from './yt-dlp.spawn-child';
import { objToCommandLineArgs } from './obj-to-command-line-args';
import { IArgs } from './yt-dlp.args.interface';
import { IDumpSingleJson } from './yt-dlp.json_response.interface';
import {
  getParseAndCallClientCb,
  getProgressTemplate,
  ProgressDataDto,
} from './yt-dlp.progress-utils';

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
  private downloadsPath: string;
  private convertedPath: string;

  constructor(
    private url: string,
    options: { downloadsPath: string; convertedPath: string },
  ) {
    this.downloadsPath = options.downloadsPath;
    this.convertedPath = options.convertedPath;
  }

  private buildYtDlpArgs(argsObj: Partial<IArgs>) {
    const commandLineArgs = objToCommandLineArgs(argsObj);
    const ytDlpCommand = [this.url].concat(commandLineArgs);

    return ytDlpCommand;
  }

  /**
   * Silently, gets info for youtube url.
   */
  async getInfo() {
    // dumpSingleJson sets --simulate so nothing is downloaded or written to disk
    //  https://github.com/yt-dlp/yt-dlp?tab=readme-ov-file#verbosity-and-simulation-options
    const args = this.buildYtDlpArgs({
      dumpSingleJson: true,
      sleepInterval: 1,
      sleepRequests: 1,
    });

    try {
      const result = await spawnYtDlpChild(args);

      // TODO: try catch and validate shape of obj... only the fields we actually use.
      const parsedResult: IDumpSingleJson = JSON.parse(result);

      return parsedResult;
    } catch (e) {
      console.log(`Error with getting yt info about: ${this.url}`, e);
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
      sleepInterval: 1,
      sleepRequests: 1,
      limitRate: '64K', // TODO: get from env config, and also each user role might have a diff limit..
      format: 'bestaudio', // TODO figure out if this is actually the best
      extractAudio: true,
      audioFormat: 'mp3',
      paths: [
        `home:/usr/src/app/${this.convertedPath}`, // TODO: get /usr/src/app from env config
        `temp:/usr/src/app/${this.downloadsPath}`,
      ],
      output: `${uri}.%(ext)s`, // `%(title)s-%(id)s-${uri}.%(ext)s`,
      outputNaPlaceholder: 'null',
      progressTemplate: getProgressTemplate(uri),
    });

    try {
      const onProgressUpdateCb = getParseAndCallClientCb(
        onProgressUpdateHandler,
      );

      await spawnYtDlpChild(args, onProgressUpdateCb);
      console.log(
        `Successfully downloaded (or is already downloaded) yt video: ${uri}`,
      );
    } catch (e) {
      console.log(`Error with downloading yt video: ${uri}`, e);
    }
  }
}
