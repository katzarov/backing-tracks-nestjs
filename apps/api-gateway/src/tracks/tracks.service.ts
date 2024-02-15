import { Injectable } from '@nestjs/common';
import { Track } from './track.entity';
import { EntityManager, Equal, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TracksService {
  constructor(
    @InjectRepository(Track)
    private tracksRepository: Repository<Track>,
    private readonly entityManager: EntityManager,
    private usersService: UserService,
  ) {}

  async create(userId: number, track: Track) {
    // TODO, there must be a better way
    const user = await this.usersService.findOne(userId);
    track.user = user;
    return this.entityManager.save(track);
  }

  findAll(userId: number) {
    return this.tracksRepository.find({
      // relations: { user: true },
      where: { user: Equal(userId) },
      select: ['resourceId', 'name'],
    });

    // return this.tracksRepository.findBy({ user: Equal(userId) });
  }

  findOne(userId: number, resourceId: string) {
    // TODO: should actually return a presigned s3 url for the resource

    return this.tracksRepository.find({
      where: {
        user: Equal(userId),
        resourceId: Equal(resourceId),
      },
      select: ['resourceId', 'name'],
    });

    // https://typeorm.io/find-options#basic-options
    // WHERE OR
    // where: [{ user: Equal(userId) }, { resourceId: Equal(resourceId) }]
    // WHERE AND
    // where: { user: Equal(userId), resourceId: Equal(resourceId),}

    // return this.tracksRepository.findBy({
    //   user: Equal(userId),
    //   resourceId: Equal(resourceId),
    // });
  }

  remove(userId: number, resourceId: string) {
    return this.tracksRepository.delete({
      user: Equal(userId),
      resourceId: Equal(resourceId),
    });
  }
}
