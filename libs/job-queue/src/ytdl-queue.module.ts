import { Module } from '@nestjs/common';
import { YtdlQueueService } from './ytdl-queue.service';
import { BullModule } from '@nestjs/bullmq';
import { YtdlQueueConfig } from './ytdl-queue.config';

@Module({
  imports: [
    BullModule.registerQueue({
      name: YtdlQueueConfig.queueName,
    }),
  ],
  providers: [YtdlQueueService],
  exports: [YtdlQueueService],
})
export class YtdlQueueModule {}
