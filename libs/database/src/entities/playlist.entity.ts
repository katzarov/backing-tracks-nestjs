import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Track } from './track.entity';
import { User } from './user.entity';

type PlaylistConstructor = Pick<Playlist, 'name'> & {
  description?: string | null | undefined;
};

// TODO create a default playlist for all tracks of user
@Entity()
export class Playlist {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column({ unique: true })
  name: string;

  // NOTE: When I tell TS that prop is string | null, typeorm cannot infer what the column type is, so we need to specify it! Otherwise it fails silently and wastes your time!!!
  @Column('varchar', { nullable: true })
  description: string | null;

  @ManyToOne(() => User, (user) => user.playlists)
  user: User;

  // todo , maybe makes more sense for the track to own this table
  @ManyToMany(() => Track, (track) => track.playlists)
  @JoinTable({ name: 'playlist_tracks' })
  tracks: Track[];

  constructor(entity: PlaylistConstructor) {
    Object.assign(this, entity);
  }
}
