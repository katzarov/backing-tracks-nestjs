import { IsNotEmpty, IsString, IsUrl } from 'class-validator';

export class DownloadYouTubeVideoDto {
  @IsUrl({
    protocols: ['https'],
    host_whitelist: ['www.youtube.com', 'youtube.com', 'youtu.be'],
  })
  url: string; // TODO: URL => URI ?? https://stackoverflow.com/questions/176264/what-is-the-difference-between-a-uri-a-url-and-a-urn

  // TODO: write custom validator
  @IsNotEmpty()
  @IsString()
  name: string;
}
