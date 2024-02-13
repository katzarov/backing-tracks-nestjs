import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FileConverterService } from './file-converter.service';

@Controller()
export class FileConverterController {
  constructor(private readonly fileConverterService: FileConverterService) {}

  @MessagePattern({ cmd: 'convertFile' })
  async convertFile(@Payload('name') name: string) {
    return await this.fileConverterService.convertFile(name);
  }
}
