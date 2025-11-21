import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { JobService } from '../../core/services/job.service';
import { ApplicationService } from '../../core/services/application.service';
import { AuthService } from '../../core/services/auth';
import { Job } from '../../shared/models/job.model';
import { CreateApplicationDto } from '../../shared/models/application.model';

@Component({
  selector: 'app-public-job-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './public-job-details.component.html',
  styleUrls: ['./public-job-details.component.css']
})
export class PublicJobDetailsComponent implements OnInit {
  job?: Job;
  loading = false;
  error: string | null = null;
  applying = false;
  applicationSuccess = false;
  applicationError: string | null = null;
  isAuthenticated = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private jobService: JobService,
    private applicationService: ApplicationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkAuth();
    this.route.params.subscribe(params => {
      const publicId = params['id'];
      if (publicId) {
        this.loadJobDetails(publicId);
      }
    });
  }

  checkAuth(): void {
    const user = this.authService.getCurrentUser();
    this.isAuthenticated = !!user;
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
        this.error = 'Failed to load job details. Please try again.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  applyForJob(): void {
    if (!this.job) return;

    if (!this.isAuthenticated) {
      // Redirect to login with return URL
      this.router.navigate(['/candidate-login'], { 
        queryParams: { returnUrl: `/public-jobs/${this.job.publicId}/apply` }
      });
      return;
    }

    this.applying = true;
    this.applicationError = null;
    this.applicationSuccess = false;

    // Get candidate ID from auth service or fetch from auth/me
    const candidateId = this.authService.getCandidateId();
    
    if (!candidateId) {
      // Fetch user profile to get candidateId
      this.authService.getCurrentUserProfile().subscribe({
        next: (profile) => {
          const id = profile.candidateId || profile.id;
          if (id) {
            this.submitApplication(this.job!.id, id);
          } else {
            this.applicationError = 'Unable to determine your candidate profile. Please contact support.';
            this.applying = false;
          }
        },
        error: (err) => {
          this.applicationError = 'Failed to verify your profile. Please login again.';
          this.applying = false;
          console.error(err);
        }
      });
    } else {
      this.submitApplication(this.job.id, candidateId);
    }
  }

  private submitApplication(jobId: number, candidateId: number): void {
    const dto: CreateApplicationDto = {
      jobId: jobId,
      candidateId: candidateId
    };

    this.applicationService.createApplication(dto).subscribe({
      next: () => {
        this.applicationSuccess = true;
        this.applying = false;
        setTimeout(() => {
          this.router.navigate(['/candidate-dashboard']);
        }, 2000);
      },
      error: (err) => {
        this.applying = false;
        if (err.status === 409) {
          this.applicationError = 'You have already applied for this job.';
        } else if (err.status === 400) {
          this.applicationError = 'Invalid application data. Please try again.';
        } else if (err.status === 401) {
          this.applicationError = 'Please login to apply for this job.';
          setTimeout(() => {
            this.router.navigate(['/candidate-login'], { 
              queryParams: { returnUrl: `/public-jobs/${jobId}/apply` }
            });
          }, 1500);
        } else {
          this.applicationError = 'Failed to submit application. Please try again.';
        }
        console.error(err);
      }
    });
  }

  backToJobs(): void {
    this.router.navigate(['/public-jobs']);
  }

  getJobPublicId(): string {
    return this.job?.publicId || '';
  }

  getRequirements(): string[] {
    if (!this.job?.requirements) return [];
    return typeof this.job.requirements === 'string'
      ? this.job.requirements.split(',').map(r => r.trim()).filter(Boolean)
      : [];
  }

  getKeyResponsibilities(): string[] {
    if (!this.job?.requirements) return [];
    const reqs = this.getRequirements();
    // Extract first 3 as key responsibilities
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
}
