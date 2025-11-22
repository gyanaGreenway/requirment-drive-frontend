import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type DocumentStatus = 'Awaiting upload' | 'Under review' | 'Accepted' | 'Flagged';

type DocumentFilter = 'all' | 'awaiting' | 'review' | 'accepted' | 'flagged';

interface DocumentUploadRecord {
  id: string;
  candidate: string;
  role: string;
  document: string;
  track: string;
  status: DocumentStatus;
  dueDate: Date;
  uploadedOn?: Date;
  reviewer?: string;
  notes: string;
  required: boolean;
}

@Component({
  selector: 'app-onboarding-document-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-document-upload.component.html',
  styleUrls: ['./onboarding-document-upload.component.css']
})
export class OnboardingDocumentUploadComponent {
  readonly visionStatement = 'Ensure every new hire lands on day one fully compliant, device-ready, and welcomed with zero paperwork surprises.';

  readonly filters: { id: DocumentFilter; label: string }[] = [
    { id: 'all', label: 'All requests' },
    { id: 'awaiting', label: 'Awaiting upload' },
    { id: 'review', label: 'In review' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'flagged', label: 'Follow-ups' }
  ];

  selectedFilter: DocumentFilter = 'all';

  readonly uploads: DocumentUploadRecord[] = [
    {
      id: 'DOC-3018',
      candidate: 'Amit Verma',
      role: 'Backend Engineer · Bengaluru',
      document: 'Passport & Visa Copy',
      track: 'Pre-joining compliance',
      status: 'Awaiting upload',
      dueDate: new Date('2025-11-24'),
      reviewer: 'Sonia Mehta',
      notes: 'Share notarised digital copy. Reminder triggered last evening.',
      required: true
    },
    {
      id: 'DOC-3022',
      candidate: 'Sara Khan',
      role: 'Product Designer · Remote – Dubai',
      document: 'Education Certificates',
      track: 'Background verification',
      status: 'Under review',
      dueDate: new Date('2025-11-20'),
      uploadedOn: new Date('2025-11-18'),
      reviewer: 'Joel Mathews',
      notes: 'LMS ticket raised to validate design diploma.',
      required: true
    },
    {
      id: 'DOC-3031',
      candidate: 'Marcus Lee',
      role: 'Customer Success Lead · Singapore',
      document: 'Banking & Payroll Form',
      track: 'Payroll activation',
      status: 'Accepted',
      dueDate: new Date('2025-11-22'),
      uploadedOn: new Date('2025-11-19'),
      reviewer: 'Payroll Ops',
      notes: 'Verified by payroll on 19 Nov. Provide first-pay advisory pack.',
      required: true
    },
    {
      id: 'DOC-3038',
      candidate: 'Luis Romero',
      role: 'QA Automation Engineer · Remote – Mexico',
      document: 'Equipment Liability Agreement',
      track: 'IT enablement',
      status: 'Flagged',
      dueDate: new Date('2025-11-19'),
      uploadedOn: new Date('2025-11-17'),
      reviewer: 'Divya Sinha',
      notes: 'Signature mismatch detected. Re-upload requested.',
      required: true
    }
  ];

  setFilter(filter: DocumentFilter): void {
    this.selectedFilter = filter;
  }

  get filteredUploads(): DocumentUploadRecord[] {
    switch (this.selectedFilter) {
      case 'awaiting':
        return this.uploads.filter(upload => upload.status === 'Awaiting upload');
      case 'review':
        return this.uploads.filter(upload => upload.status === 'Under review');
      case 'accepted':
        return this.uploads.filter(upload => upload.status === 'Accepted');
      case 'flagged':
        return this.uploads.filter(upload => upload.status === 'Flagged');
      default:
        return this.uploads;
    }
  }

  get openRequests(): number {
    return this.uploads.filter(upload => upload.status !== 'Accepted').length;
  }

  get awaitingUploads(): number {
    return this.uploads.filter(upload => upload.status === 'Awaiting upload').length;
  }

  get flaggedItems(): number {
    return this.uploads.filter(upload => upload.status === 'Flagged').length;
  }

  get acceptedThisWeek(): number {
    const sevenDaysAgo = this.daysAgo(7);
    return this.uploads.filter(upload => upload.status === 'Accepted' && upload.uploadedOn && upload.uploadedOn >= sevenDaysAgo).length;
  }

  getStatusBadge(status: DocumentStatus): string {
    return `status-pill status-pill--${status.replace(/\s/g, '-').toLowerCase()}`;
  }

  getDueLabel(upload: DocumentUploadRecord): string {
    if (upload.status === 'Accepted') {
      return upload.uploadedOn ? `Accepted ${upload.uploadedOn.toLocaleDateString()}` : 'Accepted';
    }

    const days = this.daysUntil(upload.dueDate);
    if (days < 0) {
      return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
    }
    if (days === 0) {
      return 'Due today';
    }
    if (days === 1) {
      return 'Due tomorrow';
    }
    return `Due in ${days} days`;
  }

  getDueClass(upload: DocumentUploadRecord): string {
    if (upload.status === 'Accepted') {
      return 'due due--accepted';
    }
    const days = this.daysUntil(upload.dueDate);
    if (days < 0) {
      return 'due due--overdue';
    }
    if (days <= 2) {
      return 'due due--warning';
    }
    return 'due';
  }

  isRequiredLabel(upload: DocumentUploadRecord): string {
    return upload.required ? 'Mandatory' : 'Optional';
  }

  private daysUntil(date: Date): number {
    const today = this.startOfDay(new Date());
    const due = this.startOfDay(date);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  private daysAgo(days: number): Date {
    const today = this.startOfDay(new Date());
    return new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
