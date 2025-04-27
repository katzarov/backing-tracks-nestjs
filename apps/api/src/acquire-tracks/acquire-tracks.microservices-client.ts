import { ClientProxy } from '@nestjs/microservices';
import type { TrackFile } from '@app/track-storage';
import {
  YtdlApi,
  IYtdlApiGetYouTubeVideoInfoResponse,
  IYtdlApiGetYouTubeVideoInfoPayload,
  IYtdlApiGetAudioDurationInSecondsPayload,
  IYtdlApiGetAudioDurationInSecondsResponse,
  TCPStatusCodes,
} from '@app/shared/microservices';
import { lastValueFrom } from 'rxjs';
import {
  BadGatewayException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

/**
 * Encapsulates communication with the ytdl microservice. (Converts microservice observable responses to promises).
 *
 */
// NOTE: send() method returns a "cold observable", which means that you have to explicitly subscribe to it before the message will be sent.
// NOTE: lastValueFrom() subscribes & converts the observables to promises. And it will return a rejected promise if the observable doesn't emit any values.
export class AcquireTracksMicroServicesClient {
  private readonly logger = new Logger(AcquireTracksMicroServicesClient.name);

  constructor(private ytdlService: ClientProxy) {}

  /**
   * Gets info for youtube video.
   *
   * @param {string} url - youtube video url
   * @returns {IYtdlApiGetYouTubeVideoInfoResponse} - status code & video info
   *
   * @throws {InternalServerErrorException} when ytdl lib is broken
   * @throws {BadGatewayException} when communication with ytdl ms can't be established
   */
  protected async getVideoInfo(url: string) {
    const pattern = { cmd: YtdlApi.getYouTubeVideoInfo };
    const payload: IYtdlApiGetYouTubeVideoInfoPayload = {
      youTubeVideoUrl: url,
    };
    const observable =
      this.ytdlService.send<IYtdlApiGetYouTubeVideoInfoResponse>(
        pattern,
        payload,
      );

    try {
      const result = await lastValueFrom(observable);

      if (result.status === TCPStatusCodes.Failure) {
        throw new InternalServerErrorException('Youtube service is broken.');
      }

      return result;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        this.logger.error('YTDL microservice broken:', error);
        throw error;
      }

      this.logger.error('YTDL microservice communication error:', error);
      throw new BadGatewayException('Youtube service is down.');
    }
  }

  /**
   * Gets duration of audio file in seconds.
   *
   * @param {TrackFile} trackFile - track file obj
   * @returns {IYtdlApiGetAudioDurationInSecondsResponse} - status code & duration
   *
   * @throws {InternalServerErrorException} when internal ms / ffmpeg  error
   * @throws {BadGatewayException} when communication with ytdl ms can't be established
   */
  protected async getAudioDurationInSeconds(trackFile: TrackFile) {
    const pattern = { cmd: YtdlApi.getAudioDurationInSeconds };
    const payload: IYtdlApiGetAudioDurationInSecondsPayload = {
      uri: trackFile.uri,
    };
    const observable =
      this.ytdlService.send<IYtdlApiGetAudioDurationInSecondsResponse>(
        pattern,
        payload,
      );

    try {
      const result = await lastValueFrom(observable);

      if (result.status === TCPStatusCodes.Failure) {
        throw new InternalServerErrorException('Ffmpeg service is broken.');
      }

      return result;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        this.logger.error('YTDL microservice broken:', error);
        throw error;
      }

      this.logger.error('YTDL microservice communication error:', error);
      throw new BadGatewayException('Ffmpeg service is down.');
    }
  }
}
