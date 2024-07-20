import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FileConverterService } from './file-converter.service';
import {
  FileConverterApi,
  IFileConverterApiConvertVideoToAudioPayload,
  IFileConverterApiGetAudioDurationInSecondsPayload,
} from '@app/shared/microservices';

@Controller()
export class FileConverterController {
  constructor(private readonly fileConverterService: FileConverterService) {}

  @MessagePattern({ cmd: FileConverterApi.convertVideoToAudio })
  convertFile(@Payload() payload: IFileConverterApiConvertVideoToAudioPayload) {
    return this.fileConverterService.convertFile(payload);
  }

  @MessagePattern({ cmd: FileConverterApi.getAudioDurationInSeconds })
  getAudioDurationInSeconds(
    @Payload() payload: IFileConverterApiGetAudioDurationInSecondsPayload,
  ) {
    return this.fileConverterService.getAudioDurationInSeconds(payload);
  }
}
