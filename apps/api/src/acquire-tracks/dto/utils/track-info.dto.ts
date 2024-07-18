import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { TrackType, TrackInstrument } from '@app/database/entities';

export class TrackInfoDto {
  @IsNotEmpty()
  @IsString()
  spotifyId: string;

  @IsEnum(TrackType)
  trackType: TrackType;

  @IsEnum(TrackInstrument)
  trackInstrument: TrackInstrument;
}
