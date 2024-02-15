import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { randomUUID } from 'crypto';
import { lastValueFrom, Observable } from 'rxjs';
import { DownloadYouTubeVideoDto } from './dto/download-youtube-video.dto';
import { TracksService } from '../tracks/tracks.service';
import { Track } from '../tracks/track.entity';

@Injectable()
export class AcquireTracksService {
  constructor(
    @Inject('YOUTUBE_DOWNLOADER_SERVICE') private youtubeService: ClientProxy,
    @Inject('FILE_CONVERTER_SERVICE') private fileConverterService: ClientProxy,
    private tracksService: TracksService,
  ) {}

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

    await lastValueFrom(this.download(url, resourceId));
    await lastValueFrom(this.convert(resourceId));

    // TODO: not (type) safe
    const newTrack = new Track({ resourceId, name });
    // TODO: cleanup files if this fails
    await this.tracksService.create(userId, newTrack);

    const msg = `new track acquired: ${name}, id: ${resourceId}, for user: ${userId}`;
    console.log(msg);

    return msg;
  }
}
