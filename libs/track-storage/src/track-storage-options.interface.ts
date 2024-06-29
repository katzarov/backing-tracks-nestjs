export interface TrackStorageOptions {
  disk: {
    downloadedTracksPath: string;
    convertedTracksPath: string;
  };
  s3: {
    isEnabled: boolean;
    region: string;
    bucket: string;
  };
}
