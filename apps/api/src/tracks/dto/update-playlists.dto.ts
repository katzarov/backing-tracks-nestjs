import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, ValidateNested } from 'class-validator';

class PlaylistDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;
}

export class UpdatePlaylistsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlaylistDto)
  playlists: Array<PlaylistDto>;
}
