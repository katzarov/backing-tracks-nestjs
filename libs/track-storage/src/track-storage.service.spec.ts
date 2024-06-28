import { Test, TestingModule } from '@nestjs/testing';
import { TrackStorageService } from './track-storage.service';

describe('TrackStorageService', () => {
  let service: TrackStorageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TrackStorageService],
    }).compile();

    service = module.get<TrackStorageService>(TrackStorageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
