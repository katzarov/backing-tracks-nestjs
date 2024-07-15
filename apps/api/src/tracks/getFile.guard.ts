import { Injectable, CanActivate, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GetFileGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate() {
    const isS3StorageEnabled = this.configService.get<boolean>(
      'storage.s3.isEnabled',
    );
    if (isS3StorageEnabled) {
      throw new NotFoundException();
    } else {
      return true;
    }
  }
}
