import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
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

  @Get(':id')
  findOne(
    @AuthenticatedUser() userId: number,
    @Param('id', ParseIntPipe) playlistId: number,
  ) {
    return this.playlistsService.findOne(userId, playlistId);
  }

  @Get(':id/tracks')
  findAllTracks(
    @AuthenticatedUser() userId: number,
    @Param('id', ParseIntPipe) playlistId: number,
  ) {
    return this.playlistsService.findAllTracks(userId, playlistId);
  }
}
