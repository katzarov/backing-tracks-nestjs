import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { PlaylistsOfTrackDto } from './dto/playlists-of-track.dto';
import { AuthenticatedUser } from '../auth/authenticated-user.decorator';
import { CreatePlaylistDto } from './dto/create-playlist.dto';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  create(
    @AuthenticatedUser() userId: number,
    @Body() createPlaylistDto: CreatePlaylistDto,
  ) {
    return this.playlistsService.create(userId, createPlaylistDto);
  }

  @Get()
  findAll(@AuthenticatedUser() userId: number) {
    return this.playlistsService.findAll(userId);
  }

  @Put(':id')
  editPlaylistsOfTrack(
    @AuthenticatedUser() userId: number,
    @Param('id', ParseIntPipe) trackId: number,
    @Body() playlistsOfTrackDto: PlaylistsOfTrackDto,
  ) {
    return this.playlistsService.editPlaylistsOfTrack(
      userId,
      trackId,
      playlistsOfTrackDto.playlists,
    );
  }
}
