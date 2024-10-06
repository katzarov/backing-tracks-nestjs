import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  MaxInt,
  PartialSearchResult,
  Track,
} from '@spotify/web-api-ts-sdk';
import { SpotifyApi } from '@spotify/web-api-ts-sdk';

const spotifyMarket = 'US';

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

  private buildAlbumArtImageObject(track: Track) {
    const images = {
      small: null,
      medium: null,
      large: null,
    };

    for (const image of track.album.images) {
      if (image.width === 640) {
        images.large = image;
        continue;
      }
      if (image.width === 300) {
        images.medium = image;
        continue;
      }
      if (image.width === 64) {
        images.small = image;
      }
    }
    return images;
  }

  private buildResponseForClient(
    res: Required<Pick<PartialSearchResult, 'tracks'>>,
  ) {
    // TODO: handle multiple artists.
    return res.tracks.items.map((item) => ({
      id: item.id,
      track: {
        uri: item.uri,
        name: item.name,
      },
      album: {
        uri: item.album.uri,
        name: item.album.name,
        // spotify's docs say the image order is from largest in size to smallest. For search results, we just need the smallest.
        image: item.album.images.at(-1).url,
      },
      artist: {
        uri: item.artists[0].uri,
        name: item.artists[0].name,
      },
    }));
  }

  async search(query: string, limit?: MaxInt<10>, offset?: number) {
    const defaultLimit = 10;
    const result = await this.spotifyApi.search(
      query,
      ['track'],
      spotifyMarket,
      limit === undefined ? defaultLimit : limit,
      offset,
    );

    // TODO: if user already has the same track in their collection, mark it as such & display on UI
    const resultForClient = this.buildResponseForClient(result);

    return resultForClient;
  }

  async getTrack(spotifyId: string) {
    const trackInfo = await this.spotifyApi.tracks.get(
      spotifyId,
      spotifyMarket,
    );

    const albumArt = this.buildAlbumArtImageObject(trackInfo);

    return { trackInfo, albumArt };
  }
}
