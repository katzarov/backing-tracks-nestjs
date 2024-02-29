import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import * as fs from 'node:fs/promises';
import { randomUUID } from 'crypto';
import { lastValueFrom, Observable } from 'rxjs';
import { DownloadYouTubeVideoDto } from './dto/download-youtube-video.dto';
import { TracksService } from '../tracks/tracks.service';
import { Track } from '../tracks/track.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AcquireTracksService {
  private tracksFolder;
  constructor(
    @Inject('YOUTUBE_DOWNLOADER_SERVICE') private youtubeService: ClientProxy,
    @Inject('FILE_CONVERTER_SERVICE') private fileConverterService: ClientProxy,
    private tracksService: TracksService,
    configService: ConfigService,
  ) {
    this.tracksFolder = configService.getOrThrow<string>(
      'storage.localDisk.convertedFolder',
    );
  }

  private download(url: string, name: string): Observable<string> {
    const pattern = { cmd: 'downloadYouTubeVideo' };
    const payload = { url, name };
    return this.youtubeService.send(pattern, payload);
  }

  private convert(name: string): Observable<string> {
    const pattern = { cmd: 'convertFile' };
    const payload = { name };
    return this.fileConverterService.send(pattern, payload);
  }

  private async createTrackEntry(
    userId: number,
    resourceId: string,
    trackName: string,
  ) {
    // TODO: not (type) safe
    const newTrack = new Track({ resourceId, name: trackName });
    // TODO: cleanup files if this fails
    await this.tracksService.create(userId, newTrack);

    return `new track acquired: ${trackName}, id: ${resourceId}, for user: ${userId}`;
  }

  getYouTubeVideoInfo(url: string) {
    return this.youtubeService.send({ cmd: 'getYouTubeVideoInfo' }, { url });
  }

  async downloadYouTubeVideo(
    userId: number,
    { url, name }: DownloadYouTubeVideoDto,
  ) {
    const resourceId = randomUUID();
    // BIG TODO here: probably want some job/tracker service instead of doing it like this here.
    // some hybrid microservice that also does ss3 with the client to show the download/converter progress, and show all currnet jobs and blah blah..
    // i,e job tracking/execution/notification service(s), will also need a queue, look into rabbitmq

    // TODO v2, these two microserices will probably end up being lambdas again.. I will need to rethink a bit how the notification/job tracking for the FE client, will be done in this case.

    await lastValueFrom(this.download(url, resourceId));
    await lastValueFrom(this.convert(resourceId));

    const newTrackInfo = await this.createTrackEntry(userId, resourceId, name);
    console.log(newTrackInfo);
    return { msg: newTrackInfo };
  }

  async uploadTrack(userId: number, name: string, file: Express.Multer.File) {
    const resourceId = randomUUID();
    // TODO: temp, will later switch to streams
    await fs.writeFile(`${this.tracksFolder}/${resourceId}.mp3`, file.buffer);

    const newTrackInfo = await this.createTrackEntry(userId, resourceId, name);
    console.log(newTrackInfo);
    return { msg: newTrackInfo };
  }
}
