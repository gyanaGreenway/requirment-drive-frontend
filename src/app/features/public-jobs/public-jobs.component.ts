import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../core/services/job.service';
import { Job } from '../../shared/models/job.model';
import { PagedResult } from '../../shared/models/paged-result.model';

@Component({
  selector: 'app-public-jobs',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './public-jobs.component.html',
  styleUrls: ['./public-jobs.component.css']
})
export class PublicJobsComponent implements OnInit {
  jobs: Job[] = [];
  pagedResult?: PagedResult<Job>;
  currentPage = 1;
  pageSize = 10;
  loading = false;
  error: string | null = null;
  searchTerm = '';

  constructor(
    private jobService: JobService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadPublicJobs();
  }

  loadPublicJobs(): void {
    this.loading = true;
    this.error = null;
    
    this.jobService.getPublicJobs(this.currentPage, this.pageSize).subscribe({
      next: (result) => {
        this.pagedResult = result;
        this.jobs = result.items.filter(job => job.isActive);
        this.loading = false;
      },
      error: (err) => {
        console.error('Public jobs API error:', err);
        if (err.status === 404) {
          this.error = 'Public jobs endpoint not found. Please ensure the backend endpoint /recruitment/api/v1/public/jobs exists.';
        } else if (err.status === 0) {
          this.error = 'Cannot connect to backend server. Please ensure the backend is running on https://localhost:57913';
        } else {
          this.error = 'Failed to load jobs. Please try again.';
        }
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadPublicJobs();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadPublicJobs();
  }

  viewJobDetails(publicId: string): void {
    this.router.navigate(['/public-jobs', publicId]);
  }

  applyForJob(publicId: string): void {
    // Navigate to job details page where apply button will handle the flow
    this.router.navigate(['/public-jobs', publicId]);
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

  backToDashboard(): void {
    this.router.navigate(['/candidate-dashboard']);
  }

  formatSalary(job: Job): string {
    if (job.salary && job.salary > 0) {
      return `₹${(job.salary / 100000).toFixed(1)}L`;
    }
    if (job.salaryRange) {
      return job.salaryRange;
    }
    return 'Competitive';
  }

  getRequirementsPreview(job: Job): string {
    if (!job.requirements) {
      return 'No specific requirements listed';
    }
    const reqArray = typeof job.requirements === 'string' 
      ? job.requirements.split(',').map(r => r.trim()).filter(Boolean)
      : [];
    
    if (reqArray.length === 0) {
      return 'No specific requirements listed';
    }
    
    const first3 = reqArray.slice(0, 3);
    const preview = first3.join(', ');
    if (reqArray.length > 3) {
      return `${preview}, +${reqArray.length - 3} more`;
    }
    return preview;
  }

  getRequirementsList(job: Job): string[] {
    if (!job.requirements) return [];
    const reqs = typeof job.requirements === 'string'
      ? job.requirements.split(/[\n,;]+/).map(r => r.trim()).filter(Boolean)
      : [];
    return reqs.slice(0, 3); // Show first 3 requirements
  }

  getMustHaveSkills(job: Job): string[] {
    if (!job.requirements) return [];
    const skills = typeof job.requirements === 'string'
      ? job.requirements.split(/[\n,;]+/).map(r => r.trim()).filter(Boolean)
      : [];
    // Extract key technology names from requirements
    const techKeywords = ['ASP.NET', 'Angular', 'SQL', 'Azure', 'C#', 'Web API', 'MVC', '.NET', 'DevOps', 'CI/CD', 'Docker', 'Kubernetes'];
    const foundSkills: string[] = [];
    skills.forEach(skill => {
      techKeywords.forEach(tech => {
        if (skill.toLowerCase().includes(tech.toLowerCase()) && !foundSkills.includes(tech)) {
          foundSkills.push(tech);
        }
      });
    });
    return foundSkills.length > 0 ? foundSkills.slice(0, 6) : skills.slice(0, 6);
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const posted = new Date(date);
    const diffMs = now.getTime() - posted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  }
}
