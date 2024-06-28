import { Injectable } from '@nestjs/common';
import * as ytdl from 'ytdl-core';
import { formatBytes } from './utils';
import { TrackStorageService } from '@app/track-storage';

@Injectable()
export class YoutubeDownloaderService {
  // constructor(@Inject('YTDL_LIB') private ytdl) {}
  constructor(private trackStorageService: TrackStorageService) {}

  async getYouTubeVideoInfo(url: string) {
    const info = await ytdl.getInfo(url);

    const { title, author, lengthSeconds, thumbnails } = info.videoDetails;
    const { name } = author;
    const thumbnailUrl = thumbnails[0].url;

    return { title, channel: name, length: lengthSeconds, thumbnailUrl };
  }

  async downloadYouTubeVideo(url: string, name: string) {
    const info = await ytdl.getInfo(url);
    const formats = ytdl.filterFormats(info.formats, 'audioonly');
    const choosenFormat = ytdl.chooseFormat(formats, {
      quality: 'highestaudio',
    });

    const videoStream = ytdl(url, { format: choosenFormat });
    // videoStream.on('info', (info) => {
    //   console.log(info);
    // });

    videoStream.on('progress', (e) => {
      console.log(formatBytes(e));
    });

    // videoStream.on('error', () => {
    //   console.log('error');
    // });

    // videoStream.on('end', () => {
    //   console.log('end ');
    // });

    const trackFile = this.trackStorageService.createTrackFromUri(name);

    await trackFile.saveMp4ToDisk(videoStream);

    console.log('downloaded');

    return name;
  }
}
