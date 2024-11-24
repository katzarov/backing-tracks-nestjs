import { ConfigurableModuleBuilder } from '@nestjs/common';
import { YtDlpOptions } from './yt-dlp.options.interface';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<YtDlpOptions>().build();
