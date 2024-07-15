import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TrackMeta } from './trackMeta.entity';

// TODO: will need more tables for this.. or better a new database for all artists data.. or better, don't model this in a realational db at all, but dump the spotify json data somewhere.

@Entity()
export class Artist {
  @PrimaryColumn()
  spotifyUri: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column()
  artistName: string;

  @OneToMany(() => TrackMeta, (trackMeta) => trackMeta.artist)
  tracks: TrackMeta[];

  constructor(entity: Partial<Artist>) {
    Object.assign(this, entity);
  }
}
