import { IsNotEmpty, IsString } from 'class-validator';

export class UploadTrackDto {
  @IsNotEmpty()
  @IsString()
  name: string;
}
