import { Controller } from '@nestjs/common';
import { YoutubeDownloaderService } from './youtube-downloader.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller()
export class YoutubeController {
  constructor(
    private readonly youtubeDownloaderService: YoutubeDownloaderService,
  ) {}

  @MessagePattern({ cmd: 'getYouTubeVideoInfo' })
  async getYouTubeVideoInfo(@Payload('url') url: string) {
    return await this.youtubeDownloaderService.getYouTubeVideoInfo(url);
  }

  @MessagePattern({ cmd: 'downloadYouTubeVideo' })
  async downloadYouTubeVideo(@Payload() data: { url: string; name: string }) {
    const { url, name } = data;
    return await this.youtubeDownloaderService.downloadYouTubeVideo(url, name);
  }
}
