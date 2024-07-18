import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User, Track, TrackMeta, Artist } from './entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        applicationName: 'NestJS HTTP API',
        type: 'postgres',
        database: configService.getOrThrow('database.name'),
        host: configService.getOrThrow('database.host'),
        port: configService.getOrThrow('database.port'),
        username: configService.getOrThrow('database.username'),
        password: configService.getOrThrow('database.password'),
        autoLoadEntities: false,
        entities: [User, Track, TrackMeta, Artist],
        retryAttempts: 36,
        retryDelay: 5000,
        dropSchema: false,
        synchronize: configService.getOrThrow('database.synchronize'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
