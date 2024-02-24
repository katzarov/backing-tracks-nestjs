import { IsUrl } from 'class-validator';

export class GetYoutubeVideoInfoDto {
  // TODO: there is also IsFQDN ?, I might write a new custom validation pipe anyway, but this should be fine for now.
  @IsUrl({
    protocols: ['https'],
    host_whitelist: ['www.youtube.com', 'youtube.com', 'youtu.be'],
  })
  url: string;
}
