import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly entityManager: EntityManager,
  ) {}

  create(auth0Id: string) {
    return this.entityManager.save(new User({ auth0Id }));
  }

  findOne(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  // TODO abstractify the auth provider as I will likely change to another
  // TODO: do it with a custom repository
  findOneByAuth0Id(auth0Id: string) {
    return this.usersRepository.findOneBy({ auth0Id });
  }
}
