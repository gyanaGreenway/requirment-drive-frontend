import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth';
import { ApiService } from './api.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: ApiService, useValue: { post: () => {} } }
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
