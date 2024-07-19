export enum TCPStatusCodes {
  Success = 0,
  Failure = 1,
}

export interface TCPMicroserviceResponse {
  status: TCPStatusCodes;
}
