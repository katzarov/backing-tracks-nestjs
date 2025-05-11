import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import {
  TrackTypeEnum,
  TrackInstrumentEnum,
  ITrackType,
  ITrackInstrument,
} from 'backing-tracks-isomorphic';

export class TrackInfoDto {
  @IsNotEmpty()
  @IsString()
  spotifyId: string;

  @IsEnum(TrackTypeEnum)
  trackType: ITrackType;

  @IsEnum(TrackInstrumentEnum)
  trackInstrument: ITrackInstrument;
}
