import { IsUrl } from 'class-validator';
import { TrackInfoDto } from './utils/track-info.dto';
import { youTubeUrlValidationOptions } from './utils/youtube-url.validation-options';

export class DownloadYouTubeVideoDto extends TrackInfoDto {
  @IsUrl(youTubeUrlValidationOptions)
  url: string;
}
