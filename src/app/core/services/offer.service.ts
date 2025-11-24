import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { OfferFilter, OfferLetter, OfferStatus } from '../../shared/models/offer.model';
import { PagedResult } from '../../shared/models/paged-result.model';

@Injectable({ providedIn: 'root' })
export class OfferService {
  private readonly endpointVariants = ['Offers', 'offers', 'OfferLetters', 'offer-letters', 'hiring/offers'];

  constructor(private api: ApiService) {}

  getOffers(filter: OfferFilter = {}): Observable<PagedResult<OfferLetter>> {
    const params = this.buildParams(filter);
    return this.tryEndpoints<PagedResult<any>>(this.endpointVariants, params).pipe(
      map(result => this.normalizeResult(result))
    );
  }

  private tryEndpoints<T>(endpoints: string[], params: Record<string, any>): Observable<T> {
    if (!endpoints.length) {
      return throwError(() => new Error('No offer endpoint responded successfully.'));
    }

    const [current, ...rest] = endpoints;
    return this.api.get<T>(current, params).pipe(
      catchError(err => {
        if (err?.status === 404 || err?.status === 405) {
          return this.tryEndpoints<T>(rest, params);
        }
        return throwError(() => err);
      })
    );
  }

  private buildParams(filter: OfferFilter): Record<string, any> {
    const params: Record<string, any> = {
      pageNumber: filter.pageNumber ?? 1,
      pageSize: filter.pageSize ?? 20
    };

    if (filter.status) params['status'] = filter.status;
    if (filter.recruiterId) params['recruiterId'] = filter.recruiterId;
    if (filter.candidateId) params['candidateId'] = filter.candidateId;
    if (filter.jobId) params['jobId'] = filter.jobId;
    if (filter.searchTerm) params['searchTerm'] = filter.searchTerm.trim();
    if (filter.startDate) params['startDate'] = filter.startDate;
    if (filter.endDate) params['endDate'] = filter.endDate;
    if (filter.sortBy) params['sortBy'] = filter.sortBy;
    if (filter.sortOrder) params['sortOrder'] = filter.sortOrder;

    return params;
  }

  private normalizeResult(raw: any): PagedResult<OfferLetter> {
    if (!raw) {
      return {
        items: [],
        totalCount: 0,
        totalPages: 0,
        pageNumber: 1,
        pageSize: 0,
        hasPreviousPage: false,
        hasNextPage: false
      } as PagedResult<OfferLetter>;
    }

    if (Array.isArray(raw)) {
      const items = raw.map(item => this.normalizeOffer(item));
      return {
        items,
        totalCount: items.length,
        totalPages: 1,
        pageNumber: 1,
        pageSize: items.length,
        hasPreviousPage: false,
        hasNextPage: false
      } as PagedResult<OfferLetter>;
    }

    const items = (raw.items ?? raw.results ?? raw.data ?? []).map((item: any) => this.normalizeOffer(item));
    const totalCount = raw.totalCount ?? raw.total ?? items.length;
    const totalPages = raw.totalPages ?? raw.pages ?? 1;
    const pageNumber = raw.pageNumber ?? raw.currentPage ?? 1;
    const pageSize = raw.pageSize ?? raw.pageLength ?? items.length;
    const hasPreviousPage = raw.hasPreviousPage ?? raw.hasPrev ?? pageNumber > 1;
    const hasNextPage = raw.hasNextPage ?? raw.hasMore ?? pageNumber < totalPages;

    return {
      items,
      totalCount,
      totalPages,
      pageNumber,
      pageSize,
      hasPreviousPage,
      hasNextPage
    } as PagedResult<OfferLetter>;
  }

  private normalizeOffer(raw: any): OfferLetter {
    const candidate = raw?.candidate ?? raw?.Candidate ?? {};
    const recruiter = raw?.recruiter ?? raw?.Recruiter ?? {};

    const offer: OfferLetter = {
      id: this.resolveId(raw),
      candidateId: this.toNumber(candidate?.id ?? candidate?.Id ?? raw?.candidateId ?? raw?.CandidateId),
      candidateName: this.resolveCandidateName(raw, candidate),
      candidateEmail: candidate?.email ?? candidate?.Email ?? raw?.candidateEmail ?? raw?.CandidateEmail ?? null,
      jobId: this.toNumber(raw?.jobId ?? raw?.JobId ?? raw?.job?.id ?? raw?.Job?.Id),
      role: raw?.role ?? raw?.Role ?? raw?.jobTitle ?? raw?.JobTitle ?? raw?.job?.title ?? raw?.Job?.Title ?? '—',
      recruiter: recruiter?.name ?? recruiter?.Name ?? recruiter?.fullName ?? recruiter?.FullName ?? raw?.recruiter ?? raw?.Recruiter ?? null,
      recruiterId: this.toNumber(recruiter?.id ?? recruiter?.Id ?? raw?.recruiterId ?? raw?.RecruiterId),
      recruiterName: recruiter?.fullName ?? recruiter?.FullName ?? recruiter?.name ?? recruiter?.Name ?? raw?.recruiterName ?? raw?.RecruiterName ?? null,
      sentOn: this.toDate(raw?.sentOn ?? raw?.SentOn ?? raw?.sentDate ?? raw?.SentDate),
      targetStart: this.toDate(raw?.targetStart ?? raw?.TargetStart ?? raw?.startDate ?? raw?.StartDate ?? raw?.proposedStart ?? raw?.ProposedStart),
      status: this.normalizeStatus(raw?.status ?? raw?.Status),
      lastTouched: this.toDate(raw?.lastTouched ?? raw?.LastTouched ?? raw?.updatedAt ?? raw?.UpdatedAt ?? raw?.lastUpdated ?? raw?.LastUpdated),
      compensation: raw?.compensation ?? raw?.Compensation ?? raw?.package ?? raw?.Package ?? null,
      location: raw?.location ?? raw?.Location ?? raw?.jobLocation ?? raw?.JobLocation ?? null,
      attachments: this.toNumber(raw?.attachments ?? raw?.Attachments ?? raw?.documentsCount ?? raw?.DocumentsCount),
      notes: raw?.notes ?? raw?.Notes ?? raw?.comment ?? raw?.Comment ?? null,
      acceptanceProbability: this.toProbability(raw?.acceptanceProbability ?? raw?.AcceptanceProbability ?? raw?.probability ?? raw?.Probability ?? raw?.likelihood ?? raw?.Likelihood),
      offerLink: raw?.offerLink ?? raw?.OfferLink ?? raw?.documentUrl ?? raw?.DocumentUrl ?? raw?.url ?? raw?.Url ?? null,
      metadata: raw?.metadata ?? raw?.Metadata ?? undefined
    };

    if (!offer.recruiter && offer.recruiterName) {
      offer.recruiter = offer.recruiterName;
    }

    return offer;
  }

  private resolveId(raw: any): string {
    const candidates = [raw?.id, raw?.Id, raw?.offerId, raw?.OfferId, raw?.code, raw?.Code];
    for (const candidate of candidates) {
      if (candidate !== undefined && candidate !== null) {
        return String(candidate);
      }
    }
    return `offer-${Math.random().toString(36).slice(2, 10)}`;
  }

  private resolveCandidateName(raw: any, candidate: any): string {
    const first = candidate?.firstName ?? candidate?.FirstName ?? raw?.candidateFirstName ?? raw?.CandidateFirstName;
    const last = candidate?.lastName ?? candidate?.LastName ?? raw?.candidateLastName ?? raw?.CandidateLastName;
    const full = candidate?.fullName ?? candidate?.FullName ?? raw?.candidateName ?? raw?.CandidateName ?? raw?.candidate;
    const name = [first, last].filter(Boolean).join(' ').trim();
    if (name) return name;
    if (typeof full === 'string' && full.trim()) return full.trim();
    return 'Unknown candidate';
  }

  private normalizeStatus(value: any): OfferStatus {
    if (value === null || value === undefined) {
      return 'Pending';
    }

    if (typeof value === 'number') {
      return this.statusFromNumeric(value);
    }

    const text = String(value).trim().toLowerCase();
    if (!text) {
      return 'Pending';
    }

    const lookup: Record<string, OfferStatus> = {
      accepted: 'Accepted',
      signed: 'Accepted',
      completed: 'Accepted',
      pending: 'Pending',
      awaiting: 'Pending',
      negotiation: 'Negotiation',
      negotiating: 'Negotiation',
      draft: 'Draft',
      drafted: 'Draft',
      reviewing: 'Draft',
      declined: 'Declined',
      rejected: 'Declined',
      withdrawn: 'Withdrawn',
      rescinded: 'Withdrawn',
      expired: 'Expired',
      lapsed: 'Expired'
    };

    if (lookup[text]) {
      return lookup[text];
    }

    if (text.includes('sign')) {
      return 'Accepted';
    }

    if (text.includes('nego')) {
      return 'Negotiation';
    }

    if (text.includes('draft')) {
      return 'Draft';
    }

    if (text.includes('declin')) {
      return 'Declined';
    }

    return 'Pending';
  }

  private statusFromNumeric(value: number): OfferStatus {
    const normalized = Math.trunc(value);
    const mapping: Record<number, OfferStatus> = {
      0: 'Draft',
      1: 'Pending',
      2: 'Negotiation',
      3: 'Accepted',
      4: 'Declined',
      5: 'Withdrawn'
    };
    return mapping[normalized] ?? 'Pending';
  }

  private toNumber(value: any): number | undefined {
    if (value === null || value === undefined) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private toDate(value: any): Date | null {
    if (!value) return null;
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value;
    }
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  private toProbability(value: any): number | null {
    if (value === null || value === undefined) {
      return null;
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return null;
      if (trimmed.endsWith('%')) {
        const numeric = parseFloat(trimmed.slice(0, -1));
        if (!Number.isNaN(numeric)) {
          return this.clampProbability(numeric / 100);
        }
      }
      const parsed = parseFloat(trimmed);
      if (!Number.isNaN(parsed)) {
        return this.clampProbability(parsed > 1 ? parsed / 100 : parsed);
      }
      return null;
    }

    if (typeof value === 'number') {
      return this.clampProbability(value > 1 ? value / 100 : value);
    }

    return null;
  }

  private clampProbability(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.max(0, Math.min(1, value));
  }
}
