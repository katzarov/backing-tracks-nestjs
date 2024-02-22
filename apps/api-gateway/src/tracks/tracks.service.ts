import { Injectable, StreamableFile } from '@nestjs/common';
import { join } from 'node:path';
import { createReadStream } from 'node:fs';
import { Track } from './track.entity';
import { EntityManager, Equal, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TracksService {
  private convertedFolderName: string;

  constructor(
    @InjectRepository(Track)
    private tracksRepository: Repository<Track>,
    private readonly entityManager: EntityManager,
    private usersService: UserService,
    private configService: ConfigService,
  ) {
    this.convertedFolderName = this.configService.getOrThrow<string>(
      'storage.localDisk.convertedFolder',
    );
  }

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

  getFile(resourceId: string) {
    const file = createReadStream(
      join(process.cwd(), `${this.convertedFolderName}/${resourceId}.mp3`),
    );

    return new StreamableFile(file);
  }

  remove(userId: number, resourceId: string) {
    // TODO delete file as well
    return this.tracksRepository.delete({
      user: Equal(userId),
      resourceId: Equal(resourceId),
    });
  }
}
