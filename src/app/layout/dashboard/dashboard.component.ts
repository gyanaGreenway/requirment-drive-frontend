import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, NgClass, NgForOf, NgIf } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { JobService } from '../../core/services/job.service';
import { CandidateService } from '../../core/services/candidate.service';
import { ApplicationService } from '../../core/services/application.service';
import { ApplicationStatus, JobApplication } from '../../shared/models/application.model';
import { APPLICATION_STATUS_LABELS } from '../../shared/models/application-status-labels';
import { AuthService } from '../../core/services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, NgIf, NgForOf, NgClass],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  router: Router;
  showDropdown = false;
  recentApplications: JobApplication[] = [];
  stats = {
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    totalApplications: 0,
    newApplications: 0,
    shortlistedApplications: 0,
    hiredApplications: 0,
    rejectedApplications: 0
  };
  loading = false;
  recentLoading = false;
  recentError: string | null = null;

  constructor(
    private jobService: JobService,
    private candidateService: CandidateService,
    private applicationService: ApplicationService,
    private authService: AuthService,
    router: Router
  ) {
    this.router = router;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile') && !target.closest('.profile-dropdown')) {
      this.showDropdown = false;
    }
  }

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentApplications();
  }

  isDashboardRoot(): boolean {
    const url = this.router.url;
    return url === '/dashboard' || url === '/dashboard/';
  }

  loadStats(): void {
    this.loading = true;
    
    // Load jobs
    this.jobService.getJobs(1, 1).subscribe({
      next: (result) => {
        this.stats.totalJobs = result.totalCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load job stats', err);
        this.loading = false;
      }
    });

    // Load active jobs
    this.jobService.getJobs(1, 1000).subscribe({
      next: (result) => {
        this.stats.activeJobs = result.items.filter(j => j.isActive).length;
      },
      error: (err) => console.error('Failed to load active jobs', err)
    });

    // Load candidates
    this.candidateService.getCandidates(1, 1).subscribe({
      next: (result) => {
        this.stats.totalCandidates = result.totalCount;
      },
      error: (err) => console.error('Failed to load candidate stats', err)
    });

    // Load applications
    this.applicationService.getApplications({ pageNumber: 1, pageSize: 1 }).subscribe({
      next: (result) => {
        this.stats.totalApplications = result.totalCount;
      },
      error: (err) => console.error('Failed to load application stats', err)
    });

    // Load applications by status
    const statuses: ApplicationStatus[] = [
      ApplicationStatus.New,
      ApplicationStatus.Shortlisted,
      ApplicationStatus.Hired,
      ApplicationStatus.Rejected
    ];

    statuses.forEach(status => {
      this.applicationService.getApplications({ 
        pageNumber: 1, 
        pageSize: 1, 
        status: status 
      }).subscribe({
        next: (result) => {
          switch (status) {
            case ApplicationStatus.New:
              this.stats.newApplications = result.totalCount;
              break;
            case ApplicationStatus.Shortlisted:
              this.stats.shortlistedApplications = result.totalCount;
              break;
            case ApplicationStatus.Hired:
              this.stats.hiredApplications = result.totalCount;
              break;
            case ApplicationStatus.Rejected:
              this.stats.rejectedApplications = result.totalCount;
              break;
          }
        },
        error: (err) => console.error(`Failed to load ${APPLICATION_STATUS_LABELS[status]} applications`, err)
      });
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  loadRecentApplications(): void {
    this.recentLoading = true;
    this.recentError = null;
    this.applicationService.getApplications({
      pageNumber: 1,
      pageSize: 5,
      sortBy: 'appliedDate',
      sortOrder: 'desc'
    }).subscribe({
      next: (result) => {
        this.recentApplications = result.items || [];
        this.recentLoading = false;
      },
      error: (err) => {
        console.error('Failed to load recent applications', err);
        this.recentApplications = [];
        this.recentLoading = false;
        this.recentError = 'Unable to load recent applications.';
      }
    });
  }

  getUserInitials(): string {
    const user = this.authService.getCurrentUser();
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'HR';
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.email?.split('@')[0] || 'Admin User';
  }

  getUserEmail(): string {
    const user = this.authService.getCurrentUser();
    return user?.email || 'admin@example.com';
  }

  getUserRole(): string {
    const user = this.authService.getCurrentUser();
    return user?.role === 'HR' ? 'HR Manager' : 'User';
  }

  navigateToProfile(): void {
    this.showDropdown = false;
    this.router.navigate(['/dashboard/profile']);
  }

  navigateToSettings(): void {
    this.showDropdown = false;
    this.router.navigate(['/dashboard/settings']);
  }

  navigateToChangePassword(): void {
    this.showDropdown = false;
    this.router.navigate(['/dashboard/change-password']);
  }

  logout(): void {
    this.showDropdown = false;
    this.authService.logout();
    this.router.navigate(['/hr-login']);
  }

  viewApplication(applicationId: number): void {
    if (!applicationId) return;
    this.router.navigate(['/dashboard/applications', applicationId, 'status']);
  }

  getJobTitle(application: JobApplication): string {
    if (application.job?.title) return application.job.title;
    return `Job #${application.jobId}`;
  }

  getCandidateName(application: JobApplication): string {
    if (application.candidate) {
      const { firstName = '', lastName = '' } = application.candidate;
      const name = `${firstName} ${lastName}`.trim();
      if (name) return name;
    }
    return `Candidate #${application.candidateId}`;
  }

  getCandidateEmail(application: JobApplication): string {
    return application.candidate?.email || '';
  }

  getAppliedDate(application: JobApplication): string {
    return application.appliedDate ? new Date(application.appliedDate).toLocaleString() : '-';
  }

  getStatusLabel(status: ApplicationStatus | undefined): string {
    if (!status) return 'Unknown';
    return APPLICATION_STATUS_LABELS[status] ?? 'Unknown';
  }

  getStatusBadgeClass(status: ApplicationStatus | undefined): string {
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
}
