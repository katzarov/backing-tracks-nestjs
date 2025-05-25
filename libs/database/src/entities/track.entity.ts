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

const _TrackTypes = ['BACKING', 'JAM'] as const;
const TrackTypes = [..._TrackTypes];
type ITrackType = (typeof TrackTypes)[number];

const _TrackInstruments = ['GUITAR', 'BASS'] as const;
const TrackInstruments = [..._TrackInstruments];
type ITrackInstrument = (typeof TrackInstruments)[number];

interface ITrackRegion {
  id: string;
  start: number;
  end: number;
  name: string;
}

type ITrackRegions = Array<ITrackRegion>;

type TrackConstructor = Omit<
  Track,
  'id' | 'createdDate' | 'updatedDate' | 'user' | 'regions' | 'update'
>;

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
    enum: TrackTypes,
  })
  trackType: ITrackType;

  @Column({
    type: 'enum',
    enum: TrackInstruments,
  })
  trackInstrument: ITrackInstrument;

  // TODO figure out what precision we actually need
  @Column({ type: 'double precision' })
  duration: number;

  @Column('jsonb', {
    default: [],
  })
  regions: ITrackRegions;

  @ManyToOne(() => TrackMeta, (meta) => meta.tracks)
  meta: TrackMeta;

  @ManyToOne(() => User, (user) => user.tracks)
  user: User;

  @ManyToMany(() => Playlist, (playlist) => playlist.tracks, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  playlists?: Playlist[];
  // TODO playlists? or playlists or playlists: Playlist[] = [];

  /**
   * Update only the provided (non-undefined) fields on this entity.
   * If a value is undefined, typeorm won't do anything to that field. https://github.com/typeorm/typeorm/issues/2934
   *
   */
  update(
    fields: Partial<Pick<Track, 'trackInstrument' | 'trackType' | 'regions'>>,
  ) {
    Object.assign(this, fields);
  }

  constructor(entity: TrackConstructor) {
    Object.assign(this, entity);
  }
}
