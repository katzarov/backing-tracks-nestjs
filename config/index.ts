export const apiConfig = () => ({
  api: {
    host: process.env.API_HOST,
    port: parseInt(process.env.API_PORT, 10),
    allowedOrigins: process.env.API_ALLOWED_ORIGINS.split(','),
  },
  auth: {
    domain: process.env.AUTH0_DOMAIN,
    audience: process.env.AUTH0_AUDIENCE,
  },
  spotify: {
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  },
});

export const ytdlConfig = () => ({
  ytdl: {
    host: process.env.YTDL_HOST,
    port: parseInt(process.env.YTDL_PORT, 10),
    cookiesEnabled: process.env.USE_YT_DLP_COOKIES.toLowerCase() === 'true',
    cookies: process.env.YT_DLP_COOKIES,
  },
});

export const redisConfig = () => ({
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
  },
});

export const databaseConfig = () => ({
  database: {
    name: process.env.POSTGRES_DB,
    host: process.env.POSTGRES_HOST,
    port: parseInt(process.env.POSTGRES_PORT, 10),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    synchronize: process.env.TYPEORM_SYNCHRONIZE,
  },
});

export const storageConfig = () => ({
  storage: {
    disk: {
      downloadedTracksPath: process.env.DOWNLOADED_TRACKS_PATH,
      convertedTracksPath: process.env.CONVERTED_TRACKS_PATH,
    },
    s3: {
      isEnabled: process.env.S3_ENABLED.toLowerCase() === 'true',
      urlExpiration: parseInt(process.env.S3_PRESIGNED_URL_EXPIRATION, 10),
      region: process.env.S3_REGION,
      bucket: process.env.S3_BUCKET,
    },
  },
});
