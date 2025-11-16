import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { 
  JobApplication, 
  CreateApplicationDto, 
  UpdateApplicationStatusDto,
  ApplicationFilter 
} from '../../shared/models/application.model';
import { PagedResult } from '../../shared/models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  constructor(private api: ApiService) {}

  getApplications(filter: ApplicationFilter = {}): Observable<PagedResult<JobApplication>> {
    const params: any = {
      pageNumber: filter.pageNumber || 1,
      pageSize: filter.pageSize || 10
    };

    if (filter.status) params.status = filter.status;
    if (filter.jobId) params.jobId = filter.jobId;
    if (filter.candidateId) params.candidateId = filter.candidateId;
    if (filter.startDate) params.startDate = filter.startDate;
    if (filter.endDate) params.endDate = filter.endDate;
    if (filter.sortBy) params.sortBy = filter.sortBy;
    if (filter.sortOrder) params.sortOrder = filter.sortOrder;

    return this.api.get<PagedResult<JobApplication>>('applications', params);
  }

  getApplication(id: number): Observable<JobApplication> {
    return this.api.get<JobApplication>(`applications/${id}`);
  }

  createApplication(application: CreateApplicationDto): Observable<JobApplication> {
    return this.api.post<JobApplication>('applications', application);
  }

  updateApplicationStatus(update: UpdateApplicationStatusDto): Observable<JobApplication> {
    return this.api.put<JobApplication>(`applications/${update.applicationId}/status`, update);
  }
}

