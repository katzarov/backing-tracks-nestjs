import {
  Controller,
  Get,
  Put,
  Param,
  Delete,
  ParseUUIDPipe,
  Header,
  UseGuards,
  ParseIntPipe,
  Body,
  Patch,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { TracksService } from './tracks.service';
import { AuthenticatedUser } from '../auth/authenticated-user.decorator';
import { GetFileGuard } from './getFile.guard';
import { GetFileViaPresignedS3UrlGuard } from './getFileViaPresignedS3Url.guard';
import { UpdatePlaylistsDto } from './dto/update-playlists.dto';
import { UpdateTrackRequestDto, TrackResponse } from './tracks.dto';
import { ITrack } from 'backing-tracks-isomorphic';

@Controller('tracks')
export class TracksController {
  constructor(private readonly tracksService: TracksService) {}

  @Get()
  @ZodSerializerDto(TrackResponse)
  findAll(@AuthenticatedUser() userId: number) {
    return this.tracksService.findAll(userId) satisfies Promise<Array<ITrack>>;
  }

  @Get(':id')
  @ZodSerializerDto(TrackResponse)
  findOne(
    @AuthenticatedUser() userId: number,
    @Param('id', ParseIntPipe) trackId: number,
  ) {
    return this.tracksService.findOne(
      userId,
      trackId,
    ) satisfies Promise<ITrack>;
  }

  @Patch(':id')
  update(
    @AuthenticatedUser() userId: number,
    @Param('id', ParseIntPipe) trackId: number,
    @Body() updateTrackDto: UpdateTrackRequestDto,
  ) {
    // from the perspecitve of the whole track entity this is a PATCH..
    // from the perspective of the regions which is a jsonb col this is a PUT..
    // We are kinda being lazy here. We could have hundreds of regions in that array.. and we just replace them all the time with whatever comes in from this dto.

    //TODO: for these kind of endpoints (non-GET) just return status codes with no body. We dont use this body on the client side anyway, and i dont feel like providing a response interceptor and body validation for absolutely every endpoint - lets do them just for the GETs.
    return this.tracksService.update(userId, trackId, updateTrackDto);
  }

  @Get(':id/playlists')
  findAllPlaylists(
    @AuthenticatedUser() userId: number,
    @Param('id', ParseIntPipe) trackId: number,
  ) {
    return this.tracksService.findAllPlaylists(userId, trackId);
  }

  @Put(':id/playlists')
  updatePlaylists(
    @AuthenticatedUser() userId: number,
    @Param('id', ParseIntPipe) trackId: number,
    @Body() updatePlaylistsDto: UpdatePlaylistsDto,
  ) {
    return this.tracksService.updatePlaylists(
      userId,
      trackId,
      updatePlaylistsDto.playlists,
    );
  }

  // TODO move to a separate endpoint for assets
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
    @Param('id', ParseIntPipe) trackId: number,
  ) {
    // TODO: also delete from file storage
    // TODO: (in general) don't just return the typeorm response...
    return this.tracksService.remove(userId, trackId);
  }
}
