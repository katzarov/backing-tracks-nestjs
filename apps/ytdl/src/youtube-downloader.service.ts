import { Injectable } from '@nestjs/common';
import {
  IYtdlApiGetYouTubeVideoInfoPayload,
  IYtdlApiGetYouTubeVideoInfoResponse,
  TCPStatusCodes,
} from '@app/shared/microservices';
import { YtDlpService } from '@app/yt-dlp-nestjs-module';

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
}
