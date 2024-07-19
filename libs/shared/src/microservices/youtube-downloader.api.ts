import { TCPMicroserviceResponse } from './tcp.status-codes';

export class YouTubeDownloaderApi {
  /**
   * Returns info about the youtube donwload
   */
  static getYouTubeVideoInfo = 'getYouTubeVideoInfo';
  /**
   * Initiates download
   */
  static downloadYouTubeVideo = 'downloadYouTubeVideo';
}

export interface IYouTubeDownloaderApiGetYouTubeVideoInfoPayload {
  youTubeVideoUrl: string;
}

export interface IYouTubeDownloaderApiGetYouTubeVideoInfoResponse
  extends TCPMicroserviceResponse {
  title: string;
  channel: string;
  length: string;
  thumbnailUrl: string;
}

export interface IYouTubeDownloaderApiDownloadYouTubeVideoPayload {
  youTubeVideoUrl: string;
  uri: string;
}

export interface IYouTubeDownloaderApiDownloadYouTubeVideoResponse
  extends TCPMicroserviceResponse {}
