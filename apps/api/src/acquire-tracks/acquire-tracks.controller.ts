import {
  Controller,
  Get,
  Body,
  Post,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { AcquireTracksService } from './acquire-tracks.service';
import { DownloadYouTubeVideoDto } from './dto/download-youtube-video.dto';
import { AuthenticatedUser } from '../auth/authenticated-user.decorator';
import { GetYoutubeVideoInfoDto } from './dto/get-youtube-video-info.dto';
import { SpotifyService } from './spotify.service';
import { SeachForTrackInSpotifyDto } from './dto/search-for-track-in-spotify.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileMagicNumberValidator } from './dto/utils/file-magic-number.validator';
import { UploadTrackDto } from './dto/upload-track.dto';

// TODO: Rate limit this whole controller
@Controller('acquire-tracks')
export class AcquireTracksController {
  constructor(
    private readonly acquireTracksService: AcquireTracksService,
    private readonly spotifyService: SpotifyService,
  ) {}

  @Get('youtube/info/:url')
  getYouTubeVideoInfo(@Param() { url }: GetYoutubeVideoInfoDto) {
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

  // TODO, throttle / cache. We don't get a lot of monthly reqs on the Spotify free tier, I thinks its 500.
  @Get('spotify-search')
  seachForTrackInSpotify(
    @Query() { query, limit, offset }: SeachForTrackInSpotifyDto,
  ) {
    return this.spotifyService.search(query, limit, offset);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadTrack(
    @AuthenticatedUser() userId: number,
    @Body() uploadTrackDto: UploadTrackDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 20000000 }), // in bytes TODO: put in config
          new FileTypeValidator({ fileType: 'audio/mpeg' }),
          new FileMagicNumberValidator({
            fileExtension: 'mp3',
            mimeType: 'audio/mpeg',
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.acquireTracksService.uploadTrack(userId, uploadTrackDto, file);
  }
}
