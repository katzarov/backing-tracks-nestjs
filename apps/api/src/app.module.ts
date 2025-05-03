import { Module, ValidationPipe } from '@nestjs/common';
import { ZodSerializerInterceptor, ZodValidationPipe } from 'nestjs-zod';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { HttpExceptionFilter } from './http-exception.filter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import {
  apiConfig,
  databaseConfig,
  ytdlConfig,
  storageConfig,
  redisConfig,
  loggerConfig,
} from 'config';
import { DatabaseModule } from '@app/database'; // keep this above all other user modules
import { UserRepositoryModule } from '@app/database/modules'; // needed for the global auth guard, which uses the userRepository
import { AcquireTracksModule } from './acquire-tracks/acquire-tracks.module';
import { TracksModule } from './tracks/tracks.module';
import { AuthGuard } from './auth/auth.guard';
import { PlaylistsModule } from './playlists/playlists.module';
import { NotificationsModule } from './notifications/notifications.module';
import { EventsModule } from '@app/shared/events';
import { YtdlQueueEventsListenerModule } from '@app/job-queue/ytdl-queue.events-listener.module';
import { CustomLoggerModule } from '@app/shared/logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        apiConfig,
        redisConfig,
        databaseConfig,
        ytdlConfig,
        storageConfig,
        loggerConfig,
      ],
      envFilePath: ['.env.nest', '.env.secret'], // TODO separate secrets for api and ytdl
    }),
    CustomLoggerModule,
    EventsModule,
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const host = configService.getOrThrow<string>('redis.host');
        const port = configService.getOrThrow<number>('redis.port');

        return {
          connection: { host, port, connectionName: 'api' },
        };
      },
      inject: [ConfigService],
    }),
    YtdlQueueEventsListenerModule,
    DatabaseModule,
    UserRepositoryModule, // needed for the global auth guard, which uses the userRepository
    AcquireTracksModule,
    TracksModule,
    PlaylistsModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [
    {
      // TODO: Put in a separate module & import the UserRepositoryModule there
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    // TODO-zod: remove ValidationPipe once we fully replace class-transform/validation. https://github.com/nestjs/nest/issues/812
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
