import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { NotificationsService } from './notifications.service';
import { AuthenticatedUser } from '../auth/authenticated-user.decorator';

@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  // @Get()
  // TODO short or long polling.
  // api gw does not support streamed type responses, so it will have to be the above or WS.. api gw pricing will be the biggest factor

  @Get('sse')
  establishSSE(@AuthenticatedUser() userId: number, @Res() res: Response) {
    res.set({
      'Cache-Control':
        'private, no-cache, no-store, must-revalidate, max-age=0, no-transform',
      Connection: 'keep-alive',
      'Content-Type': 'text/event-stream',
    });

    // Flushing the headers will establish the connection, but no need since we are immediately sending the currnet state so there is some message sent on init connection.
    // res.flushHeaders();

    this.notificationsService.establishSSE(userId, res);
  }
}
