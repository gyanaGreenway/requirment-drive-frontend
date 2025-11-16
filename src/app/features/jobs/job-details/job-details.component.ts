import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { JobService } from '../../../core/services/job.service';
import { Job } from '../../../shared/models/job.model';

@Component({
  selector: 'app-job-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './job-details.component.html',
  styleUrls: ['./job-details.component.css']
})
export class JobDetailsComponent implements OnInit {
  job?: Job;
  loading = false;
  error: string | null = null;

  constructor(
    private jobService: JobService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadJob(id);
    });
  }

  loadJob(id: number): void {
    this.loading = true;
    this.error = null;
    this.jobService.getJob(id).subscribe({
      next: (job) => {
        this.job = job;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load job details.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  editJob(): void {
    if (this.job) {
      this.router.navigate(['/dashboard/jobs', this.job.id, 'edit']);
    }
  }

  deleteJob(): void {
    if (this.job && confirm('Are you sure you want to delete this job?')) {
      this.jobService.deleteJob(this.job.id).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/jobs']);
        },
        error: (err) => {
          this.error = 'Failed to delete job.';
          console.error(err);
        }
      });
    }
  }

  backToList(): void {
    this.router.navigate(['/dashboard/jobs']);
  }
}

