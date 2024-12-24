import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'node:events';

@Injectable()
export class EventsService extends EventEmitter {
  private readonly prefixes = {
    userEvents: 'user-event/',
  };

  private getUserEventName(userId: number) {
    return this.prefixes.userEvents.concat(userId.toString(10));
  }

  emitUserEvent(userId: number, payload: unknown) {
    const eventName = this.getUserEventName(userId);
    this.emit(eventName, payload);
  }
}
