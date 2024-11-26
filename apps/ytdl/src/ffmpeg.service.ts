import { Injectable } from '@nestjs/common';
import { ffprobe, FfprobeData } from 'fluent-ffmpeg';
import { TrackStorageService } from '@app/track-storage';
import {
  IFileConverterApiGetAudioDurationInSecondsPayload,
  IFileConverterApiGetAudioDurationInSecondsResponse,
  TCPStatusCodes,
} from '@app/shared/microservices';

@Injectable()
export class FfmpegService {
  constructor(private trackStorageService: TrackStorageService) {}

  getAudioDurationInSeconds(
    payload: IFileConverterApiGetAudioDurationInSecondsPayload,
  ): Promise<IFileConverterApiGetAudioDurationInSecondsResponse> {
    const trackDiskPath = this.trackStorageService
      .createTrackFromUri(payload.uri)
      .getTrackDiskPath();

    return new Promise((resolve) => {
      // https://ffmpeg.org/ffprobe.html#Main-options ['-sexagesimal'] => HH:MM:SS.MICROSECONDS
      ffprobe(trackDiskPath, (err: any, data: FfprobeData) => {
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
