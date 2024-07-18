import {
  Column,
  Entity,
  OneToMany,
  Unique,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Track } from './track.entity';

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

  constructor(entity: Omit<User, 'id' | 'createdDate' | 'updatedDate'>) {
    Object.assign(this, entity);
  }
}
