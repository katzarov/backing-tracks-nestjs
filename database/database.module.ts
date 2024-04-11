import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        database: configService.getOrThrow('database.name'),
        host: configService.getOrThrow('database.host'),
        port: configService.getOrThrow('database.port'),
        username: configService.getOrThrow('database.username'),
        password: configService.getOrThrow('database.password'),
        autoLoadEntities: true,
        retryAttempts: 99999999, // TODO: temp
        retryDelay: 10000,
        // dropSchema: true,
        synchronize: configService.getOrThrow('database.synchronize'), // scary.. in real world, maybe think of another way to keep this false on prod.
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
