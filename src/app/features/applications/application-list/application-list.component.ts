import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../../core/services/application.service';
import { JobService } from '../../../core/services/job.service';
import { CandidateService } from '../../../core/services/candidate.service';
import { JobApplication, ApplicationFilter, ApplicationStatus } from '../../../shared/models/application.model';
import { APPLICATION_STATUS_LABELS } from '../../../shared/models/application-status-labels';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { Job } from '../../../shared/models/job.model';
import { Candidate } from '../../../shared/models/candidate.model';

@Component({
  selector: 'app-application-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './application-list.component.html',
  styleUrls: ['./application-list.component.css']
})
export class ApplicationListComponent implements OnInit {
  applications: JobApplication[] = [];
  pagedResult?: PagedResult<JobApplication>;
  jobs: Job[] = [];
  candidates: Candidate[] = [];
  
  filter: ApplicationFilter = {
    pageNumber: 1,
    pageSize: 10,
    sortBy: 'appliedDate',
    sortOrder: 'desc'
  };
  
  statusOptions = [
    { value: ApplicationStatus.New, label: APPLICATION_STATUS_LABELS[ApplicationStatus.New] },
    { value: ApplicationStatus.Shortlisted, label: APPLICATION_STATUS_LABELS[ApplicationStatus.Shortlisted] },
    { value: ApplicationStatus.Rejected, label: APPLICATION_STATUS_LABELS[ApplicationStatus.Rejected] },
    { value: ApplicationStatus.Hired, label: APPLICATION_STATUS_LABELS[ApplicationStatus.Hired] }
  ];
  loading = false;
  error: string | null = null;

  constructor(
    private applicationService: ApplicationService,
    private jobService: JobService,
    private candidateService: CandidateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadJobs();
    this.loadCandidates();
    this.loadApplications();
  }

  loadJobs(): void {
    this.jobService.getJobs(1, 100).subscribe({
      next: (result) => {
        this.jobs = result.items;
      },
      error: (err) => console.error('Failed to load jobs', err)
    });
  }

  loadCandidates(): void {
    this.candidateService.getCandidates(1, 100).subscribe({
      next: (result) => {
        this.candidates = result.items.filter(c => !c.isDeleted);
      },
      error: (err) => console.error('Failed to load candidates', err)
    });
  }

  loadApplications(): void {
    this.loading = true;
    this.error = null;
    this.applicationService.getApplications(this.filter).subscribe({
      next: (result) => {
        this.pagedResult = result;
        this.applications = result.items;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load applications. Please try again.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onFilterChange(): void {
    this.filter.pageNumber = 1;
    this.loadApplications();
  }

  onPageChange(page: number): void {
    this.filter.pageNumber = page;
    this.loadApplications();
  }

  onSortChange(sortBy: string): void {
    if (this.filter.sortBy === sortBy) {
      this.filter.sortOrder = this.filter.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.filter.sortBy = sortBy;
      this.filter.sortOrder = 'asc';
    }
    this.loadApplications();
  }

  clearFilters(): void {
    this.filter = {
      pageNumber: 1,
      pageSize: 10,
      sortBy: 'appliedDate',
      sortOrder: 'desc'
    };
    this.loadApplications();
  }

  viewApplication(id: number): void {
    this.router.navigate(['/dashboard/applications', id, 'status']);
  }

  createApplication(): void {
    this.router.navigate(['/dashboard/applications/create']);
  }

  getStatusClass(status: ApplicationStatus): string {
    switch (status) {
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

  getStatusLabel(status: ApplicationStatus | undefined): string {
    if (!status) return 'Unknown';
    return APPLICATION_STATUS_LABELS[status] ?? String(status);
  }

  getPageNumbers(): number[] {
    if (!this.pagedResult) return [];
    const pages: number[] = [];
    const totalPages = this.pagedResult.totalPages;
    const maxPages = 5;
    const currentPage = this.filter.pageNumber || 1;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  getJobName(jobId: number): string {
    const job = this.jobs.find(j => j.id === jobId);
    return job ? job.title : `Job #${jobId}`;
  }

  getCandidateName(candidateId: number): string {
    const candidate = this.candidates.find(c => c.id === candidateId);
    return candidate ? `${candidate.firstName} ${candidate.lastName}` : `Candidate #${candidateId}`;
  }

  onStartDateChange(value: string): void {
    this.filter.startDate = value ? new Date(value) : undefined;
    this.onFilterChange();
  }

  onEndDateChange(value: string): void {
    this.filter.endDate = value ? new Date(value) : undefined;
    this.onFilterChange();
  }
}

