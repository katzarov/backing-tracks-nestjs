import { BaseEntity } from 'apps/api-gateway/src/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { Track } from '../tracks/track.entity';

@Entity()
export class User extends BaseEntity<User> {
  @Column()
  auth0Id: string;

  @OneToMany(() => Track, (track) => track.user)
  tracks: Track[];
}
