import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../../core/services/application.service';
import { JobService } from '../../../core/services/job.service';
import { CandidateService } from '../../../core/services/candidate.service';
import { AuthService } from '../../../core/services/auth';
import { JobApplication, ApplicationStatus } from '../../../shared/models/application.model';
import { APPLICATION_STATUS_LABELS } from '../../../shared/models/application-status-labels';
import { Job } from '../../../shared/models/job.model';
import { Candidate } from '../../../shared/models/candidate.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

@Component({
  selector: 'app-candidate-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './candidate-dashboard.component.html',
  styleUrls: ['./candidate-dashboard.component.css']
})
export class CandidateDashboardComponent implements OnInit {
  candidateId: number | null = null;
  candidate: Candidate | null = null;
  applications: JobApplication[] = [];
  jobs: Map<number, Job> = new Map();
  selectedApplication: JobApplication | null = null;
  showDropdown = false;
  
  stats = {
    totalApplications: 0,
    newApplications: 0,
    shortlistedApplications: 0,
    rejectedApplications: 0,
    hiredApplications: 0
  };

  loading = false;
  error: string | null = null;
  selectedStatus?: ApplicationStatus;

  // Session warning
  sessionMinutesLeft: number | null = null;
  showSessionBanner = false;
  
  ApplicationStatus = ApplicationStatus;
  statusFilterOptions = [
    { value: undefined, label: 'All Statuses' },
    { value: ApplicationStatus.New, label: 'Under Review' },
    { value: ApplicationStatus.Shortlisted, label: 'Interview Scheduled' },
    { value: ApplicationStatus.Hired, label: 'Offer' },
    { value: ApplicationStatus.Rejected, label: 'Rejected' }
  ];
  private readonly statusOrdering: ApplicationStatus[] = [
    ApplicationStatus.New,
    ApplicationStatus.Shortlisted,
    ApplicationStatus.Rejected,
    ApplicationStatus.Hired
  ];
  private readonly statusLookup = this.buildStatusLookup();

  constructor(
    private applicationService: ApplicationService,
    private jobService: JobService,
    private candidateService: CandidateService,
    private authService: AuthService,
    private router: Router
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile-wrapper') && !target.closest('.profile-dropdown')) {
      this.showDropdown = false;
    }
  }

  ngOnInit(): void {
    // Get candidateId from auth service
    const candidateId = this.authService.getCandidateId();
    if (candidateId) {
      this.candidateId = candidateId;
      this.loadCandidateData();
    } else {
      // Try to fetch from auth/me endpoint
      this.authService.getCurrentUserProfile().subscribe({
        next: (profile) => {
          this.candidateId = profile.candidateId || profile.id;
          if (this.candidateId) {
            this.loadCandidateData();
          } else {
            this.error = 'Unable to load your profile. Please login again.';
            this.loading = false;
          }
        },
        error: (err) => {
          this.error = 'Please login to view your dashboard.';
          this.loading = false;
          console.error(err);
          // Redirect to login after a delay
          setTimeout(() => {
            this.router.navigate(['/candidate-login']);
          }, 2000);
        }
      });
    }

    // Subscribe to session warnings
    this.authService.sessionWarningMinutesLeft$.subscribe(mins => {
      this.sessionMinutesLeft = mins;
      this.showSessionBanner = mins !== null && mins >= 0;
    });
  }

  loadCandidateData(): void {
    if (!this.candidateId) return;
    
    const id = this.candidateId; // Type narrowing
    this.loading = true;
    this.error = null;

    // Load candidate info
    this.candidateService.getCandidate(id).subscribe({
      next: (candidate) => {
        this.candidate = candidate;
        this.saveToLocalStorage();
      },
      error: (err) => console.error('Failed to load candidate', err)
    });

    // Load applications for this candidate
    this.applicationService.getApplications({ 
      candidateId: id,
      pageNumber: 1,
      pageSize: 100 
    }).subscribe({
      next: (result) => {
        this.applications = result.items;
        this.stats.totalApplications = result.totalCount;
        this.loadJobDetails();
        this.calculateStats();
        this.saveToLocalStorage();
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load your applications. Please try again.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  loadJobDetails(): void {
    const uniqueJobIds = [...new Set(this.applications.map(app => app.jobId))];
    
    uniqueJobIds.forEach(jobId => {
      this.jobService.getJob(jobId).subscribe({
        next: (job) => {
          this.jobs.set(jobId, job);
          this.saveToLocalStorage();
        },
        error: (err) => console.error(`Failed to load job ${jobId}`, err)
      });
    });
  }

  calculateStats(): void {
    this.stats.newApplications = this.applications.filter(
      app => app.status === ApplicationStatus.New
    ).length;
    this.stats.shortlistedApplications = this.applications.filter(
      app => app.status === ApplicationStatus.Shortlisted
    ).length;
    this.stats.rejectedApplications = this.applications.filter(
      app => app.status === ApplicationStatus.Rejected
    ).length;
    this.stats.hiredApplications = this.applications.filter(
      app => app.status === ApplicationStatus.Hired
    ).length;
  }

  getFilteredApplications(): JobApplication[] {
    if (!this.selectedStatus) {
      return this.applications;
    }
    return this.applications.filter(app => app.status === this.selectedStatus);
  }

  selectApplication(application: JobApplication | null): void {
    this.selectedApplication = application;
  }

  getJobTitle(jobId: number): string {
    // Prefer embedded job info from application to avoid async race
    const embedded = this.applications.find(a => a.jobId === jobId)?.job?.title;
    if (embedded) return embedded;
    const fetched = this.jobs.get(jobId)?.title;
    if (fetched) return fetched;
    return `Job #${jobId}`;
  }

  getJobCompany(jobId: number): string {
    const embedded = this.applications.find(a => a.jobId === jobId)?.job?.department;
    if (embedded) return embedded;
    return this.jobs.get(jobId)?.department || '-';
  }

  getJobDepartment(jobId: number): string {
    const embedded = this.applications.find(a => a.jobId === jobId)?.job?.department;
    if (embedded) return embedded;
    return this.jobs.get(jobId)?.department || '-';
  }

  getJobLocation(jobId: number): string {
    const embedded = this.applications.find(a => a.jobId === jobId)?.job?.location;
    if (embedded) return embedded;
    return this.jobs.get(jobId)?.location || '-';
  }

  getStatusClass(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.New:
        return 'status-badge status-new';
      case ApplicationStatus.Shortlisted:
        return 'status-badge status-shortlisted';
      case ApplicationStatus.Hired:
        return 'status-badge status-hired';
      case ApplicationStatus.Rejected:
        return 'status-badge status-rejected';
      default:
        return 'status-badge';
    }
  }

  getStatusKey(status: ApplicationStatus | number | string | undefined): string {
    const normalized = this.normalizeStatus(status) ?? ApplicationStatus.New;
    switch (normalized) {
      case ApplicationStatus.New:
        return 'new';
      case ApplicationStatus.Shortlisted:
        return 'shortlisted';
      case ApplicationStatus.Hired:
        return 'hired';
      case ApplicationStatus.Rejected:
        return 'rejected';
      default:
        return 'new';
    }
  }

  getStatusLabel(status: ApplicationStatus | number | string | undefined): string {
    const normalized = this.normalizeStatus(status);
    switch (normalized) {
      case ApplicationStatus.New:
        return 'Under Review';
      case ApplicationStatus.Shortlisted:
        return 'Interview Scheduled';
      case ApplicationStatus.Hired:
        return 'Offer';
      case ApplicationStatus.Rejected:
        return 'Rejected';
      default:
        return normalized ? APPLICATION_STATUS_LABELS[normalized] : 'Unknown';
    }
  }

  getStatusIcon(status: ApplicationStatus | number | string | undefined): string {
    const normalized = this.normalizeStatus(status);
    switch (normalized) {
      case ApplicationStatus.New:
        return '📥';
      case ApplicationStatus.Shortlisted:
        return '⭐';
      case ApplicationStatus.Hired:
        return '✅';
      case ApplicationStatus.Rejected:
        return '❌';
      default:
        return '📋';
    }
  }

  getStatusChangeDate(): string {
    if (!this.selectedApplication?.statusHistory || this.selectedApplication.statusHistory.length === 0) {
      return '-';
    }
    const lastChange = this.selectedApplication.statusHistory[this.selectedApplication.statusHistory.length - 1];
    return this.formatDate(lastChange.changedDate);
  }

  formatDate(date: Date | string): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  getInitials(): string {
    if (!this.candidate) return 'U';
    const first = this.candidate.firstName?.charAt(0) || '';
    const last = this.candidate.lastName?.charAt(0) || '';
    return (first + last).toUpperCase();
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  getUserInitials(): string {
    const user = this.authService.getCurrentUser();
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    if (this.candidate) {
      return this.getInitials();
    }
    return 'U';
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    if (user?.email) {
      return user.email.split('@')[0];
    }
    if (this.candidate) {
      return `${this.candidate.firstName} ${this.candidate.lastName}`;
    }
    return 'User';
  }

  getUserEmail(): string {
    const user = this.authService.getCurrentUser();
    if (user?.email) {
      return user.email;
    }
    if (this.candidate?.email) {
      return this.candidate.email;
    }
    return 'user@example.com';
  }

  navigateToProfile(): void {
    this.showDropdown = false;
    this.router.navigate(['/candidate-profile']);
  }

  navigateToSettings(): void {
    this.showDropdown = false;
    this.router.navigate(['/candidate-settings']);
  }

  navigateToChangePassword(): void {
    this.showDropdown = false;
    this.router.navigate(['/candidate-change-password']);
  }

  logout(): void {
    this.showDropdown = false;
    localStorage.removeItem('candidateDashboardData');
    this.authService.logout();
    this.router.navigate(['/candidate-login']);
  }

  // Local Storage Methods for Persistent Data
  private saveToLocalStorage(): void {
    const data = {
      candidateId: this.candidateId,
      candidate: this.candidate,
      applications: this.applications,
      jobs: Array.from(this.jobs.entries()),
      stats: this.stats,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem('candidateDashboardData', JSON.stringify(data));
  }

  private loadFromLocalStorage(): void {
    const data = localStorage.getItem('candidateDashboardData');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        this.candidate = parsed.candidate;
        this.applications = parsed.applications;
        this.jobs = new Map(parsed.jobs);
        this.stats = parsed.stats;
      } catch (e) {
        console.error('Failed to parse cached data', e);
      }
    }
  }

  viewApplicationDetails(application: JobApplication): void {
    this.selectApplication(application);
  }

  goToJobs(): void {
    this.router.navigate(['/dashboard/jobs']);
  }

  private normalizeStatus(status: ApplicationStatus | number | string | undefined): ApplicationStatus | undefined {
    if (status === undefined || status === null) return undefined;
    if (typeof status === 'number') {
      return this.normalizeNumericStatus(status);
    }
    const text = String(status).trim();
    if (!text) return undefined;
    const numeric = Number(text);
    if (!Number.isNaN(numeric)) {
      const numericStatus = this.normalizeNumericStatus(numeric);
      if (numericStatus !== undefined) return numericStatus;
    }
    return this.statusLookup.get(text.toLowerCase());
  }

  private normalizeNumericStatus(value: number): ApplicationStatus | undefined {
    const rounded = Math.trunc(value);
    if (this.statusOrdering.includes(rounded as ApplicationStatus)) {
      return rounded as ApplicationStatus;
    }
    if (rounded >= 0 && rounded < this.statusOrdering.length) {
      return this.statusOrdering[rounded];
    }
    const plusOne = rounded + 1;
    if (this.statusOrdering.includes(plusOne as ApplicationStatus)) {
      return plusOne as ApplicationStatus;
    }
    return undefined;
  }

  private buildStatusLookup(): Map<string, ApplicationStatus> {
    const lookup = new Map<string, ApplicationStatus>();
    this.statusOrdering.forEach(status => {
      lookup.set(status.toString().toLowerCase(), status);
      lookup.set(APPLICATION_STATUS_LABELS[status].toLowerCase(), status);
    });
    return lookup;
  }
}

