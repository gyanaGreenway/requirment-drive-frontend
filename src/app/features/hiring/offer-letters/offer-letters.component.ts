import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfferService } from '../../../core/services/offer.service';
import { ToastService } from '../../../core/services/toast.service';
import { OfferLetter, OfferStatus } from '../../../shared/models/offer.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

type OfferViewFilter = 'all' | 'accepted' | 'pending' | 'negotiation' | 'draft';

@Component({
  selector: 'app-offer-letters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offer-letters.component.html',
  styleUrls: ['./offer-letters.component.css']
})
export class OfferLettersComponent implements OnInit {
  readonly filters: { id: OfferViewFilter; label: string }[] = [
    { id: 'all', label: 'All offers' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'pending', label: 'Awaiting signature' },
    { id: 'negotiation', label: 'In negotiation' },
    { id: 'draft', label: 'Drafts' }
  ];

  selectedFilter: OfferViewFilter = 'all';

  offers: OfferLetter[] = [];
  filteredOffers: OfferLetter[] = [];
  pagedResult: PagedResult<OfferLetter> | null = null;
  loading = false;
  error: string | null = null;
  lastRefreshed: Date | null = null;

  readonly statusThemes: Record<OfferStatus, string> = {
    Accepted: 'accepted',
    Pending: 'pending',
    Negotiation: 'negotiation',
    Draft: 'draft',
    Declined: 'declined',
    Withdrawn: 'withdrawn',
    Expired: 'expired'
  };

  constructor(private offersService: OfferService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers(): void {
    this.loading = true;
    this.error = null;
    this.offersService.getOffers({ pageNumber: 1, pageSize: 25 }).subscribe({
      next: result => {
        this.pagedResult = result;
        this.offers = (result.items ?? []).map(item => this.prepareOffer(item));
        this.lastRefreshed = new Date();
        this.applyFilter();
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load offer letters', err);
        this.error = 'Failed to load offer letters. Please try again.';
        this.toast.error(this.error, 4000, true);
        this.loading = false;
      }
    });
  }

  setFilter(filter: OfferViewFilter): void {
    if (this.selectedFilter === filter) return;
    this.selectedFilter = filter;
    this.applyFilter();
  }

  trackByOfferId(index: number, offer: OfferLetter): string {
    return offer?.id ?? `offer-${index}`;
  }

  get totalOffers(): number {
    return this.offers.length;
  }

  get acceptedCount(): number {
    return this.countOffersByStatus('Accepted');
  }

  get pendingCount(): number {
    return this.countOffersByStatus('Pending');
  }

  get negotiationCount(): number {
    return this.countOffersByStatus('Negotiation');
  }

  get draftCount(): number {
    return this.countOffersByStatus('Draft');
  }

  get activePipelineValue(): string {
    const baseValues = this.offers
      .filter(offer => offer.status !== 'Draft')
      .map(offer => this.estimateValue(offer.compensation ?? ''));
    const total = baseValues.reduce((acc, value) => acc + value, 0);
    return total ? this.formatCurrency(total) : '—';
  }

  get averageAcceptanceConfidence(): number {
    const activeOffers = this.offers.filter(offer => offer.status !== 'Draft');
    if (!activeOffers.length) {
      return 0;
    }
    const totalConfidence = activeOffers.reduce((acc, offer) => acc + (offer.acceptanceProbability ?? 0), 0);
    return Number(((totalConfidence / activeOffers.length) * 100).toFixed(0));
  }

  get daysSinceLastSend(): number {
    if (!this.offers.length) {
      return 0;
    }
    const mostRecent = this.offers
      .map(offer => this.toDate(offer.sentOn))
      .filter((date): date is Date => !!date)
      .sort((a, b) => b.getTime() - a.getTime())[0];
    if (!mostRecent) {
      return 0;
    }
    const diffInMs = new Date().getTime() - mostRecent.getTime();
    return Math.max(Math.floor(diffInMs / (1000 * 60 * 60 * 24)), 0);
  }

  getTimelineBadge(status: OfferStatus | string | null | undefined): string {
    const normalized = this.normalizeOfferStatus(status);
    const theme = this.statusThemes[normalized] ?? 'pending';
    return `status-pill status-pill--${theme}`;
  }

  getProbabilityWidth(probability: number | null | undefined): string {
    return `${Math.round((probability ?? 0) * 100)}%`;
  }

  getAcceptancePercent(probability: number | null | undefined): number {
    return Math.round((probability ?? 0) * 100);
  }

  private applyFilter(): void {
    if (this.selectedFilter === 'all') {
      this.filteredOffers = [...this.offers];
      return;
    }

    this.filteredOffers = this.offers.filter(offer => this.mapStatusToFilter(offer.status) === this.selectedFilter);
  }

  private countOffersByStatus(status: OfferStatus): number {
    return this.offers.filter(offer => this.normalizeOfferStatus(offer.status) === status).length;
  }

  private prepareOffer(offer: OfferLetter): OfferLetter {
    const normalizedStatus = this.normalizeOfferStatus(offer.status);
    const candidateName = offer.candidateName?.trim() || 'Unknown candidate';
    const recruiterName = (offer.recruiter ?? offer.recruiterName ?? '').toString().trim() || 'Hiring team';
    const notesValue = typeof offer.notes === 'string' ? offer.notes.trim() : '';

    return {
      ...offer,
      candidateName,
      recruiter: recruiterName,
      recruiterName,
      status: normalizedStatus,
      sentOn: this.toDate(offer.sentOn),
      targetStart: this.toDate(offer.targetStart),
      lastTouched: this.toDate(offer.lastTouched),
      acceptanceProbability: this.normalizeProbability(offer.acceptanceProbability),
      attachments: offer.attachments ?? 0,
      compensation: offer.compensation ?? '—',
      location: offer.location ?? '—',
      notes: notesValue || 'No notes added yet.',
      offerLink: offer.offerLink ?? undefined
    };
  }

  private mapStatusToFilter(status: OfferStatus | string | null | undefined): OfferViewFilter {
    const normalized = this.normalizeOfferStatus(status);
    switch (normalized) {
      case 'Accepted':
        return 'accepted';
      case 'Negotiation':
        return 'negotiation';
      case 'Draft':
        return 'draft';
      case 'Pending':
      default:
        return 'pending';
    }
  }

  private normalizeOfferStatus(status: OfferStatus | string | null | undefined): OfferStatus {
    if (!status) {
      return 'Pending';
    }
    const text = status.toString().trim().toLowerCase();
    const lookup: Record<string, OfferStatus> = {
      accepted: 'Accepted',
      signed: 'Accepted',
      pending: 'Pending',
      awaiting: 'Pending',
      negotiation: 'Negotiation',
      negotiating: 'Negotiation',
      draft: 'Draft',
      drafted: 'Draft',
      declined: 'Declined',
      rejected: 'Declined',
      withdrawn: 'Withdrawn',
      rescinded: 'Withdrawn',
      expired: 'Expired',
      lapsed: 'Expired'
    };
    return lookup[text] ?? 'Pending';
  }

  private normalizeProbability(probability: number | string | null | undefined): number {
    if (probability === null || probability === undefined) {
      return 0;
    }
    if (typeof probability === 'string') {
      const trimmed = probability.trim();
      if (!trimmed) return 0;
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
      return 0;
    }
    if (typeof probability === 'number') {
      return this.clampProbability(probability > 1 ? probability / 100 : probability);
    }
    return 0;
  }

  private toDate(value: Date | string | null | undefined): Date | null {
    if (!value) return null;
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  private clampProbability(value: number): number {
    if (!Number.isFinite(value)) {
      return 0;
    }
    return Math.max(0, Math.min(1, value));
  }

  private estimateValue(compensation: string): number {
    const match = compensation.match(/([₹$£€]?)([\d,.]+)\s*(LPA|K|M|)/i);
    if (!match) {
      return 0;
    }
    const symbol = match[1];
    const rawValue = Number(match[2].replace(/,/g, ''));
    const unit = match[3]?.toUpperCase() ?? '';

    const multiplier = unit === 'LPA' ? 100000 : unit === 'K' ? 1000 : unit === 'M' ? 1000000 : 1;
    const value = rawValue * multiplier;

    if (symbol === '₹') {
      return value * 0.012;
    }

    return value;
  }

  private formatCurrency(amount: number): string {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M pipeline`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K pipeline`;
    }
    return `$${amount.toFixed(0)} pipeline`;
  }
}
