import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type OfferStatus = 'Accepted' | 'Pending' | 'Negotiation' | 'Draft';
type OfferFilter = 'all' | 'accepted' | 'pending' | 'negotiation' | 'draft';

interface OfferLetter {
  id: string;
  candidate: string;
  role: string;
  recruiter: string;
  sentOn: Date;
  targetStart: Date;
  status: OfferStatus;
  lastTouched: Date;
  compensation: string;
  location: string;
  attachments: number;
  notes: string;
  acceptanceProbability: number; // 0-1 scale
  offerLink: string;
}

@Component({
  selector: 'app-offer-letters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offer-letters.component.html',
  styleUrls: ['./offer-letters.component.css']
})
export class OfferLettersComponent {
  readonly filters: { id: OfferFilter; label: string }[] = [
    { id: 'all', label: 'All offers' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'pending', label: 'Awaiting signature' },
    { id: 'negotiation', label: 'In negotiation' },
    { id: 'draft', label: 'Drafts' }
  ];

  selectedFilter: OfferFilter = 'all';

  readonly offers: OfferLetter[] = [
    {
      id: 'OFF-1021',
      candidate: 'Priya Sharma',
      role: 'Lead Data Analyst',
      recruiter: 'Anita Desai',
      sentOn: new Date('2025-11-18'),
      targetStart: new Date('2026-01-06'),
      status: 'Accepted',
      lastTouched: new Date('2025-11-21'),
      compensation: '₹28 LPA · 0.15% ESOP',
      location: 'Hybrid · Bengaluru',
      attachments: 3,
      notes: 'BGV underway. IT assets provisioning kicked off.',
      acceptanceProbability: 0.95,
      offerLink: 'https://example.com/offers/1021'
    },
    {
      id: 'OFF-1024',
      candidate: 'Martin Blake',
      role: 'QA Automation Engineer',
      recruiter: 'Divya Sinha',
      sentOn: new Date('2025-11-20'),
      targetStart: new Date('2026-01-20'),
      status: 'Negotiation',
      lastTouched: new Date('2025-11-22'),
      compensation: '$118K base · 10% bonus',
      location: 'Remote · US EST',
      attachments: 2,
      notes: 'Counter offer shared. Revisit salary band with finance.',
      acceptanceProbability: 0.6,
      offerLink: 'https://example.com/offers/1024'
    },
    {
      id: 'OFF-1026',
      candidate: 'Jessica Lee',
      role: 'Senior Product Manager',
      recruiter: 'Hrishikesh Rao',
      sentOn: new Date('2025-11-21'),
      targetStart: new Date('2026-02-03'),
      status: 'Pending',
      lastTouched: new Date('2025-11-21'),
      compensation: '$145K base · 15% bonus · 20K RSUs',
      location: 'Hybrid · Singapore',
      attachments: 4,
      notes: 'Candidate reviewing relocation benefits. Follow-up call Monday.',
      acceptanceProbability: 0.78,
      offerLink: 'https://example.com/offers/1026'
    },
    {
      id: 'OFF-1030',
      candidate: 'Nikhil Jain',
      role: 'Platform Architect',
      recruiter: 'Joel Mathews',
      sentOn: new Date('2025-11-23'),
      targetStart: new Date('2026-02-17'),
      status: 'Draft',
      lastTouched: new Date('2025-11-23'),
      compensation: '₹42 LPA · Joining bonus ₹3L',
      location: 'Remote · India',
      attachments: 1,
      notes: 'Waiting for final approval from CTO to send.',
      acceptanceProbability: 0.4,
      offerLink: 'https://example.com/offers/1030'
    }
  ];

  readonly statusThemes: Record<OfferStatus, string> = {
    Accepted: 'accepted',
    Pending: 'pending',
    Negotiation: 'negotiation',
    Draft: 'draft'
  };

  setFilter(filter: OfferFilter): void {
    this.selectedFilter = filter;
  }

  get filteredOffers(): OfferLetter[] {
    if (this.selectedFilter === 'all') {
      return this.offers;
    }
    return this.offers.filter(offer => offer.status.toLowerCase() === this.selectedFilter);
  }

  get totalOffers(): number {
    return this.offers.length;
  }

  get acceptedCount(): number {
    return this.offers.filter(offer => offer.status === 'Accepted').length;
  }

  get pendingCount(): number {
    return this.offers.filter(offer => offer.status === 'Pending').length;
  }

  get negotiationCount(): number {
    return this.offers.filter(offer => offer.status === 'Negotiation').length;
  }

  get draftCount(): number {
    return this.offers.filter(offer => offer.status === 'Draft').length;
  }

  get activePipelineValue(): string {
    const baseValues = this.offers
      .filter(offer => offer.status !== 'Draft')
      .map(offer => this.estimateValue(offer.compensation));
    const total = baseValues.reduce((acc, value) => acc + value, 0);
    return total ? this.formatCurrency(total) : '—';
  }

  get averageAcceptanceConfidence(): number {
    const activeOffers = this.offers.filter(offer => offer.status !== 'Draft');
    if (!activeOffers.length) {
      return 0;
    }
    const totalConfidence = activeOffers.reduce((acc, offer) => acc + offer.acceptanceProbability, 0);
    return Number(((totalConfidence / activeOffers.length) * 100).toFixed(0));
  }

  get daysSinceLastSend(): number {
    if (!this.offers.length) {
      return 0;
    }
    const mostRecent = this.offers
      .map(offer => offer.sentOn)
      .sort((a, b) => b.getTime() - a.getTime())[0];
    const diffInMs = new Date().getTime() - mostRecent.getTime();
    return Math.max(Math.floor(diffInMs / (1000 * 60 * 60 * 24)), 0);
  }

  getTimelineBadge(status: OfferStatus): string {
    return `status-pill status-pill--${this.statusThemes[status]}`;
  }

  getProbabilityWidth(probability: number): string {
    return `${Math.round(probability * 100)}%`;
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

    // Convert rupees to a comparable base (assuming ₹ to $ conversion placeholder 0.012).
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
