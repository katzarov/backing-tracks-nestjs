import {
  Injectable,
  MessageEvent,
  OnApplicationBootstrap,
  Scope,
} from '@nestjs/common';
import { Response } from 'express';
import { AppEvents, EventsService, JobQueueEvents } from '@app/shared/events';
import { YtdlQueueService } from '@app/job-queue';
import { NotificationsUsersManager } from './notifications.users-manager';
import { YtdlJobFormatted } from '@app/job-queue/ytdl-queue.interface';

enum sseMessageType {
  ytdlSync = 'ytdl-sync', // sync the current ytdl job queue state with client
  ytdlSyncInvalidateDB = 'ytdl-sync-invalidate-db', // same as ytdlSync, but also instructs client to refresh its cached db responses.
  ytdlUpdate = 'ytdl-update', // give updates for individual items of the ytdl queue state
}

// TODO strip userId from data before send to client!!!
// use the full obj here, and format it just for client

@Injectable({ scope: Scope.DEFAULT })
// default = singleton, explicitly calling it here since this is the only scope that should ever be used for this provider!
export class NotificationsService
  extends NotificationsUsersManager
  implements OnApplicationBootstrap
{
  constructor(
    private eventsService: EventsService,
    private ytdlQueueService: YtdlQueueService,
  ) {
    super();
  }

  onApplicationBootstrap() {
    this.eventsService.addListener(
      JobQueueEvents.ytdlAny,
      this.sendYtdlSyncMessageToUser.bind(this, sseMessageType.ytdlSync),
    );
    this.eventsService.addListener(
      JobQueueEvents.ytdlCompleted,
      this.sendYtdlSyncMessageToUser.bind(this, sseMessageType.ytdlSync),
    );
    this.eventsService.addListener(
      JobQueueEvents.ytdlProgress,
      this.sendYtdlUpdateMessageToUser.bind(this),
    );
    this.eventsService.addListener(
      AppEvents.ytDownloadSavedInDatabase,
      this.sendYtdlSyncMessageToUser.bind(
        this,
        sseMessageType.ytdlSyncInvalidateDB,
      ),
    );
  }

  establishSSE(userId: number, res: Response) {
    if (res.destroyed) {
      // When stream is already destroyed, then 'close' cb ofc will not run and thus we will start accumulating res objs.
      // Happened when spamming CMD + R on browser client. Perhaps it opens up sockets which are almost immediately destroyed before even setting the 'close' cb.
      return;
    }

    this.addNewClient(userId, res);

    this.setClientSocketCloseCb(userId, res);

    // upon establishing the connection we want to just send the current state
    this.sendYtdlSyncMessageToUser(sseMessageType.ytdlSync, {
      data: { userId },
    });
  }

  private formatMessage(msg: Partial<MessageEvent>) {
    // https://html.spec.whatwg.org/multipage/server-sent-events.html#server-sent-events
    // https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events#fields
    if (msg.type) return `event: ${msg.type}\n`;
    if (msg.id) return `id: ${msg.id}\n`;
    if (msg.retry) return `retry: ${msg.retry}\n`;

    return `data: ${JSON.stringify(msg.data)}\n\n`;
  }

  private async sendYtdlSyncMessageToUser(
    sseMessageType:
      | sseMessageType.ytdlSync
      | sseMessageType.ytdlSyncInvalidateDB,
    e: { data: { userId: number } } | YtdlJobFormatted,
  ) {
    const { userId } = e.data;

    if (!this.isUserConnected(userId)) {
      return;
    }

    // TODO handle errors here and in general for the whole new queue mq service

    const ytdlJobsOfUser = await this.ytdlQueueService.getAllJobsOfUser(userId);

    const notificationsState = {
      state: {
        ytdl: ytdlJobsOfUser,
      },
    };

    const message = this.formatMessage({
      type: sseMessageType,
    }).concat(
      this.formatMessage({
        data: notificationsState,
      }),
    );

    this.sendMessageToClientsOfUser(userId, message);
  }

  private async sendYtdlUpdateMessageToUser(e: YtdlJobFormatted) {
    const { userId } = e.data;

    if (!this.isUserConnected(userId)) {
      return;
    }

    const jobUpdateState = {
      state: {
        ytdl: e,
      },
    };

    const message = this.formatMessage({
      type: sseMessageType.ytdlUpdate,
    }).concat(
      this.formatMessage({
        data: jobUpdateState,
      }),
    );

    this.sendMessageToClientsOfUser(userId, message);
  }
}
