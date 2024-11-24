import { Module } from '@nestjs/common';
import { YtDlpService } from './yt-dlp.service';
import { ConfigurableModuleClass } from './yt-dlp.module-definition';

@Module({
  providers: [YtDlpService],
  exports: [YtDlpService],
})
export class YtDlpModule extends ConfigurableModuleClass {}
