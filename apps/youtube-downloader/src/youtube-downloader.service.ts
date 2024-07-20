import { Injectable } from '@nestjs/common';
import * as ytdl from 'ytdl-core';
import { TrackStorageService } from '@app/track-storage';
import {
  IYouTubeDownloaderApiGetYouTubeVideoInfoPayload,
  IYouTubeDownloaderApiGetYouTubeVideoInfoResponse,
  IYouTubeDownloaderApiDownloadYouTubeVideoPayload,
  IYouTubeDownloaderApiDownloadYouTubeVideoResponse,
  TCPStatusCodes,
} from '@app/shared/microservices';

@Injectable()
export class YoutubeDownloaderService {
  constructor(private trackStorageService: TrackStorageService) {}

  async getYouTubeVideoInfo(
    payload: IYouTubeDownloaderApiGetYouTubeVideoInfoPayload,
  ): Promise<IYouTubeDownloaderApiGetYouTubeVideoInfoResponse> {
    try {
      const info = await ytdl.getInfo(payload.youTubeVideoUrl);

      const { title, author, lengthSeconds, thumbnails } = info.videoDetails;
      const { name } = author;
      const thumbnailUrl = thumbnails[0].url;

      return {
        status: TCPStatusCodes.Success,
        title,
        channel: name,
        length: lengthSeconds,
        thumbnailUrl,
      };
    } catch (e) {
      console.log('YTDL is broken.', e);

      return { status: TCPStatusCodes.Failure };
    }
  }

  async downloadYouTubeVideo(
    payload: IYouTubeDownloaderApiDownloadYouTubeVideoPayload,
  ): Promise<IYouTubeDownloaderApiDownloadYouTubeVideoResponse> {
    try {
      const info = await ytdl.getInfo(payload.youTubeVideoUrl);
      const formats = ytdl.filterFormats(info.formats, 'audioonly');
      const choosenFormat = ytdl.chooseFormat(formats, {
        quality: 'highestaudio',
      });

      const videoStream = ytdl(payload.youTubeVideoUrl, {
        format: choosenFormat,
      });

      videoStream.on('info', () => {
        // the usage of the uri like this kinda suggest it is used as a job tracking id, but it is not - will have another system to handle the jobs and queue.
        console.log(`${payload.uri} - download start`);
      });

      videoStream.on('progress', () => {
        // at some point we will log the progress to some other system and notify the client web app
        // console.log(formatBytes(e));
      });

      videoStream.on('end', () => {
        console.log(`${payload.uri} - download end`);
      });

      videoStream.on('error', (e) => {
        console.log(`YTDL error during downloading ${payload.uri}: `, e);
      });

      const trackFile = this.trackStorageService.createTrackFromUri(
        payload.uri,
      );

      await trackFile.saveYTDLToDisk(videoStream);

      console.log(`${payload.uri} - download saved to local disk`);

      return { status: TCPStatusCodes.Success };
    } catch (e) {
      console.log('YTDL is broken.', e);

      return { status: TCPStatusCodes.Failure };
    }
  }
}
