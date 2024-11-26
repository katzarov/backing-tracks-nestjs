# Backing Tracks NestJS

## Project Description

Check the frontend repository for general project description [frontend repository](https://github.com/katzarov/backing-tracks-react?tab=readme-ov-file#project-description).

## TODOs

[see project TODOs](TODO.md)

## App Stack

- NestJS
- TypeORM
- Postgres
- ffmpeg, yt-dlp

## Folder Structure

This is a NestJS monorepo:

- `apps/api` - HTTP REST API. All the standard CRUD stuff. Authentication, mTLS, and few other things, are already handled before a request lands here.
- `apps/ytdl` - TCP microservice. **Ytdl** stands for YouTube DownLoader, and this is what this service is mostly about. It is based on the **yt-dlp** library for downloading tracks from YouTube, and converting them to mp3 using **ffmpeg**. And since it already has ffmpeg as a dependancy, we also use it for a couple strictly ffmpeg related tasks.
- `libs/database` - all database related stuff: entity/schema definitions, repositories.
- `libs` - in general, a lot of (core) code lives there.

## Installation

TODO
