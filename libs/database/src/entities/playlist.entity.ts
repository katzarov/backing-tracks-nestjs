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

  @Column({ nullable: true })
  description?: string;

  @ManyToOne(() => User, (user) => user.playlists)
  user: User;

  // todo , maybe makes more sense for the track to own this table
  @ManyToMany(() => Track, (track) => track.playlists)
  @JoinTable({ name: 'playlist_tracks' })
  tracks: Track[];

  constructor(
    entity: Omit<
      Playlist,
      'id' | 'createdDate' | 'updatedDate' | 'user' | 'tracks'
    >,
  ) {
    Object.assign(this, entity);
  }
}
