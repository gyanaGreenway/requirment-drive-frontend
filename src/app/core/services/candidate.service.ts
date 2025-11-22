import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Candidate, CreateCandidateDto, UpdateCandidateDto } from '../../shared/models/candidate.model';
import { PagedResult } from '../../shared/models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {
  constructor(private api: ApiService) {}

  getCandidates(pageNumber: number = 1, pageSize: number = 10, searchTerm?: string): Observable<PagedResult<Candidate>> {
    const params: Record<string, any> = { pageNumber, pageSize };
    if (searchTerm && searchTerm.trim()) {
      params['searchTerm'] = searchTerm.trim();
    }
    return this.api.get<PagedResult<Candidate>>('Candidates', params);
  }

  getCandidate(id: number): Observable<Candidate> {
    return this.api.get<Candidate>(`Candidates/${id}`);
  }

  createCandidate(candidate: CreateCandidateDto | any): Observable<Candidate> {
    const dto = this.buildCandidateDto(candidate, { includeId: false, includeRowVersion: false, includePassword: true });
    const payload = { createCandidateDto: dto, CreateCandidateDto: dto };

    return this.api.post<Candidate>('Candidates', dto).pipe(
      catchError((err: any) => {
        if (this.shouldRetryWithWrapper(err, 'createcandidatedto')) {
          return this.api.post<Candidate>('Candidates', payload);
        }
        return throwError(() => err);
      })
    );
  }

  updateCandidate(candidate: UpdateCandidateDto | any): Observable<Candidate> {
    const dto = this.buildCandidateDto(candidate, { includeId: true, includeRowVersion: true });
    const resourceId = dto.Id ?? candidate?.id ?? candidate?.Id;
    if (resourceId === undefined || resourceId === null) {
      return throwError(() => new Error('Candidate id is required for update.'));
    }

    console.log('Sending update request - DTO (unwrapped):', dto);

    // Send DTO directly without wrapper - backend expects it at root level
    return this.api.put<Candidate>(`Candidates/${resourceId}`, dto).pipe(
      catchError((err: any) => {
        console.error('Update failed:', err);
        
        // If direct send fails with binding error, try with wrapper
        if (err.status === 400 && this.shouldRetryWithWrapper(err, 'updatecandidatedto')) {
          const wrappedPayload = { updateCandidateDto: dto };
          console.log('Retrying with wrapped payload:', wrappedPayload);
          return this.api.put<Candidate>(`Candidates/${resourceId}`, wrappedPayload);
        }
        return throwError(() => err);
      })
    );
  }

  deleteCandidate(id: number): Observable<void> {
    return this.api.delete<void>(`Candidates/${id}`);
  }

  searchCandidates(query: string): Observable<Candidate[]> {
    return this.api.get<Candidate[]>('Candidates/search', { query });
  }

  private shouldRetryWithWrapper(err: any, keyword: string): boolean {
    if (!err || err.status !== 400) return false;
    try {
      const raw = err?.error ?? err;
      if (raw && typeof raw === 'object' && raw.errors) {
        const errorsJson = JSON.stringify(raw.errors).toLowerCase();
        if (errorsJson.includes(keyword.toLowerCase())) return true;
      }
      const text = typeof raw === 'string' ? raw : JSON.stringify(raw || {});
      return text.toLowerCase().includes(keyword.toLowerCase());
    } catch {
      return false;
    }
  }

  private buildCandidateDto(candidate: any, options: { includeId?: boolean; includeRowVersion?: boolean; includePassword?: boolean } = {}): any {
    const dto: any = {};
    const get = (lower: string, upper: string) => {
      if (candidate === undefined || candidate === null) return undefined;
      if (candidate[lower] !== undefined) return candidate[lower];
      if (candidate[upper] !== undefined) return candidate[upper];
      return undefined;
    };

    const firstName = get('firstName', 'FirstName');
    if (firstName !== undefined) dto.FirstName = typeof firstName === 'string' ? firstName.trim() : firstName;

    const lastName = get('lastName', 'LastName');
    if (lastName !== undefined) dto.LastName = typeof lastName === 'string' ? lastName.trim() : lastName;

    const email = get('email', 'Email');
    if (email !== undefined) dto.Email = typeof email === 'string' ? email.trim() : email;

    const phone = get('phone', 'Phone');
    if (phone !== undefined) dto.Phone = typeof phone === 'string' ? phone.trim() : phone;

    const resumeUrl = get('resumeUrl', 'ResumeUrl');
    if (resumeUrl !== undefined) dto.ResumeUrl = typeof resumeUrl === 'string' ? resumeUrl.trim() : resumeUrl;

    const resumeHeadline = get('resumeHeadline', 'ResumeHeadline');
    if (resumeHeadline !== undefined) dto.ResumeHeadline = resumeHeadline;

    const keySkills = this.normalizeKeySkills(get('keySkills', 'KeySkills'));
    if (keySkills !== undefined) {
      // Keep as array for backend - do NOT convert to comma-separated string
      dto.KeySkills = Array.isArray(keySkills) ? keySkills : [keySkills];
    }

    const profileSummary = get('profileSummary', 'ProfileSummary');
    if (profileSummary !== undefined) dto.ProfileSummary = profileSummary;

    const accomplishments = get('accomplishments', 'Accomplishments');
    if (accomplishments !== undefined) dto.Accomplishments = accomplishments;

    const careerProfile = get('careerProfile', 'CareerProfile');
    if (careerProfile !== undefined) dto.CareerProfile = careerProfile;

    const personalDetails = get('personalDetails', 'PersonalDetails');
    if (personalDetails !== undefined) dto.PersonalDetails = personalDetails;

    // Add complex arrays
    const employment = get('employment', 'Employment');
    if (employment !== undefined) dto.Employment = employment;

    const education = get('education', 'Education');
    if (education !== undefined) dto.Education = education;

    const itSkills = get('itSkills', 'ItSkills') || get('itSkills', 'ITSkills');
    if (itSkills !== undefined) dto.ItSkills = itSkills;

    const projects = get('projects', 'Projects');
    if (projects !== undefined) dto.Projects = projects;

    if (options.includePassword) {
      const password = get('password', 'Password');
      if (password !== undefined) dto.Password = password;
    }

    if (options.includeId) {
      const id = get('id', 'Id');
      if (id !== undefined) dto.Id = id;
    }

    if (options.includeRowVersion) {
      const rowVersion = get('rowVersion', 'RowVersion');
      if (rowVersion !== undefined) dto.RowVersion = rowVersion;
    }

    return dto;
  }

  private normalizeKeySkills(value: any): string[] | string | undefined {
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) return value.map(v => `${v}`.trim()).filter(Boolean);
    if (typeof value === 'string') {
      const normalized = value
        .split(/[\r\n,;]+/)
        .map(s => s.trim())
        .filter(Boolean);
      return normalized.length ? normalized : undefined;
    }
    return `${value}`;
  }
}

