import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import {
  apiConfig,
  databaseConfig,
  ytdlConfig,
  storageConfig,
  redisConfig,
} from 'config';
import { DatabaseModule } from '@app/database'; // keep this above all other user modules
import { UserRepositoryModule } from '@app/database/modules'; // needed for the global auth guard, which uses the userRepository
import { AcquireTracksModule } from './acquire-tracks/acquire-tracks.module';
import { TracksModule } from './tracks/tracks.module';
import { AuthGuard } from './auth/auth.guard';
import { PlaylistsModule } from './playlists/playlists.module';
import { EventsModule } from '@app/shared/events';
import { YtdlQueueEventsListenerModule } from '@app/job-queue/ytdl-queue.events-listener.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [apiConfig, redisConfig, databaseConfig, ytdlConfig, storageConfig],
      envFilePath: ['.env.nest', '.env.secret'],
    }),
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
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
