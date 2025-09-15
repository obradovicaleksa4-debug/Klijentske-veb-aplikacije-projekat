import { TestBed } from '@angular/core/testing';

import { MovieProjectionApiService } from './movie-projection-api.service';

describe('MovieProjectionApiService', () => {
  let service: MovieProjectionApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovieProjectionApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
