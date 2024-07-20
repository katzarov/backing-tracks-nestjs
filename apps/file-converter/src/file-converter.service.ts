import { Injectable } from '@nestjs/common';
import { PassThrough } from 'node:stream';
import * as ffmpeg from 'fluent-ffmpeg';
import { TrackStorageService } from '@app/track-storage';
import {
  IFileConverterApiConvertVideoToAudioPayload,
  IFileConverterApiConvertVideoToAudioResponse,
  IFileConverterApiGetAudioDurationInSecondsPayload,
  IFileConverterApiGetAudioDurationInSecondsResponse,
  TCPStatusCodes,
} from '@app/shared/microservices';

@Injectable()
export class FileConverterService {
  constructor(private trackStorageService: TrackStorageService) {}

  async convertFile(
    payload: IFileConverterApiConvertVideoToAudioPayload,
  ): Promise<IFileConverterApiConvertVideoToAudioResponse> {
    const trackFile = this.trackStorageService.createTrackFromUri(payload.uri);

    const videoStream = trackFile.getYTDLFromDisk();
    const transformedStream = ffmpeg(videoStream)
      .format('mp3')
      .audioCodec('libmp3lame')
      .audioBitrate(160)
      // https://github.com/fluent-ffmpeg/node-fluent-ffmpeg?tab=readme-ov-file#setting-event-handlers
      .on('start', () => {
        console.log(`${payload.uri} - converter started`);
      })
      .on('progress', (progress) => {
        const { timemark, targetSize } = progress;
        console.log(
          `${payload.uri} - converted: timestamp: ${timemark} size: ${targetSize}`,
        );
      })
      .on('end', () => {
        console.log(`${payload.uri} - converter end`);
      })
      .on('error', (err) => {
        console.log(`Converter error for ${payload.uri} `, err.message);
      })
      // when pipe() with no args, it is actually a Passthrough.. (well should be a Transform actually.)
      .pipe() as PassThrough;

    await trackFile.saveConvertedTrackToDisk(transformedStream);

    console.log(`${payload.uri} - converted file saved to local disk`);

    return { status: TCPStatusCodes.Success };
  }

  getAudioDurationInSeconds(
    payload: IFileConverterApiGetAudioDurationInSecondsPayload,
  ): Promise<IFileConverterApiGetAudioDurationInSecondsResponse> {
    const trackDiskPath = this.trackStorageService
      .createTrackFromUri(payload.uri)
      .getTrackDiskPath();

    return new Promise((resolve) => {
      // https://ffmpeg.org/ffprobe.html#Main-options ['-sexagesimal'] => HH:MM:SS.MICROSECONDS
      ffmpeg.ffprobe(trackDiskPath, (err: any, data: ffmpeg.FfprobeData) => {
        if (err) {
          console.log(`FFprobe error for ${payload.uri} `, err);
          return resolve({ status: TCPStatusCodes.Failure });
        }
        if (data.format.duration === undefined) {
          console.log(`FFprobe duration for ${payload.uri} is undefined.`);
        }
        resolve({
          status: TCPStatusCodes.Success,
          duration: data.format.duration ?? null,
        });
      });
    });
  }
}
