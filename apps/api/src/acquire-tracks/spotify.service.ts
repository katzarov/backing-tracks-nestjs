import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type {
  MaxInt,
  PartialSearchResult,
  Track,
  Image,
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
    const images: {
      small: null | Image;
      medium: null | Image;
      large: null | Image;
    } = {
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
    return res.tracks.items.map((item) => {
      // spotify's docs say the image order is from largest in size to smallest. For search results, we just need the smallest.
      // assume track may not have an image
      const smallestImage = item.album.images.at(-1)
        ? item.album.images.at(-1)!.url
        : null;

      // TODO: handle multiple artists.
      const firstArtist = item.artists[0]!; // assume artist => cannot have track without artist.

      return {
        id: item.id,
        track: {
          uri: item.uri,
          name: item.name,
        },
        album: {
          uri: item.album.uri,
          name: item.album.name,
          image: smallestImage,
        },
        artist: {
          uri: firstArtist.uri,
          name: firstArtist.name,
        },
      };
    });
  }

  // TODO-validation shape of all spotify responses. We want to immediately know when if/when their api changes. And be able to fix it fast!
  // That being said, we are using their sdk. Need to check if they already do some validation and how/if they pass the results of that to us.

  // TODO catch and handle all spotify errs at this level. And from here on either:
  // - directly throw http errs for client
  // - or app errs.. and e.g and later decide in endpoint service that use this, what client http err to return.

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

  async getTrackInfo(spotifyId: string) {
    const trackInfo = await this.spotifyApi.tracks.get(
      spotifyId,
      spotifyMarket,
    );

    const albumArt = this.buildAlbumArtImageObject(trackInfo);

    // assume artist => cannot have track without artist.
    const artistId = trackInfo.artists[0]!.id;
    const artistName = trackInfo.artists[0]!.name;

    return { trackInfo: { ...trackInfo, artistId, artistName }, albumArt };
  }
}
