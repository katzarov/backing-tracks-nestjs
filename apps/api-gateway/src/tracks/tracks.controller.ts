import { Controller, Get, Param, Delete } from '@nestjs/common';
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
    @Param('id') resourceId: string,
  ) {
    return this.tracksService.findOne(userId, resourceId);
  }

  @Delete(':id')
  remove(@AuthenticatedUser() userId: number, @Param('id') resourceId: string) {
    return this.tracksService.remove(userId, resourceId);
  }
}
