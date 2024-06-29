import { Injectable } from '@nestjs/common';
import { PassThrough } from 'node:stream';
import * as ffmpeg from 'fluent-ffmpeg';
import { TrackStorageService } from '@app/track-storage';

@Injectable()
export class FileConverterService {
  constructor(private trackStorageService: TrackStorageService) {}

  async convertFile(name: string) {
    const trackFile = this.trackStorageService.createTrackFromUri(name);

    const videoSteam = trackFile.getYTDLFromDisk();

    const transformedStream = ffmpeg(videoSteam)
      .format('mp3')
      .audioCodec('libmp3lame')
      .audioBitrate(160)
      .on('progress', function (progress) {
        const { timemark, targetSize } = progress;
        console.log(`timestamp: ${timemark} size: ${targetSize}`);
      })
      // when pipe() with no args, it is actually a Passthrough.. (well should be a Transform actually.)
      // can also pass a writable stream here, but i don't cause then its easier to await the whole process in a promise based fashion.
      .pipe() as PassThrough;

    await trackFile.saveConvertedTrackToDisk(transformedStream);
    console.log('converted');

    return 'DONE';
  }
}
