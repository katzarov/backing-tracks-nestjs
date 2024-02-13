import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AcquireTracksModule } from './acquire-tracks/acquire-tracks.module';
import configuration from 'config/configuration';

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
    AcquireTracksModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
