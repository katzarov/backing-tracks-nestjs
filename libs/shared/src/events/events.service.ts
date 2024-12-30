import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { EventEmitter } from 'node:events';

type UserEvents = 'sync' | 'progress';
type GlobalEvents = 'ytDownloadCompleted';

@Injectable()
export class EventsService
  extends EventEmitter
  implements OnApplicationShutdown
{
  private readonly prefixes = {
    userEvents: 'user-event/',
    globalEvents: 'global-event/',
  };

  onApplicationShutdown() {
    this.removeAllListeners();
  }

  private getUserEventName(userId: number, type: UserEvents) {
    return this.prefixes.userEvents.concat(userId.toString(10)).concat(type);
  }

  emitUserEvent(userId: number, type: UserEvents, payload?: unknown) {
    const eventName = this.getUserEventName(userId, type);
    this.emit(eventName, payload);
  }

  emitGlobalEvent(type: GlobalEvents, payload?: unknown) {
    const eventName = this.prefixes.globalEvents.concat(type);
    this.emit(eventName, payload);
  }

  listenToGlobalEvents(type: GlobalEvents, cb: (e: unknown) => void) {
    const eventName = this.prefixes.globalEvents.concat(type);
    this.addListener(eventName, cb);
  }
}
