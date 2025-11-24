import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterviewService } from '../../../core/services/interview.service';
import { InterviewFeedbackEntry } from '../../../shared/models/interview.model';

type FeedbackFilter = 'all' | 'pending-action' | 'ready-for-offer' | 'needs-alignment';

@Component({
  selector: 'app-interview-feedback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interview-feedback.component.html',
  styleUrls: ['./interview-feedback.component.css']
})
export class InterviewFeedbackComponent implements OnInit {
  filters: { id: FeedbackFilter; label: string }[] = [
    { id: 'all', label: 'All feedback' },
    { id: 'pending-action', label: 'Pending action' },
    { id: 'ready-for-offer', label: 'Ready for offer' },
    { id: 'needs-alignment', label: 'Needs panel alignment' }
  ];

  selectedFilter: FeedbackFilter = 'all';
  feedbackEntries: InterviewFeedbackEntry[] = [];
  loading = false;
  error: string | null = null;

  constructor(private interviewService: InterviewService) {}

  ngOnInit(): void {
    this.loadFeedback();
  }

  get filteredFeedback(): InterviewFeedbackEntry[] {
    switch (this.selectedFilter) {
      case 'pending-action':
        return this.feedbackEntries.filter(entry => entry.status === 'Pending decision');
      case 'ready-for-offer':
        return this.feedbackEntries.filter(entry => entry.status === 'Offer in progress');
      case 'needs-alignment':
        return this.feedbackEntries.filter(entry => entry.status === 'Awaiting panel sync');
      default:
        return this.feedbackEntries;
    }
  }

  get averageScore(): number {
    const total = this.feedbackEntries.reduce((acc, entry) => acc + entry.score, 0);
    return this.feedbackEntries.length ? Number((total / this.feedbackEntries.length).toFixed(1)) : 0;
  }

  get offerReadyCount(): number {
    return this.feedbackEntries.filter(entry => entry.status === 'Offer in progress').length;
  }

  get pendingCount(): number {
    return this.feedbackEntries.filter(entry => entry.status === 'Pending decision').length;
  }

  get alignmentNeededCount(): number {
    return this.feedbackEntries.filter(entry => entry.status === 'Awaiting panel sync').length;
  }

  setFilter(filter: FeedbackFilter): void {
    if (this.selectedFilter === filter) {
      return;
    }
    this.selectedFilter = filter;
    this.loadFeedback();
  }

  getScoreBadge(score: number): 'success' | 'warning' | 'danger' {
    if (score >= 4.5) {
      return 'success';
    }
    if (score >= 3.3) {
      return 'warning';
    }
    return 'danger';
  }

  getVerdictEmoji(verdict: InterviewFeedbackEntry['verdict']): string {
    switch (verdict) {
      case 'Advance':
        return '🚀';
      case 'Hold for next round':
        return '⏳';
      default:
        return '⚠️';
    }
  }

  reload(): void {
    this.loadFeedback();
  }

  trackById(index: number, entry: InterviewFeedbackEntry): string {
    return entry.id;
  }

  private loadFeedback(): void {
    this.loading = true;
    this.error = null;
    const statusFilter = this.getStatusFilter(this.selectedFilter);

    this.interviewService.getFeedbackEntries({ status: statusFilter }).subscribe({
      next: entries => {
        this.feedbackEntries = entries;
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load interview feedback', err);
        this.error = 'Unable to load feedback entries. Please try again shortly.';
        this.feedbackEntries = [];
        this.loading = false;
      }
    });
  }

  private getStatusFilter(filter: FeedbackFilter): string | undefined {
    switch (filter) {
      case 'pending-action':
        return 'Pending decision';
      case 'ready-for-offer':
        return 'Offer in progress';
      case 'needs-alignment':
        return 'Awaiting panel sync';
      default:
        return undefined;
    }
  }
}
