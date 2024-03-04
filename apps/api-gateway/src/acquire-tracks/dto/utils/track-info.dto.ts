import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { TrackType, TrackInstrument } from '../../../tracks/track.entity';

export class TrackInfoDto {
  @IsNotEmpty()
  @IsString()
  spotifyId: string;

  @IsEnum(TrackType)
  trackType: TrackType;

  @IsEnum(TrackInstrument)
  trackInstrument: TrackInstrument;
}
