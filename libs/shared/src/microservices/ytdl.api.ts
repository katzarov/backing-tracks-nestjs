import { TCPMicroserviceResponse } from './tcp.status-codes';

export class YtdlApi {
  /**
   * Returns info about the youtube donwload
   */
  static getYouTubeVideoInfo = 'getYouTubeVideoInfo';

  /**
   * Initiates download
   */
  static downloadYouTubeVideo = 'downloadYouTubeVideo';

  /**
   * Return the duration of an mp3 in seconds.
   */
  static getAudioDurationInSeconds = 'getAudioDurationInSeconds';
}

export interface IYtdlApiGetYouTubeVideoInfoPayload {
  youTubeVideoUrl: string;
}

export interface IYtdlApiGetYouTubeVideoInfoResponse
  extends TCPMicroserviceResponse {
  title?: string;
  channel?: string;
  length?: string;
  thumbnailUrl?: string;
}

export interface IYtdlApiDownloadYouTubeVideoPayload {
  youTubeVideoUrl: string;
  uri: string;
}

export interface IYtdlApiDownloadYouTubeVideoResponse
  extends TCPMicroserviceResponse {}

export interface IYtdlApiGetAudioDurationInSecondsPayload {
  uri: string;
}

export interface IYtdlApiGetAudioDurationInSecondsResponse
  extends TCPMicroserviceResponse {
  duration?: number | null;
}
