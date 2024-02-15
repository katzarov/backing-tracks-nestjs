import { PrimaryGeneratedColumn } from 'typeorm';

export class BaseEntity<T> {
  @PrimaryGeneratedColumn()
  id: number;

  constructor(entity: Partial<T>) {
    Object.assign(this, entity);
  }
}
