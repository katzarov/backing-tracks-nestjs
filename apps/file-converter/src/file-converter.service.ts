import { LocalDiskFileStorageService } from '@app/local-disk-file-storage';
import { Injectable } from '@nestjs/common';
import { pipeline } from 'node:stream/promises';
import { PassThrough } from 'node:stream';
import * as ffmpeg from 'fluent-ffmpeg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileConverterService {
  constructor(
    private localDiskStorageService: LocalDiskFileStorageService,
    private configService: ConfigService,
  ) {
    this.downloadsFolderName = this.configService.get<string>(
      'storage.localDisk.downloadsFolder',
    );
    this.convertedFolderName = this.configService.get<string>(
      'storage.localDisk.convertedFolder',
    );
  }
  private downloadsFolderName: string;
  private convertedFolderName: string;

  async convertFile(name: string) {
    const readableVideoInMp4 = this.localDiskStorageService.getReadableStream(
      this.downloadsFolderName,
      name,
      'mp4',
    );

    const transformedStream = ffmpeg(readableVideoInMp4)
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

    const writableFileStream = this.localDiskStorageService.getWritableStream(
      this.convertedFolderName,
      name,
      'mp3',
    );

    await pipeline(transformedStream, writableFileStream);

    console.log('converted');

    return 'DONE';
  }
}
