import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { SpotifyService } from './spotify.service';
import { DownloadYouTubeVideoDto } from './dto/download-youtube-video.dto';
import { TrackInstrument, TrackType } from '@app/database/entities';
import { UploadTrackDto } from './dto/upload-track.dto';
import { TrackStorageService } from '@app/track-storage';
import { ConfigService } from '@nestjs/config';
import { TrackRepository } from '@app/database/repositories';
import { YTDL_SERVICE_TOKEN } from './acquire-tracks.injection-tokens';
import { AcquireTracksMicroServicesClient } from './acquire-tracks.microservices-client';

@Injectable()
export class AcquireTracksService extends AcquireTracksMicroServicesClient {
  private isS3Enabled: boolean;

  constructor(
    @Inject(YTDL_SERVICE_TOKEN) ytdlService: ClientProxy,
    private trackRepository: TrackRepository,
    private spotifyService: SpotifyService,
    private trackStorageService: TrackStorageService,
    configService: ConfigService,
  ) {
    super(ytdlService);

    this.isS3Enabled = configService.getOrThrow<boolean>(
      'storage.s3.isEnabled',
    );
  }

  private async createAndSaveTrackEntry(
    userId: number,
    resourceId: string,
    spotifyId: string,
    trackType: TrackType,
    trackInstrument: TrackInstrument,
    trackDuration: number | null,
  ) {
    const { trackInfo, albumArt } =
      await this.spotifyService.getTrack(spotifyId);

    const artistId = trackInfo.artists[0].id;
    const artistName = trackInfo.artists[0].name;

    let duration: number;

    if (trackDuration === null) {
      duration = trackInfo.duration_ms / 1000;
      console.log(
        `FFprobe duration for ${resourceId} is undefined. Using Spotify duration as fallback.`,
      );
    } else {
      duration = trackDuration;
    }

    await this.trackRepository.createTrackMatchedWithSpotify({
      user: { id: userId },
      track: {
        uri: resourceId,
        duration,
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
        albumArt,
      },
    });

    // TODO: cleanup files if this fails
    return `track acquired: id: ${resourceId} user: ${userId} title: ${trackInfo.name} aritst: ${artistName}`;
  }

  async getYouTubeVideoInfo(url: string) {
    const ytdlResult = await this.getVideoInfo(url);

    // TODO: put response data in separate key in ms api => {status: {...}, data: {...}}
    return {
      title: ytdlResult.title,
      channel: ytdlResult.channel,
      length: ytdlResult.length,
      thumbnailUrl: ytdlResult.thumbnailUrl,
    };
  }

  async downloadYouTubeVideo(
    userId: number,
    { url, spotifyId, trackType, trackInstrument }: DownloadYouTubeVideoDto,
  ) {
    const trackFile = this.trackStorageService.createTrack();

    await this.download(url, trackFile);

    const { duration: trackDuration } =
      await this.getAudioDurationInSeconds(trackFile);

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
      trackDuration,
    );
    console.log(newTrackInfo);
  }

  async uploadTrack(
    userId: number,
    { spotifyId, trackType, trackInstrument }: UploadTrackDto,
    file: Express.Multer.File,
  ) {
    const trackFile = this.trackStorageService.createTrack();

    await trackFile.saveUploadedTrackToDisk(file.buffer);

    const { duration: trackDuration } =
      await this.getAudioDurationInSeconds(trackFile);

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
      trackDuration,
    );
    console.log(newTrackInfo);
  }
}
