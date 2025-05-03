import { createZodDto } from 'nestjs-zod';
import { GetYoutubeVideoInfoRequestSchema } from 'backing-tracks-isomorphic';

export class GetYoutubeVideoInfoRequestDto extends createZodDto(
  GetYoutubeVideoInfoRequestSchema,
) {}
