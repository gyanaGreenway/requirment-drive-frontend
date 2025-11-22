import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type TemplateCategory = 'Standard' | 'Executive' | 'Graduate' | 'Contract';
type TemplateStatus = 'Published' | 'Draft' | 'Needs Review';
type TemplateFilter = 'all' | 'published' | 'drafts' | 'needs-review';

interface OfferTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  lastUpdated: Date;
  owner: string;
  version: string;
  status: TemplateStatus;
  usageCountYtd: number;
  approvalWorkflow: string;
  linkedPolicies: number;
  description: string;
  nextReviewOn: Date;
}

@Component({
  selector: 'app-offer-templates',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './offer-templates.component.html',
  styleUrls: ['./offer-templates.component.css']
})
export class OfferTemplatesComponent {
  readonly filters: { id: TemplateFilter; label: string }[] = [
    { id: 'all', label: 'All templates' },
    { id: 'published', label: 'Published' },
    { id: 'drafts', label: 'Drafts' },
    { id: 'needs-review', label: 'Needs legal review' }
  ];

  selectedFilter: TemplateFilter = 'all';

  readonly templates: OfferTemplate[] = [
    {
      id: 'TMP-401',
      name: 'Engineering Standard',
      category: 'Standard',
      lastUpdated: new Date('2025-11-12T11:15:00'),
      owner: 'HR Ops',
      version: 'v5.2',
      status: 'Published',
      usageCountYtd: 42,
      approvalWorkflow: 'HR Ops → Finance → Legal',
      linkedPolicies: 5,
      description: 'Default template for IC roles across Engineering. Includes ESOP clause and hybrid work addendum.',
      nextReviewOn: new Date('2026-01-15')
    },
    {
      id: 'TMP-414',
      name: 'Executive Offer',
      category: 'Executive',
      lastUpdated: new Date('2025-11-03T09:45:00'),
      owner: 'HR Director',
      version: 'v2.7',
      status: 'Needs Review',
      usageCountYtd: 6,
      approvalWorkflow: 'CHRO → CEO → Legal',
      linkedPolicies: 8,
      description: 'Tailored package with retention bonus clause and relocation program details.',
      nextReviewOn: new Date('2025-12-05')
    },
    {
      id: 'TMP-422',
      name: 'Graduate / Intern Offer',
      category: 'Graduate',
      lastUpdated: new Date('2025-10-27T16:20:00'),
      owner: 'Campus Team',
      version: 'v3.0',
      status: 'Published',
      usageCountYtd: 58,
      approvalWorkflow: 'Campus Lead → HR Ops',
      linkedPolicies: 3,
      description: 'Includes internship stipend details and conversion bonus structure.',
      nextReviewOn: new Date('2026-02-01')
    },
    {
      id: 'TMP-437',
      name: 'Contract Specialist',
      category: 'Contract',
      lastUpdated: new Date('2025-11-18T13:05:00'),
      owner: 'Vendor Management',
      version: 'v1.4',
      status: 'Draft',
      usageCountYtd: 11,
      approvalWorkflow: 'Vendor Ops → Legal',
      linkedPolicies: 4,
      description: 'Statement of work and payment milestones embedded for short-term specialists.',
      nextReviewOn: new Date('2025-12-22')
    }
  ];

  setFilter(filter: TemplateFilter): void {
    this.selectedFilter = filter;
  }

  get filteredTemplates(): OfferTemplate[] {
    switch (this.selectedFilter) {
      case 'published':
        return this.templates.filter(template => template.status === 'Published');
      case 'drafts':
        return this.templates.filter(template => template.status === 'Draft');
      case 'needs-review':
        return this.templates.filter(template => template.status === 'Needs Review');
      default:
        return this.templates;
    }
  }

  get totalTemplates(): number {
    return this.templates.length;
  }

  get publishedCount(): number {
    return this.templates.filter(template => template.status === 'Published').length;
  }

  get pendingReviewCount(): number {
    return this.templates.filter(template => template.status === 'Needs Review').length;
  }

  get draftCount(): number {
    return this.templates.filter(template => template.status === 'Draft').length;
  }

  get avgUsage(): number {
    const total = this.templates.reduce((acc, template) => acc + template.usageCountYtd, 0);
    return this.templates.length ? Math.round(total / this.templates.length) : 0;
  }

  getNextReviewLabel(date: Date): string {
    const diffInDays = Math.ceil((date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays < 0) {
      return 'Review overdue';
    }
    if (diffInDays === 0) {
      return 'Review today';
    }
    if (diffInDays <= 14) {
      return `Review in ${diffInDays} days`;
    }
    return `Review on ${date.toLocaleDateString()}`;
  }

  getStatusBadge(status: TemplateStatus): string {
    return `status-pill status-pill--${status.replace(' ', '-').toLowerCase()}`;
  }
}
