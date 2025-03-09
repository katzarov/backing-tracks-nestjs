import { plainToInstance, Transform } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  validateSync,
} from 'class-validator';

// TODO might need to also parse converting / ffmpeg / other stages from stdout.
const downloadingTrackProgressKey = '[downloading-track]';
const splitToken = '__SPLIT_TOKEN__';

export const getProgressTemplate = (uri: string) =>
  `download:${downloadingTrackProgressKey}`.concat(splitToken).concat(
    JSON.stringify({
      uri: uri,
      youtube_id: '%(info.id)s',
      status: '%(progress.status)s',
      speed: '%(progress.speed)s',
      // speed_str: '%(progress._speed_str)s',
      elapsed: '%(progress.elapsed)s',
      // elapsed_str: '%(progress._elapsed_str)s',
      eta: '%(progress.eta)s',
      // eta_str: '%(progress._eta_str)s',
      percent_str: '%(progress._percent_str)s',
      downloaded_bytes: '%(progress.downloaded_bytes)s',
      // downloaded_bytes_str: '%(progress._downloaded_bytes_str)s',
      total_bytes: '%(progress.total_bytes)s',
      // total_bytes_str: '%(progress._total_bytes_str)s',
      // total_bytes_estimate_str: '%(progress._total_bytes_estimate_str)s',
      // progress: '%(progress)s',
      // https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/downloader/common.py#L401
      // https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/downloader/common.py#L379
    }),
  );

enum progressStatusEnum {
  DOWNLOADING = 'downloading',
  FINISHED = 'finished',
}

// TODO: for all fields transform from 'null' to null
export class ProgressDataDto {
  @IsUUID(4)
  uri: string;

  @IsString()
  youtube_id: string;

  @IsEnum(progressStatusEnum)
  status: string;

  @Transform(({ value }) => toNumber(value), { toClassOnly: true })
  @IsInt()
  speed: number | null;

  @Transform(({ value }) => toNumber(value), { toClassOnly: true })
  @IsInt()
  elapsed: number | null;

  @Transform(({ value }) => toNumber(value), { toClassOnly: true })
  @IsInt()
  @IsOptional()
  eta: number | null;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value.trim(), { toClassOnly: true })
  percent_str: string;

  @Transform(({ value }) => toNumber(value), { toClassOnly: true })
  @IsInt()
  downloaded_bytes: number | null;

  @Transform(({ value }) => toNumber(value), { toClassOnly: true })
  @IsInt()
  total_bytes: number | null;
}

const parseProgressData = (
  data: string,
  onProgressDataParsedCb: (data: ProgressDataDto) => void,
) => {
  const splitData = data.split(splitToken);
  const matchDownloadingTrackStep =
    splitData[0].trim() === downloadingTrackProgressKey;

  if (matchDownloadingTrackStep) {
    try {
      const dto = JSON.parse(splitData[1].trim());

      const transformed = plainToInstance(ProgressDataDto, dto);

      // Note that validateSync ignores async validations
      const errors = validateSync(transformed);

      if (errors.length > 0) {
        throw new Error(
          'DTO Validation error: progress template is likely broken, check the latest yt-dlp lib updates',
        );
      }

      onProgressDataParsedCb(transformed);
    } catch (e) {
      console.log('Error parsing', e);
    }
  }
};

export const getParseAndCallClientCb =
  (clientCb: (data: ProgressDataDto) => void) => (data: string) =>
    parseProgressData(data, clientCb);

function toNumber(value: string): number | null {
  if (value === 'null' || Number.isNaN(value)) {
    return null;
  }

  return Number.parseInt(value);
}
