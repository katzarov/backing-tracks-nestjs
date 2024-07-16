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
import { DatabaseModule } from 'database/database.module'; // keep this above all other user modules
import { AcquireTracksModule } from './acquire-tracks/acquire-tracks.module';
import { UserModule } from './user/user.module';
import { TracksModule } from './tracks/tracks.module';
import { MetaModule } from './meta/meta.module';
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
    AcquireTracksModule,
    UserModule,
    TracksModule,
    MetaModule,
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
