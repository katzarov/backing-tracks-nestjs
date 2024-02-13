import { Controller, Get, Body, Post, Param } from '@nestjs/common';
import { AcquireTracksService } from './acquire-tracks.service';
import { DownloadYouTubeVideoDto } from './dto/download-youtube-video.dto';

@Controller('acquire-tracks')
export class AcquireTracksController {
  constructor(private readonly acquireTracksService: AcquireTracksService) {}

  @Get('youtube/info/:url')
  getYouTubeVideoInfo(@Param('url') url: string) {
    return this.acquireTracksService.getYouTubeVideoInfo(url);
  }

  @Post('youtube/download')
  downloadYouTubeVideo(
    @Body() downloadYouTubeVideoDto: DownloadYouTubeVideoDto,
  ) {
    return this.acquireTracksService.downloadYouTubeVideo(
      downloadYouTubeVideoDto,
    );
  }

  // TODO: File upload
}
