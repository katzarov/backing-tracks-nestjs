import { ConfigService } from '@nestjs/config';
import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import configuration from 'config/configuration';
import { User } from 'apps/api/src/user/user.entity';
import { Track } from 'apps/api/src/tracks/track.entity';

// TODO: have not used/tested this config yet EDIT: => this probably doesnt work as expected.

config();
const configService = new ConfigService(configuration);

export default new DataSource({
  type: 'postgres',
  database: configService.getOrThrow('POSTGRES_DB_NAME'),
  host: configService.getOrThrow('POSTGRES_HOST'),
  port: configService.getOrThrow('POSTGRES_PORT'),
  username: configService.getOrThrow('POSTGRES_USER'),
  password: configService.getOrThrow('POSTGRES_PASSWORD'),
  migrations: ['database/migrations/**'],
  entities: [User, Track],
});
