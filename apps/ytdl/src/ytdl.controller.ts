import { Controller } from '@nestjs/common';
import { YoutubeDownloaderService } from './youtube-downloader.service';
import { FfmpegService } from './ffmpeg.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  YtdlApi,
  IYtdlApiGetAudioDurationInSecondsPayload,
  IYtdlApiGetYouTubeVideoInfoPayload,
} from '@app/shared/microservices';

@Controller()
export class YtdlController {
  constructor(
    private readonly youtubeDownloaderService: YoutubeDownloaderService,
    private readonly ffmpegService: FfmpegService,
  ) {}

  @MessagePattern({ cmd: YtdlApi.getYouTubeVideoInfo })
  getYouTubeVideoInfo(@Payload() payload: IYtdlApiGetYouTubeVideoInfoPayload) {
    return this.youtubeDownloaderService.getYouTubeVideoInfo(payload);
  }

  @MessagePattern({ cmd: YtdlApi.getAudioDurationInSeconds })
  getAudioDurationInSeconds(
    @Payload() payload: IYtdlApiGetAudioDurationInSecondsPayload,
  ) {
    return this.ffmpegService.getAudioDurationInSeconds(payload);
  }
}
