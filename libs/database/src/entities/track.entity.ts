import {
  Column,
  Entity,
  ManyToOne,
  Unique,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { User } from './user.entity';
import { TrackMeta } from './trackMeta.entity';
import { Playlist } from './playlist.entity';

export enum TrackType {
  BACKING = 'BACKING',
  JAM = 'JAM',
}

export enum TrackInstrument {
  GUITAR = 'GUITAR',
  BASS = 'BASS',
}

// TODO the YT URL itself should also be a column
// TODO take into account track versioning https://typeorm.io/decorator-reference#generated https://github.com/typeorm/typeorm/issues/1517
// TODO rethink primary columns: https://typeorm.io/entities#primary-columns
@Entity()
@Unique(['resourceId'])
export class Track {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  // todo rename to file_uri
  @Column({ type: 'uuid' })
  resourceId: string; // TODO: resourceId => https://stackoverflow.com/questions/176264/what-is-the-difference-between-a-uri-a-url-and-a-urn

  // @Column()
  // @Generated('increment')
  // version: number;

  // @Column({ nullable: true })
  // comment?: string;

  @Column({
    type: 'enum',
    enum: TrackType,
  })
  trackType: TrackType;

  @Column({
    type: 'enum',
    enum: TrackInstrument,
  })
  trackInstrument: TrackInstrument;

  // TODO figure out what precision we actually need
  @Column({ type: 'double precision' })
  duration: number;

  @ManyToOne(() => TrackMeta, (meta) => meta.tracks)
  meta: TrackMeta;

  @ManyToOne(() => User, (user) => user.tracks)
  user: User;

  @ManyToMany(() => Playlist, (playlist) => playlist.tracks, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  playlists?: Playlist[];

  constructor(
    entity: Omit<Track, 'id' | 'createdDate' | 'updatedDate' | 'user'>,
  ) {
    Object.assign(this, entity);
  }
}
