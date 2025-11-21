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
  deleteError: string | null = null;
  
  // Context menu state
  showContextMenu = false;
  contextMenuX = 0;
  contextMenuY = 0;
  selectedJob: Job | null = null;

  constructor(
    private jobService: JobService,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadJobs();
    // Close context menu on any click
    document.addEventListener('click', () => this.closeContextMenu());
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
    this.deleteError = null;
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
        const userMessage = this.extractDeleteError(err) || 'Failed to delete job. Please try again or contact support.';
        this.deleteError = userMessage;
        this.error = null; // keep general error clear
        this.toast.error(userMessage, 5000, true);
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

  // Context menu methods
  onRowRightClick(event: MouseEvent, job: Job): void {
    event.preventDefault();
    this.selectedJob = job;
    this.contextMenuX = event.clientX;
    this.contextMenuY = event.clientY;
    this.showContextMenu = true;
  }

  closeContextMenu(): void {
    this.showContextMenu = false;
    this.selectedJob = null;
  }

  shareJob(): void {
    if (!this.selectedJob) return;
    
    const jobUrl = `${window.location.origin}/public-jobs/${this.selectedJob.publicId}/apply`;
    
    if (navigator.share) {
      navigator.share({
        title: this.selectedJob.title,
        text: `Check out this job opportunity: ${this.selectedJob.title}`,
        url: jobUrl
      }).then(() => {
        this.toast.success('Job shared successfully!', 3000, true);
      }).catch((err) => {
        if (err.name !== 'AbortError') {
          this.copyToClipboard(jobUrl);
        }
      });
    } else {
      this.copyToClipboard(jobUrl);
    }
    
    this.closeContextMenu();
  }

  generateLink(): void {
    if (!this.selectedJob) return;
    
    const jobUrl = `${window.location.origin}/public-jobs/${this.selectedJob.publicId}/apply`;
    this.copyToClipboard(jobUrl);
    this.closeContextMenu();
  }

  private copyToClipboard(text: string): void {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        this.toast.success('Job link copied to clipboard!', 3000, true);
      }).catch(() => {
        this.fallbackCopy(text);
      });
    } else {
      this.fallbackCopy(text);
    }
  }

  private fallbackCopy(text: string): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      this.toast.success('Job link copied to clipboard!', 3000, true);
    } catch (err) {
      this.toast.error('Failed to copy link', 2000, true);
    }
    document.body.removeChild(textarea);
  }

  private extractDeleteError(err: any): string | null {
    if (!err) return null;
    // HttpErrorResponse shape
    const raw = err.error ?? err;
    if (typeof raw === 'string') {
      // Avoid dumping huge HTML or generic messages
      if (/<!doctype html>/i.test(raw)) return null;
      if (raw.length > 300) return null;
      return raw.trim();
    }
    if (raw && typeof raw === 'object') {
      // Common backend patterns
      if (raw.message && typeof raw.message === 'string') return raw.message.trim();
      if (raw.error && typeof raw.error === 'string') return raw.error.trim();
      // Validation style { errors: { Field: ['msg'] } }
      if (raw.errors && typeof raw.errors === 'object') {
        try {
          const firstKey = Object.keys(raw.errors)[0];
          const val = raw.errors[firstKey];
          if (Array.isArray(val) && val.length) return val[0];
        } catch {}
      }
    }
    return null;
  }
}

