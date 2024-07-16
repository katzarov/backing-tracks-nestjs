import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { databaseConfig } from 'config';
import { User } from 'apps/api/src/user/user.entity';
import { Track } from 'apps/api/src/tracks/track.entity';

// TODO: have not used/tested this config yet EDIT: => this probably doesnt work as expected.

config({ path: ['./.env.nest'] });
const configService = new ConfigService(databaseConfig);

export default new DataSource({
  type: 'postgres',
  database: configService.getOrThrow('POSTGRES_DB'),
  host: configService.getOrThrow('POSTGRES_HOST'),
  port: configService.getOrThrow('POSTGRES_PORT'),
  username: configService.getOrThrow('POSTGRES_USER'),
  password: configService.getOrThrow('POSTGRES_PASSWORD'),
  migrations: ['database/migrations/**'],
  entities: [User, Track],
});
