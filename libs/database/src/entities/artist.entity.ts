import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TrackMeta } from './trackMeta.entity';

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

  constructor(entity: Omit<Artist, 'createdDate' | 'updatedDate' | 'tracks'>) {
    Object.assign(this, entity);
  }
}
