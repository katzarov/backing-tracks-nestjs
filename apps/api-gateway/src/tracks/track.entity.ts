import {
  Column,
  Entity,
  ManyToOne,
  Unique,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { TrackMeta } from '../meta/trackMeta.entity';

export enum TrackType {
  BACKING = 'BACKING',
  JAM = 'JAM',
}

export enum TrackInstrument {
  GUITAR = 'GUITAR',
  BASS = 'BASS',
}

@Entity()
@Unique(['resourceId'])
export class Track {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column({ type: 'uuid' })
  resourceId: string; // TODO: resourceId => https://stackoverflow.com/questions/176264/what-is-the-difference-between-a-uri-a-url-and-a-urn

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

  @Column({ type: 'integer' })
  duration: number;

  @ManyToOne(() => TrackMeta, (meta) => meta.tracks)
  meta: TrackMeta;

  @ManyToOne(() => User, (user) => user.tracks)
  user: User;

  constructor(entity: Partial<Track>) {
    Object.assign(this, entity);
  }
}
