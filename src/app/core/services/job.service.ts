import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import { Job, CreateJobDto, UpdateJobDto } from '../../shared/models/job.model';
import { PagedResult } from '../../shared/models/paged-result.model';

@Injectable({
  providedIn: 'root'
})
export class JobService {
  constructor(private api: ApiService) {}

  getJobs(pageNumber: number = 1, pageSize: number = 10): Observable<PagedResult<Job>> {
    return this.api.get<PagedResult<Job>>('Jobs', { pageNumber, pageSize });
  }

  // Public Jobs (non-authenticated listing for candidates)
  getPublicJobs(pageNumber: number = 1, pageSize: number = 10): Observable<PagedResult<Job>> {
    return this.api.get<PagedResult<Job>>('public/jobs', { pageNumber, pageSize });
  }

  getJob(id: number): Observable<Job> {
    return this.api.get<Job>(`Jobs/${id}`);
  }

  createJob(job: any): Observable<Job> {
    const dto = this.buildJobDto(job, { includeId: false, includeRowVersion: false });
    const payload = { createJobDto: dto };

    // Default: send DTO directly. If backend requires wrapper, retry with payload on 400.
    return this.api.post<Job>('Jobs', dto).pipe(
      catchError((err: any) => {
        if (this.shouldRetryWithWrapper(err, 'createjobdto')) {
          return this.api.post<Job>('Jobs', payload);
        }
        return throwError(() => err);
      })
    );
  }

  updateJob(job: UpdateJobDto | any): Observable<Job> {
    const dto = this.buildJobDto(job, { includeId: true, includeRowVersion: true });
    const resourceId = dto.Id ?? job?.id ?? job?.Id;
    if (resourceId === undefined || resourceId === null) {
      return throwError(() => new Error('Job id is required for update.'));
    }

    const payload = { updateJobDto: dto };

    return this.api.put<Job>(`Jobs/${resourceId}`, dto).pipe(
      catchError((err: any) => {
        if (this.shouldRetryWithWrapper(err, 'updatejobdto')) {
          return this.api.put<Job>(`Jobs/${resourceId}`, payload);
        }
        return throwError(() => err);
      })
    );
  }

  deleteJob(id: number): Observable<void> {
    return this.api.delete<void>(`Jobs/${id}`);
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

  private buildJobDto(job: any, options: { includeId?: boolean; includeRowVersion?: boolean } = {}): any {
    const dto: any = {};
    const get = (k1: string, k2: string) => {
      if (job === undefined || job === null) return undefined;
      if (job[k1] !== undefined) return job[k1];
      if (job[k2] !== undefined) return job[k2];
      return undefined;
    };

    const title = get('title', 'Title');
    if (title !== undefined) dto.Title = typeof title === 'string' ? title.trim() : title;

    const description = get('description', 'Description');
    if (description !== undefined) dto.Description = typeof description === 'string' ? description.trim() : description;

    const department = get('department', 'Department');
    if (department !== undefined) dto.Department = typeof department === 'string' ? department.trim() : department;

    const location = get('location', 'Location');
    if (location !== undefined) dto.Location = typeof location === 'string' ? location.trim() : location;

    const isActive = get('isActive', 'IsActive');
    if (isActive !== undefined) dto.IsActive = isActive;

    const salaryRange = get('salaryRange', 'SalaryRange');
    if (salaryRange !== undefined) dto.SalaryRange = salaryRange;

    const salary = get('salary', 'Salary');
    const parsedSalary = this.extractSalaryNumber(salary ?? salaryRange);
    if (salary !== undefined) {
      dto.Salary = typeof salary === 'number' ? salary : parsedSalary ?? salary;
    } else if (parsedSalary !== undefined) {
      dto.Salary = parsedSalary;
    }

    const requirements = this.normalizeRequirements(get('requirements', 'Requirements'));
    if (requirements !== undefined) dto.Requirements = requirements;

    const closingDate = this.normalizeDate(get('closingDate', 'ClosingDate'));
    if (closingDate !== undefined) dto.ClosingDate = closingDate;

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

  private normalizeRequirements(value: any): string[] | undefined {
    if (value === undefined || value === null) return undefined;
    let items: string[] = [];

    if (Array.isArray(value)) {
      items = value.map(v => `${v}`.trim()).filter(Boolean);
    } else if (typeof value === 'string') {
      const parts = value
        .split(/[\r\n,;]+/)
        .map((s: string) => s.trim())
        .filter(Boolean);
      items = parts;
    } else {
      return undefined;
    }

    return items;
  }

  private normalizeDate(value: any): string | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      const date = new Date(trimmed);
      return isNaN(date.getTime()) ? trimmed : date.toISOString();
    }
    if (typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    }
    return undefined;
  }

  private extractSalaryNumber(value: any): number | undefined {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'number' && !isNaN(value)) return value;
    const text = `${value}`;
    const match = text.match(/\d[\d,]*/);
    if (!match) return undefined;
    const digits = match[0].replace(/,/g, '');
    const parsed = parseInt(digits, 10);
    return isNaN(parsed) ? undefined : parsed;
  }
}

