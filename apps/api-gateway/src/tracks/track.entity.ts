import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from 'apps/api-gateway/src/base.entity';
import { User } from '../user/user.entity';

@Entity()
export class Track extends BaseEntity<Track> {
  @Column('uuid')
  resourceId: string;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.tracks)
  user: User;
}
