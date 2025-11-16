import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Candidate, CreateCandidateDto, UpdateCandidateDto } from '../../shared/models/candidate.model';
import { PagedResult } from '../../shared/models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  constructor(private api: ApiService) {}

  getCandidates(pageNumber: number = 1, pageSize: number = 10): Observable<PagedResult<Candidate>> {
    return this.api.get<PagedResult<Candidate>>('candidates', { pageNumber, pageSize });
  }

  getCandidate(id: number): Observable<Candidate> {
    return this.api.get<Candidate>(`candidates/${id}`);
  }

  createCandidate(candidate: CreateCandidateDto): Observable<Candidate> {
    return this.api.post<Candidate>('candidates', candidate);
  }

  updateCandidate(candidate: UpdateCandidateDto): Observable<Candidate> {
    return this.api.put<Candidate>(`candidates/${candidate.id}`, candidate);
  }

  deleteCandidate(id: number): Observable<void> {
    return this.api.delete<void>(`candidates/${id}`);
  }

  searchCandidates(query: string): Observable<Candidate[]> {
    return this.api.get<Candidate[]>('candidates/search', { query });
  }
}

