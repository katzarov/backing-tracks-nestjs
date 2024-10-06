import { TrackType, TrackInstrument, TrackMeta } from '../../entities';

/**
 * I see two options of how to design the api for these repositories.
 * 1) client code instantiates the entity objects, using the typeorm entity def.
 * 2) client code creates some obj - DTOs like this one - and the actual entity instantiation will be done at a repository level.
 *
 * For now, will stick with 1) at most places,
 * but will utilize 2) in cases like this when multiple entities are involed and its more complex.
 */
export interface CreateTrackMatchedWithSpotifyRepositoryDto {
  user: {
    id: number;
  };
  track: {
    uri: string;
    duration: number;
    trackType: TrackType;
    trackInstrument: TrackInstrument;
  };
  trackMeta: {
    spotifyUri: string;
    name: string;
    albumArt: TrackMeta['albumArt'];
  };
  artist: {
    spotifyUri: string;
    name: string;
  };
}
