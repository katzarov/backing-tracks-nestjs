import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  saveOneWithAuth0Id(auth0Id: string) {
    // save() works with entity listeners and subscribers, insert() doesn't.
    return this.userRepository.save({ auth0Id });
  }

  findOneById(id: number) {
    return this.userRepository.findOneByOrFail({ id });
  }

  findOneByAuth0Id(auth0Id: string) {
    return this.userRepository.findOneBy({ auth0Id });
  }
}
