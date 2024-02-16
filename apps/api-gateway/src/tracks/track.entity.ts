import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from 'apps/api-gateway/src/base.entity';
import { User } from '../user/user.entity';

@Entity()
export class Track extends BaseEntity<Track> {
  @Column('uuid')
  resourceId: string; // TODO: resourceId => https://stackoverflow.com/questions/176264/what-is-the-difference-between-a-uri-a-url-and-a-urn

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.tracks)
  user: User;
}
