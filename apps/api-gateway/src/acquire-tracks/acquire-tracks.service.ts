import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { DownloadYouTubeVideoDto } from './dto/download-youtube-video.dto';

@Injectable()
export class AcquireTracksService {
  constructor(
    @Inject('YOUTUBE_DOWNLOADER_SERVICE') private youtubeService: ClientProxy,
    @Inject('FILE_CONVERTER_SERVICE') private fileConverterService: ClientProxy,
  ) {}

  getYouTubeVideoInfo(url: string) {
    return this.youtubeService.send({ cmd: 'getYouTubeVideoInfo' }, { url });
  }

  async downloadYouTubeVideo({ url, name }: DownloadYouTubeVideoDto) {
    // TODO: name => some file id

    // BIG TODO here: probably want some job/tracker service instead of doing it like this here.
    // some hybrid microservice that also does ss3 with the client to show the download/converter progress, and show all currnet jobs and blah blah..
    // i,e job tracking/execution/notification service(s), will also need a queue, look into rabbitmq

    await lastValueFrom(
      this.youtubeService.send({ cmd: 'downloadYouTubeVideo' }, { url, name }),
    );
    await lastValueFrom(
      this.fileConverterService.send({ cmd: 'convertFile' }, { name }),
    );

    // TODO generate waveform service

    // all good ? save entry to DB, if not cleanup/rollback

    const msg = `new track acquired: ${name}`;
    console.log(msg);

    return msg;
  }
}
