import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(helmet());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      // disableErrorMessages: true, // for prod
      enableDebugMessages: true,
    }),
  );

  const allowedOrigins =
    configService.getOrThrow<Array<string>>('api.allowedOrigins');

  app.enableCors({
    origin: allowedOrigins,
    allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    // methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
    maxAge: 60 * 60,
  });

  const port = configService.getOrThrow<number>('api.port');
  await app.listen(port);
}
bootstrap();

/**
 * TODO:
 *
 *
 * GENERAL:
 * - do error logging & monitoring: check out morgan, winston, pino, sentry.
 * - better exception handling, we have almost none right now.
 * - microservies: identify & propagate errors to main app
 * - add swagger
 * - link the TS of this repo and the React repo ?
 * - prob check via node dev/prod env for some flags
 * - put injection tokens in consts
 * - better dockerignore
 *
 *
 * SECURITY:
 * - helmet
 * - think if any user input needs to be sanitized
 * - rate limit (some endpoints) but for sure the endpoint that will do the spotify search / the yt download endpoint as well. https://docs.nestjs.com/security/rate-limiting
 * - set alarms for cloud resources
 *
 *
 * AUTH:
 * - switch to Cognito
 * - another guard to explicitly check if user is authzed to access a given resouce..?
 *
 *
 * STORAGE & STREAMING:
 * - impl s3 storage
 * - give client presigned urls
 * In order to enable streaming with the waveform viz lib. We need to already have the json for the waveform precomputed and have the duration of the file.
 * - generate waveforms service - await exec('audiowaveform -i /tmp/data.mp3 -o /tmp/data.json --pixels-per-second 20 --bits 8');
 * - somehow get and save to db the duration of each file.
 *
 *
 * ACQUIRE TRACKS FEAT:
 * - check the ytdl media metadata for the google music tag. or/and keywords. Seems some videos are matched to google music. but this lib fails to retrieve the info.
 *   if this fail, we can still process the video name better by stripping "backing track", 'jam', "by", "high quality" and make the initial spotify search more accurate.
 * - maybe move to the much better maintained ytdl python lib.
 * - donwload & save the album image(s): both the youtube and spotify (if matched).
 * - actually, save as much ytdl metadata as possible - in case jam track / spotify no match - we can still populate the UI with interesting info.
 * - when a jam/generic track, or can't find spotify match, user will enter manually and we'll save the artist/track metadata in our app db.
 * - when giving spotify suggestions, if user already has the same track in their collection, mark it as such & display on UI. (spotify has a lot of remasters (so same track essentially) => so try make sure the user always mathes to the same spotify entity)
 * - at some point will prob need functionality to merge artist / tracks into one entity.
 * - when getting all spotify track info on the server, maybe just dump the result to dynamo.
 * - in case of upload track & no spotify match, we might just allow user to upload a pic as well when manually entering the track.
 *
 *
 * SEARCH, PLAYLISTS, TAGGING:
 * - impl search for within our app db. Try the native postgres search.
 * - impl tags and tags categories ? - (auto gen) artist name tag on initial track acquision & assign to track ?
 *   genre tags, tempo tags, (auto) backing track type/insturment as tag ?
 *   artist can be internally represented as a unique "tag" ?
 * - impl playlists
 * - auto gen playlists based on tags ?
 * - search by tags & tag categories ?
 *
 *
 * DB SCHEMA IDEAS:
 * - right now trying to figure out what relationships to model in my app and what to leave to external systems.
 *
 * Current idea is:
 * - this app is responsible for track acquisition, playslists, tags, sections on tracks, daw user prefrences. etc.
 * - artist db - artist name, year, band history, artist music catalogue and stuff like that should be of no concern.
 * - so maybe when a track is matched with spotify we dump all the spotify data for this track to a jsonb column.
 *
 * - if no track is matched with spotify user needs to enter manually. So they will enter artist & track name and thats it. We will model this in our db.
 *   (will already need to have the db search implemented though - cause will be trying to find an artist with the same name so as to not duplicate it)
 *   (if this happens a lot, we will prob need merge func even more)
 *
 *
 */
