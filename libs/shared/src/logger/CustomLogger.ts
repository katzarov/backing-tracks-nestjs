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
  protected slackLoggingEnabled: boolean;
  protected slackGeneralChannelUrl: string | undefined;
  protected slackErrorChannelUrl: string | undefined;

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

  private assertSlackIsConfigured(): asserts this is CustomLogger & {
    slackLoggingEnabled: true;
    slackGeneralChannelUrl: string;
    slackErrorChannelUrl: string;
  } {
    if (!this.slackLoggingEnabled) {
      throw new Error('Slack logging is not enabled.');
    }
    if (!this.slackGeneralChannelUrl || !this.slackErrorChannelUrl) {
      throw new Error(
        'Slack channel URLs must be provided when slackLoggingEnabled is true.',
      );
    }
  }

  private [formatObjectSymbol](message: unknown) {
    return typeof message === 'object'
      ? inspect(message, { showHidden: false, depth: 2 })
      : message;
  }

  // TODO lets make it more prod-like by using sentry or something similar.
  private async sendSlackMessage(message: unknown, type: slackMessageType) {
    try {
      this.assertSlackIsConfigured();

      let url: string | undefined;

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
