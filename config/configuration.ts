export default () => ({
  api: {
    host: process.env.API_HOST,
    port: parseInt(process.env.API_PORT, 10),
  },

  youtubeDownloader: {
    host: process.env.YOUTUBE_DOWNLOADER_HOST,
    port: parseInt(process.env.YOUTUBE_DOWNLOADER_PORT, 10),
  },

  fileConverter: {
    host: process.env.FILE_CONVERTER_HOST,
    port: parseInt(process.env.FILE_CONVERTER_PORT, 10),
  },

  auth: {
    domain: process.env.AUTH0_DOMAIN,
    audience: process.env.AUTH0_AUDIENCE,
  },

  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  },

  database: {
    name: process.env.POSTGRES_DB_NAME,
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    synchronize: process.env.TYPEORM_SYNCHRONIZE,
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
