import { ConfigurableModuleBuilder } from '@nestjs/common';
import { TrackStorageOptions } from './track-storage-options.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<TrackStorageOptions>().build();
