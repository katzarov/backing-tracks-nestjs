# Backing Tracks NestJS

## Project Description

Check the frontend repository for general project description [frontend repository](https://github.com/katzarov/backing-tracks-react?tab=readme-ov-file#project-description).

## TODOs

[see project TODOs](TODO.md)

## App Stack

- NestJS
- TypeORM
- ffmpeg

## Folder Structure

This is a NestJS monorepo:

- `apps/api` - HTTP REST API
- `apps/file-converter` - TCP microservice for all ffmpeg related operations like converting files, getting details of audio files etc.
- `apps/youtube-downloader` - TCP microservice for downloading tracks from YouTube. Will need to replace it with something else as YouTube is doing some major changes and a lot of YouTube downloading libraries are broken.
- `libs/database` - all database related stuff: entity/schema definitions, repositories.

## Installation

TODO
