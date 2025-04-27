import { YtdlJobFormatted } from '@app/job-queue/ytdl-queue.interface';
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { EventEmitter } from 'node:events';

export enum JobQueueEvents {
  ytdlAny = 'ytdl-any',
  ytdlProgress = 'ytdl-progress',
  ytdlCompleted = 'ytdl-completed',
}

export enum AppEvents {
  ytDownloadSavedInDatabase = 'yt-download-saved-in-database',
}

interface TEvents extends Record<string, any> {
  [JobQueueEvents.ytdlAny]: [YtdlJobFormatted];
  [JobQueueEvents.ytdlProgress]: [YtdlJobFormatted];
  [JobQueueEvents.ytdlCompleted]: [YtdlJobFormatted];
  [AppEvents.ytDownloadSavedInDatabase]: [YtdlJobFormatted];
}

// any more complex than our current use case and we might want to just do @nestjs/event-emitter
// https://docs.nestjs.com/techniques/events

/**
 * Provides the node event emitter with typed methods through class composition.
 */
@Injectable()
export class EventsService implements OnApplicationShutdown {
  private readonly emitter = new EventEmitter();

  // or onModuleDestroy ?
  onApplicationShutdown() {
    this.emitter.removeAllListeners();
  }

  emit<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    ...eventArg: TEvents[TEventName]
  ) {
    this.emitter.emit(eventName, ...(eventArg as []));
  }

  // TODO global error catcher wrapping the handler in case consumer misses to catch them !
  addListener<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void,
  ) {
    this.emitter.addListener(eventName, handler as any);
  }

  removeListener<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    handler: (...eventArg: TEvents[TEventName]) => void,
  ) {
    this.emitter.removeListener(eventName, handler as any);
  }
}
