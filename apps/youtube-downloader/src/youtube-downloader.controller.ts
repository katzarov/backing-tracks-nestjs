import { Controller } from '@nestjs/common';
import { YoutubeDownloaderService } from './youtube-downloader.service';
import { FfmpegService } from './ffmpeg.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  FileConverterApi,
  IFileConverterApiGetAudioDurationInSecondsPayload,
  IYouTubeDownloaderApiDownloadYouTubeVideoPayload,
  IYouTubeDownloaderApiGetYouTubeVideoInfoPayload,
  YouTubeDownloaderApi,
} from '@app/shared/microservices';

@Controller()
export class YoutubeController {
  constructor(
    private readonly youtubeDownloaderService: YoutubeDownloaderService,
    private readonly ffmpegService: FfmpegService,
  ) {}

  @MessagePattern({ cmd: YouTubeDownloaderApi.getYouTubeVideoInfo })
  getYouTubeVideoInfo(
    @Payload() payload: IYouTubeDownloaderApiGetYouTubeVideoInfoPayload,
  ) {
    return this.youtubeDownloaderService.getYouTubeVideoInfo(payload);
  }

  @MessagePattern({ cmd: YouTubeDownloaderApi.downloadYouTubeVideo })
  downloadYouTubeVideo(
    @Payload() payload: IYouTubeDownloaderApiDownloadYouTubeVideoPayload,
  ) {
    return this.youtubeDownloaderService.downloadYouTubeVideo(payload);
  }

  @MessagePattern({ cmd: FileConverterApi.getAudioDurationInSeconds })
  getAudioDurationInSeconds(
    @Payload() payload: IFileConverterApiGetAudioDurationInSecondsPayload,
  ) {
    return this.ffmpegService.getAudioDurationInSeconds(payload);
  }
}
