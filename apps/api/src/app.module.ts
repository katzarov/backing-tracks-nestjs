import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import {
  apiConfig,
  databaseConfig,
  youtubeDownloaderConfig,
  fileConverterConfig,
  storageConfig,
} from 'config';
import { DatabaseModule } from '@app/database'; // keep this above all other user modules
import { UserRepositoryModule } from '@app/database/modules'; // needed for the global auth guard, which uses the userRepository
import { AcquireTracksModule } from './acquire-tracks/acquire-tracks.module';
import { TracksModule } from './tracks/tracks.module';
import { AuthGuard } from './auth/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [
        apiConfig,
        databaseConfig,
        youtubeDownloaderConfig,
        fileConverterConfig,
        storageConfig,
      ],
      envFilePath: ['.env.nest', '.env.secret'],
    }),
    DatabaseModule,
    UserRepositoryModule, // needed for the global auth guard, which uses the userRepository
    AcquireTracksModule,
    TracksModule,
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
