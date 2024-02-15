import { Controller, Get, Body, Post, Param } from '@nestjs/common';
import { AcquireTracksService } from './acquire-tracks.service';
import { DownloadYouTubeVideoDto } from './dto/download-youtube-video.dto';
import { AuthenticatedUser } from '../auth/authenticated-user.decorator';

@Controller('acquire-tracks')
export class AcquireTracksController {
  constructor(private readonly acquireTracksService: AcquireTracksService) {}

  @Get('youtube/info/:url')
  getYouTubeVideoInfo(@Param('url') url: string) {
    return this.acquireTracksService.getYouTubeVideoInfo(url);
  }

  @Post('youtube/download')
  downloadYouTubeVideo(
    @AuthenticatedUser() userId: number,
    @Body() downloadYouTubeVideoDto: DownloadYouTubeVideoDto,
  ) {
    return this.acquireTracksService.downloadYouTubeVideo(
      userId,
      downloadYouTubeVideoDto,
    );
  }

  // TODO: File upload
}
