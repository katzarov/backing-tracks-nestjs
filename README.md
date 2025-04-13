# Backing Tracks NestJS

## Project Description

Check the frontend repository for general project description [frontend repository](https://github.com/katzarov/backing-tracks-react?tab=readme-ov-file#project-description).

## TODOs

[see project TODOs](TODO.md)

## App Stack

- NestJS
- TypeORM - I don't like it, never liked it. And now It also seems dead. I'd check out Prisma again - they have done some major rearchitecting that might solve the previous pain points.
- Class Validator - I like it but inferring the TS types from the schema is just plain better - so will be replacing this with Zod.
- Postgres => we are moving to DynamoDB cause its the only serverless pay per request db that AWS offers. And works great with a bunch of lambdas.
- BullMQ (queue system built on top of Redis). I like it but now I need to rebuild the system using AWS event driven arch(EDA) primitives.
- ffmpeg, yt-dlp

## Infra Stack

- As of now, the apps are ran on AWS as ECS tasks on an EC2.
- CI/CD with CodePipeline, CodeBuild, ECR.
- Infrastructure is as code - AWS CDK.
- For v2, will go more serverless & event driven & cheaper\* and will actually make the app scalable\*\* - ApiGW, Lambda, SQS, EventBridge, DynamoDB etc.
- and 5-10 years from now, I will probably just go back to something like v1 & and keep it super simple and just run all the containers on some dirt cheap VPS. So I need to keep this in mind.

## Folder Structure

This is a NestJS monorepo:

- `apps/api` - HTTP REST API. All the standard CRUD stuff. Authentication, mTLS, and few other things, are already handled before a request lands here.
- `apps/ytdl` - TCP microservice & job processor. **Ytdl** stands for **Y**ou**T**ube **D**own**L**oader, and this is what this service is mostly about. It is based on the **yt-dlp** library for downloading tracks from YouTube, and converting them to mp3 using **ffmpeg**. And since it already has ffmpeg as a dependancy, we also use it for a couple strictly ffmpeg related tasks.
- `libs/database` - all database related stuff: entity/schema definitions, repositories.
- `libs/job-queue` - all BullMQ related stuff. Mainly a thin wrapper for publishing youtube download jobs, some common read operations on the queue, and some queue event listeners.
- `libs` - in general, a lot of (core) code lives there.

## Installation

### Working with the containerized dev-server

- The npm deps installed locally are just for our code editor. You may still start the dev-server locally but some feats might not work.
- Note that our machine might not include all system dependencies that our app needs like ffmpeg or yt-dlp. You could install them locally but I won't.

- When the app image is initially built all the dependencies are installed - system wide and npm.
- We employ a hack that bind mounts our local src to the container, but still preserves its(the container's) node_modules.

- As an app dependancy we also have backing-tracks-isomorphic(**bti** for short). This is a pkg we maintain and distribute via npm.
- For local use we want our dev-server to use our local build of this pkg without going through npm. For that we use symlinks - npm link based.
- You need to have this repository and the "backing-tracks-isomorphic" repository in on the same file path on your machine, i.e next to each other.
- And we also bind mount the bti repo to our container.

Checklist:

1. package\*.json changed due to new dep, update, etc. => delete current container, image and volume. (script makes sure BTI is a symlink) `make dev-server-clean`
2. package\*.json changed due to changing BTI from local to registry or vice versa ? => delete current container, image and volume. (script makes sure BTI is a symlink) `make dev-server-clean`
3. BTI src changed ? => No need to rebuild image. Just restart nest dev-server by making some file change.
4. Run the dev server with `make dev-server`.

### Working with the containerized staging build

- no host bind mounts
- cannot use the local BTI build
- script makes sure BTI is installed through the pkg registry

- TODO

1. Run the staging build with `make staging`. For now, this already invokes `make staging-clean`.

**NOTE:** I would not install yt-dlp directly on your machine for a few reasons, one is that it has the capability to read your browser cookies - it's a feature to circumvent website restrictions... So I just run the app (incl. the dev server) through containers where there is no access to my whole fs... And that is not a bad thing to do anyway as there are malicious pkgs on npm for sure!

TODO

### Extracting YouTube cookies

- https://github.com/yt-dlp/yt-dlp/wiki/FAQ#how-do-i-pass-cookies-to-yt-dlp
- https://github.com/yt-dlp/yt-dlp/wiki/Extractors#exporting-youtube-cookies
- create a throwaway Google account.
- use a throwaway VM.
- install a browser extension that can export the cookies.
- Follow these exact steps when exporting the cookies, otherwise it won't work:

  - Open a new private browsing/incognito window and log into YouTube
  - Open a new tab and then close the YouTube tab
  - Export youtube.com cookies from the browser
  - Close the private browsing/incognito window so the session is never opened in the browser again.

- TODO: This looks like something new that we'd want to setup ? https://github.com/yt-dlp/yt-dlp/wiki/PO-Token-Guide
