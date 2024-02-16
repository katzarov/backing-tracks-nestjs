import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class DownloadYouTubeVideoDto {
  @IsUrl({ protocols: ['https'], host_whitelist: ['www.youtube.com'] })
  url: string;

  // TODO: write custom validator
  @IsNotEmpty()
  @IsString()
  name: string;
}
