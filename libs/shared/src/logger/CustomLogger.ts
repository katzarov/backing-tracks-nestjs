import { inspect } from 'node:util';
import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// make sure we don't override some (future) base class.
const formatObjectSymbol = Symbol('formatObject');

enum slackMessageType {
  general = 'general',
  error = 'error',
}

@Injectable()
export class CustomLogger extends ConsoleLogger {
  private slackLoggingEnabled: boolean;
  private slackGeneralChannelUrl: string | undefined;
  private slackErrorChannelUrl: string | undefined;

  // When logs are buffered, timestamp during boot seems not correct ?
  constructor(context: string, configService: ConfigService) {
    const logLevels = configService.getOrThrow<LogLevel[]>('logger.logLevels');
    super(context, { timestamp: false, logLevels });

    this.slackLoggingEnabled = configService.getOrThrow<boolean>(
      'logger.slack.enabled',
    );

    if (this.slackLoggingEnabled) {
      this.slackGeneralChannelUrl = configService.getOrThrow<string>(
        'logger.slack.generalChannelUrl',
      );
      this.slackErrorChannelUrl = configService.getOrThrow<string>(
        'logger.slack.errorChannelUrl',
      );
    }
  }

  private [formatObjectSymbol](message: unknown) {
    return typeof message === 'object'
      ? inspect(message, { showHidden: false, depth: 2 })
      : message;
  }

  private async sendSlackMessage(message: unknown, type: slackMessageType) {
    try {
      let url: string;

      switch (type) {
        case slackMessageType.error:
          url = this.slackErrorChannelUrl;
          break;

        default:
          url = this.slackGeneralChannelUrl;
      }

      await fetch(url, {
        method: 'POST',
        body: JSON.stringify({ text: message }),
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      super.error('Could not send slack message', e);
    }
  }

  log() {
    // @ts-expect-error: A spread argument must either have a tuple type or be passed to a rest parameter.
    // eslint-disable-next-line prefer-rest-params
    super.log(...arguments);
  }

  error(message: unknown, ...restArgs: unknown[]) {
    const formattedMessage = this[formatObjectSymbol](message);
    super.error(formattedMessage, ...restArgs);

    if (this.slackLoggingEnabled) {
      this.sendSlackMessage(formattedMessage, slackMessageType.error);
    }
  }

  warn(message: unknown, ...restArgs: unknown[]) {
    const formattedMessage = this[formatObjectSymbol](message);
    super.warn(formattedMessage, ...restArgs);

    if (this.slackLoggingEnabled) {
      this.sendSlackMessage(formattedMessage, slackMessageType.general);
    }
  }

  debug(message: unknown, ...restArgs: unknown[]) {
    const formattedMessage = this[formatObjectSymbol](message);
    super.debug(formattedMessage, ...restArgs);
  }

  // verbose()
  // fatal()
}
