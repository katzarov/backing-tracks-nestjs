import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Track } from './track.entity';
import { Artist } from './artist.entity';

// TODO need to be per user, artist per user as well.
// cause at some point users will be able to define thier own stuff and it wont be just the good data from spotify
@Entity()
export class TrackMeta {
  @PrimaryColumn()
  spotifyUri: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column()
  trackName: string;

  @ManyToOne(() => Artist, (artist) => artist.tracks)
  artist: Artist;

  @OneToMany(() => Track, (track) => track.meta)
  tracks: Track[];

  constructor(
    entity: Omit<
      TrackMeta,
      'createdDate' | 'updatedDate' | 'artist' | 'tracks'
    >,
  ) {
    Object.assign(this, entity);
  }
}
