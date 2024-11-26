import { ClientProxy } from '@nestjs/microservices';
import type { TrackFile } from '@app/track-storage';
import {
  YouTubeDownloaderApi,
  FileConverterApi,
  IYouTubeDownloaderApiGetYouTubeVideoInfoResponse,
  IYouTubeDownloaderApiGetYouTubeVideoInfoPayload,
  IYouTubeDownloaderApiDownloadYouTubeVideoPayload,
  IYouTubeDownloaderApiDownloadYouTubeVideoResponse,
  IFileConverterApiGetAudioDurationInSecondsPayload,
  IFileConverterApiGetAudioDurationInSecondsResponse,
  TCPStatusCodes,
} from '@app/shared/microservices';
import { lastValueFrom } from 'rxjs';
import {
  BadGatewayException,
  InternalServerErrorException,
} from '@nestjs/common';

/**
 * Encapsulates communication with the youtube microservice. (Converts microservice observable responses to promises).
 *
 */
// NOTE: send() method returns a "cold observable", which means that you have to explicitly subscribe to it before the message will be sent.
// NOTE: lastValueFrom() subscribes & converts the observables to promises. And it will return a rejected promise if the observable doesn't emit any values.
export class AcquireTracksMicroServicesClient {
  constructor(private youtubeService: ClientProxy) {}

  /**
   * Gets info for youtube video.
   *
   * @param {string} url - youtube video url
   * @returns {IYouTubeDownloaderApiGetYouTubeVideoInfoResponse} - status code & video info
   *
   * @throws {InternalServerErrorException} when ytdl lib is broken
   * @throws {BadGatewayException} when communication with ytdl ms can't be established
   */
  protected async getVideoInfo(url: string) {
    const pattern = { cmd: YouTubeDownloaderApi.getYouTubeVideoInfo };
    const payload: IYouTubeDownloaderApiGetYouTubeVideoInfoPayload = {
      youTubeVideoUrl: url,
    };
    const observable =
      this.youtubeService.send<IYouTubeDownloaderApiGetYouTubeVideoInfoResponse>(
        pattern,
        payload,
      );

    let error: InternalServerErrorException;
    try {
      const result = await lastValueFrom(observable);

      if (result.status === TCPStatusCodes.Failure) {
        error = new InternalServerErrorException('Youtube service is broken.');
        throw error;
      }

      return result;
    } catch (e) {
      if (e === error) {
        console.log('Error: YTDL lib may have stopped working.');
        throw e;
      }
      console.log('Error: YTDL microservice communication error:', e);
      throw new BadGatewayException('Youtube service is down.');
    }
  }

  /**
   * Downloads a youtube video, converts it to mp3, and saves it to local disk.
   *
   * @param {string} url - youtube video url
   * @param {TrackFile} trackFile - track file obj
   * @returns {IYouTubeDownloaderApiDownloadYouTubeVideoResponse} - status code
   *
   * @throws {InternalServerErrorException} when ytdl lib is broken
   * @throws {BadGatewayException} when communication with ytdl ms can't be established
   */
  protected async download(url: string, trackFile: TrackFile) {
    const pattern = { cmd: YouTubeDownloaderApi.downloadYouTubeVideo };
    const payload: IYouTubeDownloaderApiDownloadYouTubeVideoPayload = {
      youTubeVideoUrl: url,
      uri: trackFile.uri,
    };

    const observable =
      this.youtubeService.send<IYouTubeDownloaderApiDownloadYouTubeVideoResponse>(
        pattern,
        payload,
      );

    let error: InternalServerErrorException;
    try {
      const result = await lastValueFrom(observable);

      if (result.status === TCPStatusCodes.Failure) {
        error = new InternalServerErrorException('Youtube service is broken.');
        throw error;
      }

      return result;
    } catch (e) {
      if (e === error) {
        console.log('Error: YTDL lib may have stopped working.');
        throw e;
      }
      console.log('Error: YTDL microservice communication error:', e);
      throw new BadGatewayException('Youtube service is down.');
    }
  }

  // todo document
  protected async getAudioDurationInSeconds(trackFile: TrackFile) {
    const pattern = { cmd: FileConverterApi.getAudioDurationInSeconds };
    const payload: IFileConverterApiGetAudioDurationInSecondsPayload = {
      uri: trackFile.uri,
    };
    const observable =
      this.youtubeService.send<IFileConverterApiGetAudioDurationInSecondsResponse>(
        pattern,
        payload,
      );
    // todo try catch
    return await lastValueFrom(observable);
  }
}
