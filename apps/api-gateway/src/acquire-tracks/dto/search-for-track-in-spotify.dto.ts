import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { MaxInt } from '@spotify/web-api-ts-sdk';
import { Transform } from 'class-transformer';

// TODO: should trim white space at client and validate here as well.
export class SeachForTrackInSpotifyDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  query: string;

  @IsOptional()
  @Transform(({ value }) => toNumber(value))
  @IsInt()
  @Min(1)
  @Max(10)
  limit?: MaxInt<10>;

  @IsOptional()
  @Transform(({ value }) => toNumber(value))
  @IsInt()
  @Min(0)
  offset?: number;
}

function toNumber(value: string): number | undefined {
  if (!value || Number.isNaN(value)) {
    return undefined;
  }

  return Number.parseInt(value);
}
