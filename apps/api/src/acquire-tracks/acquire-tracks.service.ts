import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, Observable } from 'rxjs';
import { SpotifyService } from './spotify.service';
import { DownloadYouTubeVideoDto } from './dto/download-youtube-video.dto';
import { TrackInstrument, TrackType } from '@app/database/entities';
import { UploadTrackDto } from './dto/upload-track.dto';
import { TrackStorageService } from '@app/track-storage';
import type { TrackFile } from '@app/track-storage';
import { ConfigService } from '@nestjs/config';
import { TrackRepository } from '@app/database/repositories';

@Injectable()
export class AcquireTracksService {
  private isS3Enabled: boolean;

  constructor(
    @Inject('YOUTUBE_DOWNLOADER_SERVICE') private youtubeService: ClientProxy,
    @Inject('FILE_CONVERTER_SERVICE') private fileConverterService: ClientProxy,
    private trackRepository: TrackRepository,
    private spotifyService: SpotifyService,
    private trackStorageService: TrackStorageService,
    configService: ConfigService,
  ) {
    this.isS3Enabled = configService.getOrThrow<boolean>(
      'storage.s3.isEnabled',
    );
  }

  private download(url: string, trackFile: TrackFile): Observable<string> {
    const pattern = { cmd: 'downloadYouTubeVideo' };
    const payload = { url, name: trackFile.uri };
    return this.youtubeService.send(pattern, payload);
  }

  private convert(trackFile: TrackFile): Observable<string> {
    const pattern = { cmd: 'convertFile' };
    const payload = { name: trackFile.uri };
    return this.fileConverterService.send(pattern, payload);
  }

  private async createAndSaveTrackEntry(
    userId: number,
    resourceId: string,
    spotifyId: string,
    trackType: TrackType,
    trackInstrument: TrackInstrument,
  ) {
    const trackInfo = await this.spotifyService.getTrack(spotifyId);
    // TODO get duration from the actual track file itself.
    const artistId = trackInfo.artists[0].id;
    const artistName = trackInfo.artists[0].name;

    await this.trackRepository.createTrackMatchedWithSpotify({
      user: { id: userId },
      track: {
        uri: resourceId,
        duration: trackInfo.duration_ms,
        trackType,
        trackInstrument,
      },
      artist: {
        spotifyUri: artistId,
        name: artistName,
      },
      trackMeta: {
        spotifyUri: spotifyId,
        name: trackInfo.name,
      },
    });

    // TODO: cleanup files if this fails

    return `new track acquired: ${trackInfo.name}, id: ${resourceId}, for user: ${userId}`;
  }

  getYouTubeVideoInfo(url: string) {
    return this.youtubeService.send({ cmd: 'getYouTubeVideoInfo' }, { url });
  }

  async downloadYouTubeVideo(
    userId: number,
    { url, spotifyId, trackType, trackInstrument }: DownloadYouTubeVideoDto,
  ) {
    const trackFile = this.trackStorageService.createTrack();
    // BIG TODO here: probably want some job/tracker service instead of doing it like this here.
    // some hybrid microservice that also does ss3 with the client to show the download/converter progress, and show all currnet jobs and blah blah..
    // i,e job tracking/execution/notification service(s), will also need a queue, look into rabbitmq
    // put a message broker inbetween all instead of this method call all microservices like that.
    // + notification service that will listen also to all messages and track the result + will notify the client

    // TODO v2, these two microserices will probably end up being lambdas again.. I will need to rethink a bit how the notification/job tracking for the FE client, will be done in this case.

    await lastValueFrom(this.download(url, trackFile));
    await lastValueFrom(this.convert(trackFile));

    // TODO: at some point this decision - save to disk or s3 or both will be handled entirely by the storage lib.
    if (this.isS3Enabled) {
      await trackFile.saveTrackToS3(trackFile.getTrackFromDisk());
    }

    const newTrackInfo = await this.createAndSaveTrackEntry(
      userId,
      trackFile.uri,
      spotifyId,
      trackType,
      trackInstrument,
    );
    console.log(newTrackInfo);
    return { msg: newTrackInfo };
  }

  async uploadTrack(
    userId: number,
    { spotifyId, trackType, trackInstrument }: UploadTrackDto,
    file: Express.Multer.File,
  ) {
    const trackFile = this.trackStorageService.createTrack();

    trackFile.saveUploadedTrackToDisk(file.buffer);

    // TODO: at some point this decision - save to disk or s3 or both will be handled entirely by the storage lib.
    if (this.isS3Enabled) {
      await trackFile.saveTrackToS3(trackFile.getTrackFromDisk());
    }

    const newTrackInfo = await this.createAndSaveTrackEntry(
      userId,
      trackFile.uri,
      spotifyId,
      trackType,
      trackInstrument,
    );
    console.log(newTrackInfo);
    return { msg: newTrackInfo };
  }
}
