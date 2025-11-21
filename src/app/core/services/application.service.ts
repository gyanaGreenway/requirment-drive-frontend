import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  JobApplication,
  CreateApplicationDto,
  UpdateApplicationStatusDto,
  ApplicationFilter,
  ApplicationStatusHistory,
  ApplicationStatus
} from '../../shared/models/application.model';
import { APPLICATION_STATUS_LABELS } from '../../shared/models/application-status-labels';
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

  createPublicApplication(application: any): Observable<JobApplication> {
    // Use the full public endpoint path
    return this.api.post<JobApplication>('Applications/public', application);
  }

  updateApplicationStatus(update: UpdateApplicationStatusDto | any): Observable<JobApplication> {
    const dto = this.buildStatusUpdateDto(update, { statusAsNumber: true });
    const resourceId = this.resolveApplicationId(update);
    if (resourceId === undefined || resourceId === null) {
      return throwError(() => new Error('Application id is required to update status.'));
    }

    const url = `Applications/${resourceId}/status`;
    const payload = this.wrapDto(dto, 'updateDto');

    return this.api.put<JobApplication>(url, dto).pipe(
      catchError(err => {
        if (this.shouldRetryWithWrapper(err, 'updatedto')) {
          return this.api.put<JobApplication>(url, payload).pipe(
            catchError(innerErr => {
              if (this.shouldRetryWithStatusConversion(innerErr)) {
                const numericDto = this.buildStatusUpdateDto(update, { statusAsNumber: true });
                const numericPayload = this.wrapDto(numericDto, 'updateDto');
                return this.api.put<JobApplication>(url, numericPayload);
              }
              return throwError(() => innerErr);
            })
          );
        }

        if (this.shouldRetryWithStatusConversion(err)) {
          const numericDto = this.buildStatusUpdateDto(update, { statusAsNumber: true });
          const numericPayload = this.wrapDto(numericDto, 'updateDto');
          return this.api.put<JobApplication>(url, numericPayload);
        }

        return throwError(() => err);
      })
    );
  }

  private resolveApplicationId(update: any): number | undefined {
    if (!update) return undefined;
    const candidates = ['applicationId', 'ApplicationId', 'id', 'Id'];
    for (const key of candidates) {
      if (update[key] !== undefined && update[key] !== null) {
        const parsed = Number(update[key]);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
    }
    return undefined;
  }

  private wrapDto<T>(dto: T, key: string): any {
    const pascalKey = this.capitalizeFirstLetter(key);
    return {
      [key]: dto,
      [pascalKey]: dto
    };
  }

  private capitalizeFirstLetter(value: string): string {
    if (!value) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private buildStatusUpdateDto(update: any, options: { statusAsNumber?: boolean } = {}): any {
    const dto: any = {};
    const get = (keys: string[]): any => {
      if (!update) return undefined;
      for (const key of keys) {
        if (update[key] !== undefined && update[key] !== null) {
          return update[key];
        }
      }
      return undefined;
    };

    const applicationId = get(['applicationId', 'ApplicationId', 'id', 'Id']);
    if (applicationId !== undefined) {
      const parsed = Number(applicationId);
      const idValue = Number.isNaN(parsed) ? applicationId : parsed;
      dto.applicationId = idValue;
      dto.ApplicationId = idValue;
    }

    const status = get(['status', 'Status']);
    const normalizedStatus = this.normalizeStatusValue(status, !!options.statusAsNumber);
    if (normalizedStatus !== undefined) {
      dto.status = normalizedStatus;
      dto.Status = normalizedStatus;
    }

    const notes = get(['notes', 'Notes']);
    if (notes !== undefined) {
      const trimmed = typeof notes === 'string' ? notes.trim() : notes;
      dto.notes = trimmed;
      dto.Notes = trimmed;
    }

    const rowVersion = get(['rowVersion', 'RowVersion']);
    if (rowVersion !== undefined) {
      dto.rowVersion = rowVersion;
      dto.RowVersion = rowVersion;
    }

    return dto;
  }

  private normalizeStatusValue(value: any, asNumber: boolean): ApplicationStatus | number | undefined {
    if (value === undefined || value === null) return undefined;

    if (asNumber) {
      return this.toStatusNumber(value);
    }

    const statusNumber = this.toStatusNumber(value);
    return statusNumber;
  }

  private toStatusNumber(value: any): ApplicationStatus | undefined {
    if (value === undefined || value === null) return undefined;

    if (typeof value === 'number') {
      return this.normalizeNumericStatus(value);
    }

    const text = String(value).trim();
    if (!text) return undefined;

    const numeric = Number(text);
    if (!Number.isNaN(numeric)) {
      const normalizedNumeric = this.normalizeNumericStatus(numeric);
      if (normalizedNumeric !== undefined) {
        return normalizedNumeric;
      }
    }

    const lower = text.toLowerCase();
    if (this.statusNameLookup.has(lower)) {
      return this.statusNameLookup.get(lower);
    }

    return undefined;
  }

  private normalizeNumericStatus(value: number): ApplicationStatus | undefined {
    const rounded = Math.trunc(value);
    if (this.statusValues.includes(rounded as ApplicationStatus)) {
      return rounded as ApplicationStatus;
    }

    if (rounded >= 0 && rounded < this.zeroIndexedStatusOrder.length) {
      return this.zeroIndexedStatusOrder[rounded];
    }

    const plusOne = rounded + 1;
    if (this.statusValues.includes(plusOne as ApplicationStatus)) {
      return plusOne as ApplicationStatus;
    }

    return undefined;
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

  private shouldRetryWithStatusConversion(err: any): boolean {
    if (!err || err.status !== 400) return false;
    try {
      const raw = err?.error ?? err;
      const hint = 'could not be converted to';
      if (raw && typeof raw === 'object') {
        if (raw.errors) {
          const errorsJson = JSON.stringify(raw.errors).toLowerCase();
          if (errorsJson.includes('status') && errorsJson.includes(hint)) {
            return true;
          }
        }
        const serialized = JSON.stringify(raw || {}).toLowerCase();
        return serialized.includes(hint) && serialized.includes('status');
      }
      const text = typeof raw === 'string' ? raw.toLowerCase() : '';
      return text.includes(hint) && text.includes('status');
    } catch {
      return false;
    }
  }

  private readonly statusValues: ApplicationStatus[] = [
    ApplicationStatus.New,
    ApplicationStatus.Shortlisted,
    ApplicationStatus.Rejected,
    ApplicationStatus.Hired
  ];

  private readonly zeroIndexedStatusOrder: ApplicationStatus[] = [
    ApplicationStatus.New,
    ApplicationStatus.Shortlisted,
    ApplicationStatus.Rejected,
    ApplicationStatus.Hired
  ];

  private readonly statusNameLookup: Map<string, ApplicationStatus> = (() => {
    const lookup = new Map<string, ApplicationStatus>();
    this.statusValues.forEach(status => {
      lookup.set(status.toString().toLowerCase(), status);
    });
    Object.entries(APPLICATION_STATUS_LABELS).forEach(([statusKey, label]) => {
      const numericKey = Number(statusKey) as ApplicationStatus;
      lookup.set(label.toLowerCase(), numericKey);
    });
    return lookup;
  })();

  getApplicationHistory(applicationId: number): Observable<ApplicationStatusHistory[]> {
    return this.api.get<ApplicationStatusHistory[]>(`Applications/${applicationId}/history`);
  }
}

