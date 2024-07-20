import { TCPMicroserviceResponse } from './tcp.status-codes';

export class FileConverterApi {
  /**
   * Converts an mp4 file to mp3 using lame
   */
  static convertVideoToAudio = 'convertVideoToAudio';
  /**
   * Return the duration of an mp3 in ms.
   */
  static getAudioDurationInSeconds = 'getAudioDurationInSeconds';
}

export interface IFileConverterApiConvertVideoToAudioPayload {
  uri: string;
}

export interface IFileConverterApiConvertVideoToAudioResponse
  extends TCPMicroserviceResponse {}

export interface IFileConverterApiGetAudioDurationInSecondsPayload {
  uri: string;
}

export interface IFileConverterApiGetAudioDurationInSecondsResponse
  extends TCPMicroserviceResponse {
  duration?: number | null;
}
