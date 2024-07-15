import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Track } from '../tracks/track.entity';
import { Artist } from './artist.entity';

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

  constructor(entity: Partial<TrackMeta>) {
    Object.assign(this, entity);
  }
}
