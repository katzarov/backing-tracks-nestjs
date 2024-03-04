import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import configuration from 'config/configuration';
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
      load: [configuration],
    }),
    ClientsModule.register({
      clients: [
        {
          name: 'YOUTUBE_DOWNLOADER_SERVICE',
          transport: Transport.TCP,
          options: { port: 3001 }, // TODO get from config https://docs.nestjs.com/microservices/basics#client ClientProxyFactory, or just leave them like that and read from the config, prob I wont have different configs to load at runtime anyway. but can just read from process env
        },
        {
          name: 'FILE_CONVERTER_SERVICE',
          transport: Transport.TCP,
          options: { port: 3002 },
        },
      ],
      isGlobal: true,
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
