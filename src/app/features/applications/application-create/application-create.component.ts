import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../../core/services/application.service';
import { JobService } from '../../../core/services/job.service';
import { CandidateService } from '../../../core/services/candidate.service';
import { CreateApplicationDto } from '../../../shared/models/application.model';
import { Job } from '../../../shared/models/job.model';
import { Candidate } from '../../../shared/models/candidate.model';

@Component({
  selector: 'app-application-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './application-create.component.html',
  styleUrls: ['./application-create.component.css']
})
export class ApplicationCreateComponent implements OnInit {
  application: CreateApplicationDto = {
    jobId: 0,
    candidateId: 0,
    notes: ''
  };
  
  jobs: Job[] = [];
  candidates: Candidate[] = [];
  loading = false;
  error: string | null = null;
  submitting = false;
  
  preSelectedJobId?: number;
  preSelectedCandidateId?: number;

  constructor(
    private applicationService: ApplicationService,
    private jobService: JobService,
    private candidateService: CandidateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['jobId']) {
        this.preSelectedJobId = +params['jobId'];
        this.application.jobId = this.preSelectedJobId;
      }
      if (params['candidateId']) {
        this.preSelectedCandidateId = +params['candidateId'];
        this.application.candidateId = this.preSelectedCandidateId;
      }
    });
    
    this.loadJobs();
    this.loadCandidates();
  }

  loadJobs(): void {
    this.jobService.getJobs(1, 1000).subscribe({
      next: (result) => {
        this.jobs = result.items.filter(j => j.isActive);
        if (this.preSelectedJobId) {
          this.application.jobId = this.preSelectedJobId;
        }
      },
      error: (err) => console.error('Failed to load jobs', err)
    });
  }

  loadCandidates(): void {
    this.candidateService.getCandidates(1, 1000).subscribe({
      next: (result) => {
        this.candidates = result.items.filter(c => !c.isDeleted);
        if (this.preSelectedCandidateId) {
          this.application.candidateId = this.preSelectedCandidateId;
        }
      },
      error: (err) => console.error('Failed to load candidates', err)
    });
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    this.submitting = true;
    this.error = null;

    this.applicationService.createApplication(this.application).subscribe({
      next: (createdApplication) => {
        this.router.navigate(['/dashboard/applications', createdApplication.id, 'status']);
      },
      error: (err) => {
        this.error = err.error?.title || err.error?.detail || 'Failed to create application. This application may already exist.';
        this.submitting = false;
        console.error(err);
      }
    });
  }

  isFormValid(): boolean {
    return !!(this.application.jobId && this.application.candidateId);
  }

  cancel(): void {
    this.router.navigate(['/dashboard/applications']);
  }
}

