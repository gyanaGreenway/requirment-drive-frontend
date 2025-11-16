import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../../core/services/application.service';
import { JobService } from '../../../core/services/job.service';
import { CandidateService } from '../../../core/services/candidate.service';
import { AuthService } from '../../../core/services/auth';
import { JobApplication, ApplicationStatus } from '../../../shared/models/application.model';
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
  candidateId: number = 1; // This should come from auth service
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
  selectedStatus: string = '';
  
  ApplicationStatus = ApplicationStatus;
  statusOptions = ['All', ...Object.values(ApplicationStatus)];

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
    this.loadCandidateData();
  }

  loadCandidateData(): void {
    this.loading = true;
    this.error = null;

    // Load candidate info
    this.candidateService.getCandidate(this.candidateId).subscribe({
      next: (candidate) => {
        this.candidate = candidate;
        this.saveToLocalStorage();
      },
      error: (err) => console.error('Failed to load candidate', err)
    });

    // Load applications for this candidate
    this.applicationService.getApplications({ 
      candidateId: this.candidateId,
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
    return this.jobs.get(jobId)?.title || `Job #${jobId}`;
  }

  getJobCompany(jobId: number): string {
    return this.jobs.get(jobId)?.department || '-';
  }

  getJobDepartment(jobId: number): string {
    return this.jobs.get(jobId)?.department || '-';
  }

  getJobLocation(jobId: number): string {
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

  getStatusKey(status: string): string {
    switch (status) {
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

  getStatusLabel(status: string): string {
    switch (status) {
      case ApplicationStatus.New:
        return 'Under Review';
      case ApplicationStatus.Shortlisted:
        return 'Interview Scheduled';
      case ApplicationStatus.Hired:
        return 'Offer';
      case ApplicationStatus.Rejected:
        return 'Rejected';
      default:
        return status;
    }
  }

  getStatusIcon(status: ApplicationStatus): string {
    switch (status) {
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
}

