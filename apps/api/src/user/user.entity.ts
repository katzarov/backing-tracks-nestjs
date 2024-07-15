import {
  Column,
  Entity,
  OneToMany,
  Unique,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Track } from '../tracks/track.entity';

@Entity()
@Unique(['auth0Id'])
export class User {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;

  @Column()
  auth0Id: string;

  @OneToMany(() => Track, (track) => track.user)
  tracks: Track[];

  constructor(entity: Partial<User>) {
    Object.assign(this, entity);
  }
}
