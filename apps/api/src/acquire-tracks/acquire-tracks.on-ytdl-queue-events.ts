import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { TrackStorageService } from '@app/track-storage';
import { ConfigService } from '@nestjs/config';
import { TrackRepository } from '@app/database/repositories';
import { AppEvents, EventsService, JobQueueEvents } from '@app/shared/events';
import { YtdlJobFormatted } from '@app/job-queue/ytdl-queue.interface';

@Injectable()
export class AcquireTracksOnYtdlQueueEvents implements OnApplicationBootstrap {
  private isS3Enabled: boolean;

  constructor(
    private trackRepository: TrackRepository,
    private trackStorageService: TrackStorageService,
    private eventsService: EventsService,

    configService: ConfigService,
  ) {
    this.isS3Enabled = configService.getOrThrow<boolean>(
      'storage.s3.isEnabled',
    );
  }

  onApplicationBootstrap() {
    this.eventsService.addListener(
      JobQueueEvents.ytdlCompleted,
      this.onYtDownloadCompleted.bind(this),
    );
  }

  private async onYtDownloadCompleted(eventPayload: YtdlJobFormatted) {
    const { data, returnvalue } = eventPayload;

    let duration: number;

    if (
      returnvalue.ffProbeTrackDuration !== null &&
      returnvalue.ffProbeTrackDuration !== undefined
    ) {
      duration = returnvalue.ffProbeTrackDuration;
    } else {
      duration = data.meta.spotify.trackDuration / 1000;
      console.log(
        `FFprobe duration for ${data.trackUri} is undefined. Using Spotify duration as fallback.`,
      );
    }

    const trackFile = this.trackStorageService.createTrackFromUri(
      data.trackUri,
    );

    // TODO: at some point this decision - save to disk or s3 or both will be handled entirely by the storage lib.
    // save to s3 here or at microservice ? for s3, and when move to lambda, will need to be done at the ytdl ms, or at fist glacne looks like we can mount EFS to lamba and keep the shared storage, but why...
    if (this.isS3Enabled) {
      await trackFile.saveTrackToS3(trackFile.getTrackFromDisk());
      // todo cleanup s3 if saving to db fails
    }

    await this.trackRepository.createTrackMatchedWithSpotify({
      user: { id: data.userId },
      track: {
        uri: data.trackUri,
        duration,
        trackType: data.meta.trackType,
        trackInstrument: data.meta.trackInstrument,
      },
      artist: {
        spotifyUri: data.meta.spotify.artistUri,
        name: data.meta.spotify.artistName,
      },
      trackMeta: {
        spotifyUri: data.meta.spotify.trackUri,
        name: data.meta.spotify.trackName,
        albumArt: data.meta.spotify.albumArt,
      },
    });

    this.eventsService.emit(AppEvents.ytDownloadSavedInDatabase, eventPayload);

    console.log(
      `track acquired: id: ${data.trackUri} user: ${data.userId} title: ${data.meta.spotify.trackName} aritst: ${data.meta.spotify.artistName}`,
    );
  }
}
