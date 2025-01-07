import {
  QueueEventsHost,
  QueueEventsListener,
  OnQueueEvent,
} from '@nestjs/bullmq';
import type { QueueEventsListener as QueueEventsListenerType } from 'bullmq';
import { EventsService, JobQueueEvents } from '@app/shared/events';
import { YtdlQueueConfig } from '@app/job-queue/ytdl-queue.config';
import { YtdlProgressEvent } from './ytdl-queue.interface';
import { YtdlQueueService } from './ytdl-queue.service';

// https://api.docs.bullmq.io/interfaces/v5.QueueEventsListener.html
interface QueueEventsListenerMethods {
  onProgress: QueueEventsListenerType['progress'];
  onAdded: QueueEventsListenerType['added'];
  onCompleted: QueueEventsListenerType['completed'];
  // type ProgressParams = Parameters<QueueEventsListenerType['progress']>;
}

@QueueEventsListener(YtdlQueueConfig.queueName)
export class YtdlQueueEventsListener
  extends QueueEventsHost
  implements QueueEventsListenerMethods
{
  constructor(
    private readonly eventsService: EventsService,
    private ytdlQueueService: YtdlQueueService,
  ) {
    super();
  }

  // TODO
  // - added, waiting, active, progress, completed, cleaned, failed, stalled
  // For all of the above events & possibly more, I could send all individual/partial updates to the client.. and try and reconstruct the server state based on the events.
  // But for now, I will only send individual updates for the progress event and for the rest of events I will just sync all the state => as in, just send all the current server state to the client so it can be swapped there and not calculated.

  @OnQueueEvent('added')
  async onAdded({ jobId }) {
    const job = await this.ytdlQueueService.getJobById(jobId);

    this.eventsService.emit(JobQueueEvents.ytdlAny, job);
  }

  @OnQueueEvent('progress')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async onProgress({ jobId }: YtdlProgressEvent, timestamp: string) {
    const job = await this.ytdlQueueService.getJobById(jobId);

    this.eventsService.emit(JobQueueEvents.ytdlProgress, job);
  }

  // note: if multiple instances of app - need to make sure we only add the db entry once! Or/And if possible - consume this event exactly once.
  @OnQueueEvent('completed')
  async onCompleted({ jobId }) {
    const job = await this.ytdlQueueService.getJobById(jobId);

    this.eventsService.emit(JobQueueEvents.ytdlCompleted, job);
  }
}
