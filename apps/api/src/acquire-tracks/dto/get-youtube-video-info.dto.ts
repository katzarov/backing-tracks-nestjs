import { IsUrl } from 'class-validator';
import { youTubeUrlValidationOptions } from './utils/youtube-url.validation-options';

export class GetYoutubeVideoInfoDto {
  @IsUrl(youTubeUrlValidationOptions)
  url: string;
}
