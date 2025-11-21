import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { JobService } from '../../core/services/job.service';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/services/auth';
import { Job } from '../../shared/models/job.model';
import { CreateApplicationDto } from '../../shared/models/application.model';

@Component({
  selector: 'app-job-application',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './job-application.component.html',
  styleUrls: ['./job-application.component.css']
})
export class JobApplicationComponent implements OnInit {
  job?: Job;
  loading = false;
  error: string | null = null;
  currentStep = 1;
  applicationForm: FormGroup;
  submitting = false;
  submitSuccess = false;
  submitError: string | null = null;

  steps = [
    { number: 1, label: 'Start Application', active: true },
    { number: 2, label: 'Upload Resume', active: false },
    { number: 3, label: 'Edit Work Preference', active: false },
    { number: 4, label: 'Take Interview', active: false }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private jobService: JobService,
    private applicationService: ApplicationService,
    private authService: AuthService
  ) {
    this.applicationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      agreeTerms: [false, [Validators.requiredTrue]]
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.applicationForm.get(fieldName);
    if (field && field.invalid && field.touched) {
      if (field.hasError('required')) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
      if (field.hasError('email')) {
        return 'Please enter a valid email address';
      }
      if (field.hasError('pattern')) {
        return 'Please enter a valid 10-digit phone number';
      }
      if (field.hasError('minLength')) {
        return `${this.getFieldLabel(fieldName)} must be at least 2 characters`;
      }
      if (field.hasError('requiredTrue')) {
        return 'You must agree to the privacy policy';
      }
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Name',
      email: 'Email',
      phone: 'Phone',
      agreeTerms: 'Privacy Policy'
    };
    return labels[fieldName] || fieldName;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const publicId = params['id'];
      if (publicId) {
        this.loadJobDetails(publicId);
      }
    });
  }

  loadJobDetails(publicId: string): void {
    this.loading = true;
    this.error = null;
    
    this.jobService.getPublicJobByPublicId(publicId).subscribe({
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

  getRequirements(): string[] {
    if (!this.job?.requirements) return [];
    return typeof this.job.requirements === 'string'
      ? this.job.requirements.split(/[\n,;]+/).map(r => r.trim()).filter(Boolean)
      : [];
  }

  getKeyResponsibilities(): string[] {
    const reqs = this.getRequirements();
    return reqs.slice(0, 3);
  }

  getMustHaveSkills(): string[] {
    const mustHaveKeywords = ['ASP.NET Core', 'MVC', 'Angular', 'Web API', 'SQL', 'C#'];
    return this.extractSkills(mustHaveKeywords);
  }

  getGoodToHaveSkills(): string[] {
    const goodToHaveKeywords = ['Entity Framework', 'PostgreSQL', 'OOPS', 'Design patterns', 'Data structures', 'Agile', 'Azure DevOps'];
    return this.extractSkills(goodToHaveKeywords);
  }

  getSoftSkills(): string[] {
    return ['Good communication skills in English', 'Good logical & analytical thinking'];
  }

  private extractSkills(keywords: string[]): string[] {
    if (!this.job?.requirements && !this.job?.description) return keywords.slice(0, 6);
    
    const text = `${this.job.requirements || ''} ${this.job.description || ''}`.toLowerCase();
    const foundSkills = keywords.filter(keyword => 
      text.includes(keyword.toLowerCase())
    );
    
    return foundSkills.length > 0 ? foundSkills : keywords.slice(0, 6);
  }

  onSubmit(): void {
    if (this.applicationForm.invalid) {
      this.applicationForm.markAllAsTouched();
      return;
    }

    // Check if user is authenticated
    const candidateId = this.authService.getCandidateId();
    
    if (!candidateId) {
      // Redirect to login
      this.router.navigate(['/candidate-login'], { 
        queryParams: { returnUrl: this.router.url }
      });
      return;
    }

    if (!this.job) return;

    this.submitting = true;
    this.submitError = null;

    const dto: CreateApplicationDto = {
      jobId: this.job.id,
      candidateId: candidateId
    };

    this.applicationService.createApplication(dto).subscribe({
      next: () => {
        this.submitSuccess = true;
        this.submitting = false;
        setTimeout(() => {
          this.router.navigate(['/candidate-dashboard']);
        }, 2000);
      },
      error: (err) => {
        this.submitting = false;
        if (err.status === 409) {
          this.submitError = 'You have already applied for this job.';
        } else if (err.status === 401) {
          this.submitError = 'Please login to apply.';
          setTimeout(() => {
            this.router.navigate(['/candidate-login'], { 
              queryParams: { returnUrl: this.router.url }
            });
          }, 1500);
        } else {
          this.submitError = 'Failed to submit application. Please try again.';
        }
        console.error(err);
      }
    });
  }

  backToJobDetails(): void {
    if (this.job) {
      this.router.navigate(['/public-jobs', this.job.publicId]);
    } else {
      this.router.navigate(['/public-jobs']);
    }
  }
}
