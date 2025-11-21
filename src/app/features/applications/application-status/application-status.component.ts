import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../../core/services/application.service';
import { AuthService } from '../../../core/services/auth';
import {
  JobApplication,
  ApplicationStatus,
  UpdateApplicationStatusDto,
  ApplicationStatusHistory
} from '../../../shared/models/application.model';
import { APPLICATION_STATUS_LABELS } from '../../../shared/models/application-status-labels';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-application-status',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './application-status.component.html',
  styleUrls: ['./application-status.component.css']
})
export class ApplicationStatusComponent implements OnInit {
  application?: JobApplication;
  applicationId?: number;
  loading = false;
  error: string | null = null;
  submitting = false;
  historyLoading = false;
  history: ApplicationStatusHistory[] = [];
  
  newStatus?: ApplicationStatus;
  statusNotes = '';
  
  readonly statusEnum = ApplicationStatus;
  readonly statusJourney: ApplicationStatus[] = [
    ApplicationStatus.New,
    ApplicationStatus.Shortlisted,
    ApplicationStatus.Hired,
    ApplicationStatus.Rejected
  ];
  
  // Define which statuses in journey are mutually exclusive
  private readonly exclusiveStatuses = [
    [ApplicationStatus.Hired, ApplicationStatus.Rejected]
  ];
  readonly statusOptions: ApplicationStatus[] = [
    ApplicationStatus.New,
    ApplicationStatus.Shortlisted,
    ApplicationStatus.Rejected,
    ApplicationStatus.Hired
  ];
  readonly statusLabelLookup = APPLICATION_STATUS_LABELS;
  readonly statusTransitions: Record<ApplicationStatus, ApplicationStatus[]> = {
    [ApplicationStatus.New]: [ApplicationStatus.Shortlisted, ApplicationStatus.Rejected],
    [ApplicationStatus.Shortlisted]: [ApplicationStatus.Hired, ApplicationStatus.Rejected],
    [ApplicationStatus.Rejected]: [],
    [ApplicationStatus.Hired]: []
  };
  readonly statusOrdering: ApplicationStatus[] = [
    ApplicationStatus.New,
    ApplicationStatus.Shortlisted,
    ApplicationStatus.Rejected,
    ApplicationStatus.Hired
  ];

  constructor(
    private applicationService: ApplicationService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.applicationId = +params['id'];
      this.loadApplication();
    });
  }

  loadApplication(): void {
    if (!this.applicationId) return;
    this.loading = true;
    this.error = null;
    this.applicationService.getApplication(this.applicationId).subscribe({
      next: (application) => {
        this.application = this.hydrateApplication(application);
        this.loading = false;
        if (this.applicationId) {
          this.loadHistory(this.applicationId);
        }
      },
      error: (err) => {
        this.error = 'Failed to load application details.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  private loadHistory(applicationId: number): void {
    this.historyLoading = true;
    this.applicationService.getApplicationHistory(applicationId).subscribe({
      next: (history) => {
        const normalized = (history || []).map(item => this.hydrateHistoryItem(item));
        this.history = normalized.sort((a, b) => {
          const aTime = new Date(a.changedDate).getTime();
          const bTime = new Date(b.changedDate).getTime();
          return aTime - bTime;
        });
        this.historyLoading = false;
      },
      error: (err) => {
        console.error('Failed to load status history', err);
        this.history = [];
        this.historyLoading = false;
      }
    });
  }

  getAvailableStatuses(): ApplicationStatus[] {
    if (!this.application) return [];
    const key = this.toStatusKey(this.application.status);
    if (key === undefined) return [];
    return this.statusTransitions[key] || [];
  }

  canChangeStatus(): boolean {
    return this.getAvailableStatuses().length > 0;
  }

  updateStatus(): void {
    if (!this.applicationId || !this.newStatus) return;

    this.submitting = true;
    this.error = null;

    const currentUser = this.authService.getCurrentUser();
    const changedBy = currentUser?.email || currentUser?.username || 'HR Manager';

    const updateDto: UpdateApplicationStatusDto = {
      applicationId: this.applicationId,
      status: this.newStatus,
      notes: this.statusNotes,
      changedBy: changedBy
    };

    this.applicationService.updateApplicationStatus(updateDto).subscribe({
      next: () => {
        this.toast.success('Application status updated successfully.', 4000, true);
        this.loadApplication();
        this.newStatus = undefined;
        this.statusNotes = '';
        this.submitting = false;
      },
      error: (err) => {
        this.error = 'Failed to update application status. Please try again.';
        this.submitting = false;
        console.error(err);
      }
    });
  }

  getStatusClass(status: ApplicationStatus | string | number | undefined | null): string {
    const key = this.toStatusKey(status);
    switch (key) {
      case ApplicationStatus.New:
        return 'badge bg-primary';
      case ApplicationStatus.Shortlisted:
        return 'badge bg-info';
      case ApplicationStatus.Hired:
        return 'badge bg-success';
      case ApplicationStatus.Rejected:
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  backToList(): void {
    this.router.navigate(['/dashboard/applications']);
  }

  getStatusLabel(status: ApplicationStatus | string | number | undefined | null): string {
    const key = this.toStatusKey(status);
    if (key === undefined) return typeof status === 'string' ? status : 'Unknown';
    return this.statusLabelLookup[key] ?? String(key);
  }

  isStatusCompleted(status: ApplicationStatus): boolean {
    // Check if status is in history
    const historyMatch = this.history.some(entry => this.toStatusKey(entry.status) === status);
    if (historyMatch) return true;
    
    const current = this.toStatusKey(this.application?.status);
    if (current === undefined) return false;
    
    // If current status matches, it's completed
    if (current === status) return true;
    
    // Check if status is in an exclusive group with current status
    for (const group of this.exclusiveStatuses) {
      if (group.includes(status) && group.includes(current)) {
        // Only the current one is completed, not the other
        return false;
      }
    }
    
    // For sequential statuses (New, Shortlisted)
    const targetIndex = this.statusJourney.indexOf(status);
    const currentIndex = this.statusJourney.indexOf(current);
    
    if (targetIndex === -1 || currentIndex === -1) return false;
    
    // Only mark as completed if target comes before current in sequence
    // and target is before the branching point (Hired/Rejected)
    if (targetIndex < 2) { // New or Shortlisted
      return currentIndex >= targetIndex;
    }
    
    return false;
  }

  isStatusActive(status: ApplicationStatus): boolean {
    const current = this.toStatusKey(this.application?.status);
    return current === status;
  }

  getStatusDate(status: ApplicationStatus): Date | undefined {
    const entry = this.history.find(item => this.toStatusKey(item.status) === status);
    return entry ? new Date(entry.changedDate) : undefined;
  }

  private toStatusKey(status: ApplicationStatus | string | number | undefined | null): ApplicationStatus | undefined {
    if (status === undefined || status === null) return undefined;

    if (typeof status === 'number') {
      const numericStatus = status as ApplicationStatus;
      if (this.statusOrdering.includes(numericStatus)) {
        return numericStatus;
      }
      const zeroIndexed = Math.floor(status);
      if (zeroIndexed >= 0 && zeroIndexed < this.statusOrdering.length) {
        return this.statusOrdering[zeroIndexed];
      }
      const plusOne = zeroIndexed + 1;
      if (this.statusOrdering.includes(plusOne as ApplicationStatus)) {
        return plusOne as ApplicationStatus;
      }
      return undefined;
    }

    const statusStr = String(status).trim();
    if (!statusStr) return undefined;

    const numeric = Number(statusStr);
    if (!Number.isNaN(numeric)) {
      if (this.statusOrdering.includes(numeric as ApplicationStatus)) {
        return numeric as ApplicationStatus;
      }
      const zeroIndexed = Math.floor(numeric);
      if (zeroIndexed >= 0 && zeroIndexed < this.statusOrdering.length) {
        return this.statusOrdering[zeroIndexed];
      }
      const plusOne = zeroIndexed + 1;
      if (this.statusOrdering.includes(plusOne as ApplicationStatus)) {
        return plusOne as ApplicationStatus;
      }
      return undefined;
    }

    const lowered = statusStr.toLowerCase();
    const match = this.statusOrdering.find(item => this.statusLabelLookup[item].toLowerCase() === lowered || item.toString().toLowerCase() === lowered);
    return match;
  }

  private hydrateApplication(application: JobApplication): JobApplication {
    return {
      ...application,
      status: this.toStatusKey(application.status) ?? application.status,
      statusHistory: application.statusHistory?.map(history => this.hydrateHistoryItem(history))
    };
  }

  private hydrateHistoryItem(item: ApplicationStatusHistory): ApplicationStatusHistory {
    return {
      ...item,
      status: this.toStatusKey(item.status) ?? (item.status as ApplicationStatus),
      changedDate: item.changedDate instanceof Date ? item.changedDate : new Date(item.changedDate)
    };
  }
}

