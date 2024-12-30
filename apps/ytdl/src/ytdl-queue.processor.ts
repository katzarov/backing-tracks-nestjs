import { AbstractYtdlQueueProcessor } from '@app/job-queue';
import { YtdlJobProgress, YtdlJob } from '@app/job-queue/ytdl-queue.interface';
import { YtDlpService } from '@app/yt-dlp-nestjs-module';
import { Injectable } from '@nestjs/common';
import { FfmpegService } from './ffmpeg.service';
import { ProgressDataDto } from '@app/yt-dlp';

@Injectable()
export class YtdlQueueProcessor extends AbstractYtdlQueueProcessor {
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

      const onProgressCb = async (data: ProgressDataDto) => {
        await job.updateProgress({
          percent: data.percent_str,
          eta: data.eta,
        } satisfies YtdlJobProgress);
      };

      await ytdlp.download(trackUri, onProgressCb);

      const result = await this.ffmpegService.getAudioDurationInSeconds({
        uri: trackUri,
      });

      return { success: true, ffProbeTrackDuration: result.duration };
    } catch (e) {
      return { success: false, ffProbeTrackDuration: null };
    }
  }
}
