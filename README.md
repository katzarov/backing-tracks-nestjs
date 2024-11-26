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

- `apps/api` - HTTP REST API
- `apps/youtube-downloader` - TCP microservice based on the yt-dlp library for downloading tracks from YouTube, and converting them to mp3 using ffmpeg.
- `libs/database` - all database related stuff: entity/schema definitions, repositories.

## Installation

TODO
