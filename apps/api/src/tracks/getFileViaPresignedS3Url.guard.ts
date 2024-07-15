import { Injectable, CanActivate, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GetFileViaPresignedS3UrlGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate() {
    const isS3StorageEnabled = this.configService.get<boolean>(
      'storage.s3.isEnabled',
    );
    if (isS3StorageEnabled) {
      return true;
    } else {
      throw new NotFoundException();
    }
  }
}
