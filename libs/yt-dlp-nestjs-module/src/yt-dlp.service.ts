import { Inject, Injectable } from '@nestjs/common';
import { YtDlpOptions } from './yt-dlp.options.interface';
import { MODULE_OPTIONS_TOKEN } from './yt-dlp.module-definition';
import { YtDlp } from '@app/yt-dlp';

@Injectable()
export class YtDlpService {
  constructor(@Inject(MODULE_OPTIONS_TOKEN) private options: YtDlpOptions) {}

  YtDlp(url: string) {
    return new YtDlp(url, this.options);
  }
}
