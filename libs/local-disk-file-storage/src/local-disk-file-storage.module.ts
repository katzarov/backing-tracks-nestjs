import { Module } from '@nestjs/common';
import { LocalDiskFileStorageService } from './local-disk-file-storage.service';

@Module({
  providers: [LocalDiskFileStorageService],
  exports: [LocalDiskFileStorageService],
})
export class LocalDiskFileStorageModule {}
