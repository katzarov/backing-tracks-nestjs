import { createZodDto } from 'nestjs-zod';
import {
  UpdateTrackRequestSchema,
  TrackSchema,
} from 'backing-tracks-isomorphic';

export class UpdateTrackRequestDto extends createZodDto(
  UpdateTrackRequestSchema,
) {}

export class TrackResponse extends createZodDto(TrackSchema) {}
