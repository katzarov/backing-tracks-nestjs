import { Module } from '@nestjs/common';
import { YtdlQueueEventsListener } from './ytdl-queue.events-listener';
import { BullModule } from '@nestjs/bullmq';
import { YtdlQueueConfig } from './ytdl-queue.config';
import { YtdlQueueService } from './ytdl-queue.service';

/**
 * Dispatches events on the global EventsService instance.
 */
@Module({
  imports: [
    BullModule.registerQueue({
      name: YtdlQueueConfig.queueName,
    }),
  ],
  providers: [YtdlQueueEventsListener, YtdlQueueService],
})
export class YtdlQueueEventsListenerModule {}
