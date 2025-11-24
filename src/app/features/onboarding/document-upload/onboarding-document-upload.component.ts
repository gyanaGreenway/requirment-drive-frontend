import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { OnboardingDocument } from '../../../shared/models/onboarding.model';

type DocumentStatus = 'Awaiting upload' | 'Under review' | 'Accepted' | 'Flagged';

type DocumentFilter = 'all' | 'awaiting' | 'review' | 'accepted' | 'flagged';

// Use OnboardingDocument from shared/models/onboarding.model

@Component({
  selector: 'app-onboarding-document-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-document-upload.component.html',
  styleUrls: ['./onboarding-document-upload.component.css']
})
export class OnboardingDocumentUploadComponent implements OnInit {
  onboardingId: number = 0; // Set this dynamically as needed
  readonly visionStatement = 'Ensure every new hire lands on day one fully compliant, device-ready, and welcomed with zero paperwork surprises.';

  readonly filters: { id: DocumentFilter; label: string }[] = [
    { id: 'all', label: 'All requests' },
    { id: 'awaiting', label: 'Awaiting upload' },
    { id: 'review', label: 'In review' },
    { id: 'accepted', label: 'Accepted' },
    { id: 'flagged', label: 'Follow-ups' }
  ];

  selectedFilter: DocumentFilter = 'all';

  uploads: OnboardingDocument[] = [];
  loading = false;
  error: string | null = null;

  constructor(private onboardingService: OnboardingService) {}

  ngOnInit(): void {
    this.fetchDocuments();
  }

  fetchDocuments(): void {
    this.loading = true;
    this.onboardingService.getById(this.onboardingId).subscribe({
      next: (onboarding) => {
        this.uploads = onboarding.documents || [];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load documents.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  setFilter(filter: DocumentFilter): void {
    this.selectedFilter = filter;
  }

  get filteredUploads(): OnboardingDocument[] {
    // You may need to map status if your API uses different values
    return this.uploads;
  }

  get openRequests(): number {
    return this.uploads.length;
  }

  get awaitingUploads(): number {
    return 0;
  }

  get flaggedItems(): number {
    return 0;
  }

  get acceptedThisWeek(): number {
    return 0;
  }

  getStatusBadge(): string {
    return 'status-pill';
  }

  getDueLabel(upload: OnboardingDocument): string {
    return upload.uploadedAt ? `Uploaded ${upload.uploadedAt.toLocaleDateString()}` : 'Not uploaded';
  }

  getDueClass(upload: OnboardingDocument): string {
    return 'due';
  }

  isRequiredLabel(upload: OnboardingDocument): string {
    return 'Mandatory';
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
