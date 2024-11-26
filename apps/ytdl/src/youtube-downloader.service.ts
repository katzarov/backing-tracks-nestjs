import { Injectable } from '@nestjs/common';
import {
  IYtdlApiGetYouTubeVideoInfoPayload,
  IYtdlApiGetYouTubeVideoInfoResponse,
  IYtdlApiDownloadYouTubeVideoPayload,
  IYtdlApiDownloadYouTubeVideoResponse,
  TCPStatusCodes,
} from '@app/shared/microservices';
import { YtDlpService } from '@app/yt-dlp-nestjs-module';
import type { ProgressDataDto } from '@app/yt-dlp';

@Injectable()
export class YoutubeDownloaderService {
  constructor(private ytDlpService: YtDlpService) {}

  async getYouTubeVideoInfo(
    payload: IYtdlApiGetYouTubeVideoInfoPayload,
  ): Promise<IYtdlApiGetYouTubeVideoInfoResponse> {
    try {
      const ytdlp = this.ytDlpService.YtDlp(payload.youTubeVideoUrl);
      const info = await ytdlp.getInfo();

      const { title, channel, duration, thumbnail } = info; // ..., thumbnails }
      // const thumbnailUrl = thumbnails[0].url;

      return {
        status: TCPStatusCodes.Success,
        title,
        channel,
        length: duration.toString(),
        thumbnailUrl: thumbnail,
      };
    } catch (e) {
      console.log('YTDL is broken.', e);

      return { status: TCPStatusCodes.Failure };
    }
  }

  async downloadYouTubeVideo(
    payload: IYtdlApiDownloadYouTubeVideoPayload,
  ): Promise<IYtdlApiDownloadYouTubeVideoResponse> {
    try {
      const ytdlp = this.ytDlpService.YtDlp(payload.youTubeVideoUrl);

      // TODO: update job progress... (will probably add BullMQ shortly)
      const cb = (data: ProgressDataDto) =>
        console.log('lib client handler', data.eta, data.percent_str);

      await ytdlp.download(payload.uri, cb);

      console.log(`${payload.uri} - download saved to local disk`);

      return { status: TCPStatusCodes.Success };
    } catch (e) {
      console.log('YTDL is broken.', e);

      return { status: TCPStatusCodes.Failure };
    }
  }
}
