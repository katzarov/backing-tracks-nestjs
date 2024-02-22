import {
  Controller,
  Get,
  Param,
  Delete,
  ParseUUIDPipe,
  Header,
} from '@nestjs/common';
import { TracksService } from './tracks.service';
import { AuthenticatedUser } from '../auth/authenticated-user.decorator';

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
  getFile(@Param('id', ParseUUIDPipe) resourceId: string) {
    // TODO: the file streaming should probably not be a part of this module.. or even app.
    // TODO: check if resource belongs to user.., not too worried about it right now cause the ids are uuids
    return this.tracksService.getFile(resourceId);
  }

  @Delete(':id')
  remove(
    @AuthenticatedUser() userId: number,
    @Param('id', ParseUUIDPipe) resourceId: string,
  ) {
    return this.tracksService.remove(userId, resourceId);
  }
}
