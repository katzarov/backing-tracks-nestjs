# TODO

## GENERAL:

- write tests for the track acquisition flows
- figure out yt-dlp automatic updates
- rename lib/shared to lib/misc
- make all IDs from int to uuid 4
- ALL DTO validators, set max char limit as well
- impl user roles. maybe user, demo and admin. impl some guards to prohibit some endpoints for demo users.
- check if a requested resource(like track file) is actually owned by user. cause first we may not use uuid for everything, second we should check anyway
- rename resourceId => uri / trackUri
- rename track-storage to file-storage or just storage
- read/learn about rxjs
- do error logging & monitoring: check out morgan, winston, pino, sentry.
- do NestJS logger instead of console.log
- checkout the devtools https://docs.nestjs.com/devtools/overview
- chekout the node permission model https://nodejs.org/en/blog/announcements/v20-release-announce
- better exception handling, we have almost none right now.
- microservies: identify & propagate errors to main app
- add swagger
- link the TS of this repo and the React repo ?
- prob check via node dev/prod env for some flags => NO, NODE_ENV just use production everywhere
- better dockerignore ?
- setup db migrations

## SECURITY:

- in general will try handle as much of this as possible in our proxies
- helmet
- think if any user input needs to be sanitized
- rate limit (some endpoints) but for sure the endpoint that will do the spotify search / the yt download endpoint as well. https://docs.nestjs.com/security/rate-limiting
- set alarms for cloud resources

## AUTH:

- switch to Cognito
- another guard to explicitly check if user is authzed to access a given resouce..?

## STORAGE & STREAMING:

- In order to enable streaming with the waveform viz lib. We need to already have the json for the waveform precomputed and have the duration of the file.
- generate waveforms service - await exec('audiowaveform -i /tmp/data.mp3 -o /tmp/data.json --pixels-per-second 20 --bits 8');
- offload decison where to save at lib level. And simplify client api -> storage.saveTrack()

## FILE UPLOAD

- run a shazam on the uploaded file / ytdl to figure out what the song is, instead of the user matching it with spotify
- give client s3 presigned url to upload file ? Then need to check where to do the validation.
- Right now, whole file is in memory, not great => switch to streaming file to a tmp folder for example.
- Moreover, file-type has moved to be ESM only since v17 and our nest project is using commonjs, so we are on v16 currently.
- wait, we can do await import to import esm modules in cjs or node 22+ --experimental-require-module
- https://joyeecheung.github.io/blog/2024/03/18/require-esm-in-node-js/
- https://stackoverflow.com/questions/74830166/unable-to-import-esm-module-in-nestjs

- https://github.com/expressjs/multer?tab=readme-ov-file#diskstorage
- https://github.com/expressjs/multer/blob/master/StorageEngine.md
- https://github.com/sindresorhus/file-type?tab=readme-ov-file#filetypefromstreamstream
- https://github.com/sindresorhus/file-type/tree/16?tab=readme-ov-file#usage

## ACQUIRE TRACKS FEAT:

- download album art from spotify and save to DB.. or somewhere else. Will probably only save in DB the smallest images 64x64. Also, check if Postgres offers some "specialized" solution for storing such things.
- UPDATE: (check if yt-dlp has same issue) check the ytdl media metadata for the google music tag. or/and keywords. Seems some videos are matched to google music. but this lib fails to retrieve the info. if this fail, we can still process the video name better by stripping "backing track", 'jam', "by", "high quality" and make the initial spotify search more accurate.
- donwload & save the album image(s): both the youtube and spotify (if matched).
- actually, save as much ytdl metadata as possible - in case jam track / spotify no match - we can still populate the UI with interesting info.
- when a jam/generic track, or can't find spotify match, user will enter manually and we'll save the artist/track metadata in our app db.
- when giving spotify suggestions, if user already has the same track in their collection, mark it as such & display on UI. (spotify has a lot of remasters (so same track essentially) => so try make sure the user always mathes to the same spotify entity)
- at some point will prob need functionality to merge artist / tracks into one entity.
- when getting all spotify track info on the server, maybe just dump the result to a json col.
- in case of upload track & no spotify match, we might just allow user to upload a pic as well when manually entering the track.
- BIG TODO: create another way of creating a HQ backing track -> find track in spotify - download from spotify - AI remove guitar stem - boom.. or intergrate a 3rd party like "Moises" that already does this really well...
- On FE modal, when we add the track, will need more steps in the modal to select what playlist (or create new playlist) to put the new track in.

## SEARCH, PLAYLISTS, TAGGING:

- impl search for within our app db. Try the native postgres search.
- impl tags and tags categories ? - (auto gen) artist name tag on initial track acquision & assign to track ?
  genre tags, tempo tags, (auto) backing track type/insturment as tag ?
  artist can be internally represented as a unique "tag" ?
- impl playlists
- auto gen playlists based on tags ?
- search by tags & tag categories ?

## DB SCHEMA IDEAS:

- right now trying to figure out what relationships to model in my app.

Current idea is:

- this app is responsible for track acquisition, playslists, tags, sections on tracks, daw user prefrences. etc.
- artist db - artist name, year, band history, artist music catalogue and stuff like that should be of no concern.
- so maybe when a track is matched with spotify we dump all the spotify data for this track to a jsonb column.

- if no track is matched with spotify user needs to enter manually. So they will enter artist & track name and thats it. We will model this in our db.
- **Will already need to have the db search implemented though - cause will be trying to find an artist with the same name so as to not duplicate it**
- if this happens a lot, we will prob need merge func even more

