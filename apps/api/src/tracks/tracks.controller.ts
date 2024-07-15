import {
  Controller,
  Get,
  Param,
  Delete,
  ParseUUIDPipe,
  Header,
  UseGuards,
} from '@nestjs/common';
import { TracksService } from './tracks.service';
import { AuthenticatedUser } from '../auth/authenticated-user.decorator';
import { GetFileGuard } from './getFile.guard';
import { GetFileViaPresignedS3UrlGuard } from './getFileViaPresignedS3Url.guard';

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  findAll(@AuthenticatedUser() userId: number) {
    return this.tracksService.findAll(userId);
  }

  @Get(':id')
  findOne(
    @AuthenticatedUser() userId: number,
    @Param('id', ParseUUIDPipe) resourceId: string,
  ) {
    return this.tracksService.findOne(userId, resourceId);
  }

  @Get('/file/:id')
  @Header('Content-Type', 'audio/mpeg')
  @UseGuards(GetFileGuard)
  getFile(@Param('id', ParseUUIDPipe) resourceId: string) {
    // TODO: check if resource belongs to user.., not too worried about it right now cause the ids are uuids
    return this.tracksService.getFile(resourceId);
  }

  // TODO rate limit
  @Get('/s3-presigned-url/:id')
  @UseGuards(GetFileViaPresignedS3UrlGuard)
  getFileViaPresignedS3Url(@Param('id', ParseUUIDPipe) resourceId: string) {
    // TODO: same as above - check if resource (exists and) belongs to user.
    return this.tracksService.getFileViaPresignedS3Url(resourceId);
  }

  @Delete(':id')
  remove(
    @AuthenticatedUser() userId: number,
    @Param('id', ParseUUIDPipe) resourceId: string,
  ) {
    return this.tracksService.remove(userId, resourceId);
  }
}
