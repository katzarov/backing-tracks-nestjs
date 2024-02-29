import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MaxInt,
  PartialSearchResult,
  SpotifyApi,
} from '@spotify/web-api-ts-sdk';

@Injectable()
export class SpotifyService {
  private readonly spotifyApi: SpotifyApi; // If I do the "syntatic sugar" in the constructor - for initializing this as a (private) class var, Nest will want to inject SpotifyApi.

  constructor(configService: ConfigService) {
    const spotifyClientId =
      configService.getOrThrow<string>('spotify.clientId');
    const spotifySecret = configService.getOrThrow<string>(
      'spotify.clientSecret',
    );
    this.spotifyApi = SpotifyApi.withClientCredentials(
      spotifyClientId,
      spotifySecret,
    );
  }

  private buildResponseForClient(
    res: Required<Pick<PartialSearchResult, 'tracks'>>,
  ) {
    // TODO: handle multiple artists, handle multiple images and their dimnesions.
    return res.tracks.items.map((item) => ({
      id: item.id,
      track: {
        uri: item.uri,
        name: item.name,
      },
      album: {
        uri: item.album.uri,
        name: item.album.name,
        image: item.album.images[0].url,
      },
      artist: {
        uri: item.artists[0].uri,
        name: item.artists[0].name,
      },
    }));
  }

  // TODO strip "backing track" from search.. 'jam' as well.. "by", "high quality"
  // BUT again check if the google music tag in the video (or keywords) or other metadata can be used.

  async search(query: string, limit?: MaxInt<10>, offset?: number) {
    const defaultLimit = 10;
    const result = await this.spotifyApi.search(
      query,
      ['track'],
      'US',
      limit === undefined ? defaultLimit : limit,
      offset,
    );
    const resultForClient = this.buildResponseForClient(result);

    return resultForClient;
  }
}
