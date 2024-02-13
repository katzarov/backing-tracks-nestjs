import { IsString } from 'class-validator';

export class DownloadYouTubeVideoDto {
  @IsString()
  url: string;

  @IsString()
  name: string;
}
