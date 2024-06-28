import { Module } from '@nestjs/common';
import { TrackStorageService } from './track-storage.service';
import { ConfigurableModuleClass } from './track-storage.module-definition';

@Module({
  providers: [TrackStorageService],
  exports: [TrackStorageService],
})
export class TrackStorageModule extends ConfigurableModuleClass {}
