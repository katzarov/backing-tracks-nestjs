import { IAlbumArtImage } from '@app/database/entities';
import { ITrackType, ITrackInstrument } from 'backing-tracks-isomorphic';
import type { Job, JobState, Queue } from 'bullmq';

export interface YtdlJobData {
  userId: number;
  ytUrl: string;
  trackUri: string;
  // the following are not needed for the actual download job,
  // they are neccesary for when the user wants to get their job status (and details) before the track is inserted into the database.
  meta: {
    spotify: {
      trackUri: string;
      trackName: string;
      trackDuration: number;
      artistUri: string;
      artistName: string;
      albumArt: {
        small: IAlbumArtImage | null;
        medium: IAlbumArtImage | null;
        large: IAlbumArtImage | null;
      };
    };
    trackType: ITrackType;
    trackInstrument: ITrackInstrument;
  };
}

/**
 * The payload for this job.
 * job.data
 */
export type YtDownloadDataType = YtdlJobData;

/**
 * The value returned by the processor when processing this job.
 * job.returnValue
 *
 * @defaultValue null - when job is not processed yet
 */
export interface YtDownloadReturnType {
  success: boolean;
  ffProbeTrackDuration: number | null | undefined; // TODO
}

/**
 * The name of the Job
 * job.name
 */
export type YtDownloadNameType = 'yt_download';

export type YtdlJob = Job<
  YtDownloadDataType,
  YtDownloadReturnType,
  YtDownloadNameType
>;

export type YtdlQueue = Queue<
  YtDownloadDataType,
  YtDownloadReturnType,
  YtDownloadNameType
>;

/**
 * The progress a job has performed so far.
 * job.progress
 * @defaultValue 0
 */
export type YtdlJobProgress =
  | number
  | {
      percent: number | null;
      eta: number | null;
    };

export interface YtdlProgressEvent {
  data: YtdlJobProgress;
  jobId: string;
}

export interface YtdlJobFormatted {
  name: 'yt_download';
  id?: string;
  data: YtdlJobData;
  state: JobState | 'unknown';
  progress: YtdlJobProgress;
  returnvalue: YtDownloadReturnType;
  timestamp: number; // when job was created
  finishedOn?: number;
  // processedOn: number;
  // failedReason: string;
  // stacktrace: string[];
}
