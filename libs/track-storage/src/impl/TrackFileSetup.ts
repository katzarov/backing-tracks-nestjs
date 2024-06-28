import { PathLike, existsSync, mkdirSync } from 'node:fs';

export interface TrackFileSetupOptions {
  downloadedTracksPath: string;
  convertedTracksPath: string;
  // s3region;
}

export class TrackFileSetup {
  downloadedTracksPath: string;
  convertedTracksPath: string;

  constructor({
    downloadedTracksPath,
    convertedTracksPath,
  }: TrackFileSetupOptions) {
    this.downloadedTracksPath = downloadedTracksPath;
    this.convertedTracksPath = convertedTracksPath;
    this.createPathIfNotExist(downloadedTracksPath);
    this.createPathIfNotExist(convertedTracksPath);
  }

  private createPathIfNotExist(path: PathLike) {
    try {
      if (!existsSync(path)) {
        mkdirSync(path, { recursive: true });
      }
    } catch (err) {
      console.error(err);
    }
  }
}
