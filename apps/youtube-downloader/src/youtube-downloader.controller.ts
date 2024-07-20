import { Controller } from '@nestjs/common';
import { YoutubeDownloaderService } from './youtube-downloader.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  IYouTubeDownloaderApiDownloadYouTubeVideoPayload,
  IYouTubeDownloaderApiGetYouTubeVideoInfoPayload,
  YouTubeDownloaderApi,
} from '@app/shared/microservices';

@Controller()
export class YoutubeController {
  constructor(
    private readonly youtubeDownloaderService: YoutubeDownloaderService,
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
}
