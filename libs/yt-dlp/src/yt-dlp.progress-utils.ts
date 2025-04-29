import { z } from 'zod';

// TODO might need to also parse converting / ffmpeg / other stages from stdout.
const downloadingTrackProgressKey = '[downloading-track]';
const splitToken = '__SPLIT_TOKEN__';
export const NotAvailablePlaceholder = 'null';

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
      // progress: '%(progress)s', // uncomment to check all that we have on the progress object. TODO we should just always print this for debugging purposes.
      // https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/downloader/common.py#L401
      // https://github.com/yt-dlp/yt-dlp/blob/master/yt_dlp/downloader/common.py#L379
    }),
  );

const stringToIntOrNull = z
  .string()
  .trim()
  .min(1, { message: 'Progress template is likely broken.' })
  .transform((value, ctx) => {
    if (value === NotAvailablePlaceholder) {
      return null;
    }

    // also handles percent "4.5%" => 4
    const number = Number.parseInt(value);

    if (!Number.isInteger(number)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Cannot parse as number. Progress template is likely broken.',
      });
      // Special symbol to return early from the transform function. Has type `never` so it does not affect the inferred return type.
      return z.NEVER;
    }

    return number;
  });

// This is a shape-checking/validating schema for external incoming data. So will stick to the 'Dto' naming convention.
export const YtDlpProgressDto = z.object({
  uri: z.string().trim().uuid(),
  eta: stringToIntOrNull,
  percent_str: stringToIntOrNull,
});

export type IYtDlpProgress = z.infer<typeof YtDlpProgressDto>;

const parseProgressData = (
  data: string,
  onProgressDataParsedCb: (data: IYtDlpProgress) => void,
) => {
  const splitData = data.split(splitToken);
  const matchDownloadingTrackStep =
    splitData[0]?.trim() === downloadingTrackProgressKey;

  if (matchDownloadingTrackStep) {
    try {
      const downloadingTrackProgressValue = splitData[1];

      const tempateErrorMsg =
        'DTO Validation error: progress template is likely broken, check the latest yt-dlp lib updates';

      if (downloadingTrackProgressValue === undefined) {
        throw new Error(tempateErrorMsg);
      }

      const dto = JSON.parse(downloadingTrackProgressValue.trim());

      const parsed = YtDlpProgressDto.parse(dto);

      onProgressDataParsedCb(parsed);
    } catch (e) {
      // TODO use logger
      console.log('Error parsing', e);
    }
  }
};

export const getParseAndCallClientCb =
  (clientCb: (data: IYtDlpProgress) => void) => (data: string) =>
    parseProgressData(data, clientCb);
