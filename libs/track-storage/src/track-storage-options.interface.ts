export interface TrackStorageOptions {
  disk: {
    downloadedTracksPath: string;
    convertedTracksPath: string;
  };
  s3: {
    isEnabled: boolean;
    urlExpiration: number;
    region: string;
    bucket: string;
  };
}
