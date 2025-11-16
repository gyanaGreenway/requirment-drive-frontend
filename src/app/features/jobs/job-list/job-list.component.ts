import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../../core/services/job.service';
import { ToastService } from '../../../core/services/toast.service';
import { Job } from '../../../shared/models/job.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

@Component({
  selector: 'app-job-list',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, RouterModule, FormsModule],
  templateUrl: './job-list.component.html',
  styleUrls: ['./job-list.component.css']
})
export class JobListComponent implements OnInit {
  jobs: Job[] = [];
  pagedResult?: PagedResult<Job>;
  currentPage = 1;
  pageSize = 10;
  loading = false;
  error: string | null = null;
  searchTerm = '';
  showDeleteConfirm = false;
  jobPendingDelete: Job | null = null;
  deleteInProgress = false;

  constructor(
    private jobService: JobService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadJobs();
  }

  loadJobs(): void {
    this.loading = true;
    this.error = null;
    this.jobService.getJobs(this.currentPage, this.pageSize).subscribe({
      next: (result) => {
        this.pagedResult = result;
        this.jobs = result.items;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load jobs. Please try again.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadJobs();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadJobs();
  }

  createJob(): void {
    this.router.navigate(['/dashboard/jobs/create']);
  }

  viewJob(id: number): void {
    this.router.navigate(['/dashboard/jobs', id]);
  }

  editJob(id: number): void {
    this.router.navigate(['/dashboard/jobs', id, 'edit']);
  }

  promptDelete(job: Job): void {
    this.jobPendingDelete = job;
    this.showDeleteConfirm = true;
    this.deleteInProgress = false;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.jobPendingDelete = null;
    this.deleteInProgress = false;
  }

  confirmDelete(): void {
    if (!this.jobPendingDelete) return;
    this.deleteInProgress = true;
    const jobId = this.jobPendingDelete.id;
    const titleName = (this.jobPendingDelete.title || 'Job').trim();
    this.jobService.deleteJob(jobId).subscribe({
      next: () => {
        const message = `${titleName} job has been deleted successfully on ${this.formatNow()}`;
        this.toast.success(message, 5000, true);
        this.cancelDelete();
        this.loadJobs();
      },
      error: (err) => {
        this.error = 'Failed to delete job.';
        this.toast.error('Failed to delete job', 3500, true);
        this.deleteInProgress = false;
        console.error(err);
      }
    });
  }

  getPageNumbers(): number[] {
    if (!this.pagedResult) return [];
    const pages: number[] = [];
    const totalPages = this.pagedResult.totalPages;
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  private formatNow(): string {
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
    return formatter.format(new Date());
  }
}

