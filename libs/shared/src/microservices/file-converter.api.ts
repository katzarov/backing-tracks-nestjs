import { TCPMicroserviceResponse } from './tcp.status-codes';

export class FileConverterApi {
  /**
   * Return the duration of an mp3 in ms.
   */
  static getAudioDurationInSeconds = 'getAudioDurationInSeconds';
}

export interface IFileConverterApiGetAudioDurationInSecondsPayload {
  uri: string;
}

export interface IFileConverterApiGetAudioDurationInSecondsResponse
  extends TCPMicroserviceResponse {
  duration?: number | null;
}
