export default () => ({
  apiPort: parseInt(process.env.API_PORT, 10),
  youtubeDownloaderPort: parseInt(process.env.YOUTUBE_DOWNLOADER_PORT, 10),
  fileConverterPort: parseInt(process.env.FILE_CONVERTER_PORT, 10),

  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
  },

  storage: {
    localDisk: {
      downloadsFolder: 'downloads',
      convertedFolder: 'converted',
    },
    s3: {
      bucket: 'todo',
    },
  },
});
