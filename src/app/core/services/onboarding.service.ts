import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Onboarding } from '../../shared/models/onboarding.model';
import { PagedResult } from '../../shared/models/paged-result.model';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  private baseUrl = '/Onboarding';

  constructor(private api: ApiService) {}

  getAll(params?: any): Observable<PagedResult<Onboarding>> {
    return this.api.get<PagedResult<Onboarding>>(this.baseUrl, params);
  }

  getById(id: number): Observable<Onboarding> {
    return this.api.get<Onboarding>(`${this.baseUrl}/${id}`);
  }
}
