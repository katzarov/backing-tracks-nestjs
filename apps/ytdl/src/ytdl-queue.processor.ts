import { AbstractYtdlQueueProcessor } from '@app/job-queue';
import { YtdlJobProgress, YtdlJob } from '@app/job-queue/ytdl-queue.interface';
import { YtDlpService } from '@app/yt-dlp-nestjs-module';
import { Injectable } from '@nestjs/common';
import { FfmpegService } from './ffmpeg.service';
import type { IYtDlpProgress } from '@app/yt-dlp';

import { Logger } from '@nestjs/common';

@Injectable()
export class YtdlQueueProcessor extends AbstractYtdlQueueProcessor {
  private readonly logger = new Logger(YtdlQueueProcessor.name);

  constructor(
    private ytDlpService: YtDlpService,
    private ffmpegService: FfmpegService,
  ) {
    super();
  }

  async process(job: YtdlJob) {
    const { ytUrl, trackUri } = job.data;
    try {
      const ytdlp = this.ytDlpService.YtDlp(ytUrl);

      const onProgressCb = async (data: IYtDlpProgress) => {
        await job.updateProgress({
          percent: data.percent_str,
          eta: data.eta,
        } satisfies YtdlJobProgress);

        this.logger.debug({
          userId: job.data.userId,
          percent: data.percent_str,
        });
      };

      await ytdlp.download(trackUri, onProgressCb);

      const result = await this.ffmpegService.getAudioDurationInSeconds({
        uri: trackUri,
      });

      return { success: true, ffProbeTrackDuration: result.duration };
    } catch (error) {
      this.logger.error({
        userId: job.data.userId,
        error,
      });
      return { success: false, ffProbeTrackDuration: null };
    }
  }
}
