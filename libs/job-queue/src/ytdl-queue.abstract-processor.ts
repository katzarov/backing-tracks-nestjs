import { Processor, WorkerHost } from '@nestjs/bullmq';
import { YtdlQueueConfig } from './ytdl-queue.config';
import { YtdlJob, YtDownloadReturnType } from './ytdl-queue.interface';

@Processor(YtdlQueueConfig.queueName, YtdlQueueConfig.worker)
export abstract class AbstractYtdlQueueProcessor extends WorkerHost {
  abstract process(job: YtdlJob, token?: string): Promise<YtDownloadReturnType>;
}
