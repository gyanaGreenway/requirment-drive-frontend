import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { JobService } from '../../../core/services/job.service';
import { ToastService } from '../../../core/services/toast.service';
import { Job, CreateJobDto, UpdateJobDto } from '../../../shared/models/job.model';

@Component({
  selector: 'app-job-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './job-create.component.html',
  styleUrls: ['./job-create.component.css']
})
export class JobCreateComponent implements OnInit, OnDestroy {
  job: CreateJobDto | UpdateJobDto = {
    title: '',
    description: '',
    department: '',
    location: '',
    salaryRange: '',
    requirements: '',
    isActive: true
  };
  isEditMode = false;
  jobId?: number;
  loading = false;
  error: string | null = null;
  submitting = false;
  // Debug helpers
  debugPayload: any = null;
  lastBackendError: any = null;
  showRedirectLoader = false;
  redirectSummary: string | null = null;
  private redirectTimer: any = null;
  readonly toastDurationMs = 5000;

  constructor(
    private jobService: JobService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.jobId = +params['id'];
        this.isEditMode = this.router.url.includes('/edit');
        if (this.isEditMode) {
          this.loadJob();
        } else {
          this.router.navigate(['/dashboard/jobs', this.jobId]);
        }
      }
    });
  }

  ngOnDestroy(): void {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
      this.redirectTimer = null;
    }
    this.redirectSummary = null;
  }

  loadJob(): void {
    if (!this.jobId) return;
    this.loading = true;
    this.jobService.getJob(this.jobId).subscribe({
      next: (job) => {
        this.job = {
          id: job.id,
          title: job.title,
          description: job.description,
          department: job.department,
          location: job.location,
          salaryRange: job.salaryRange || '',
          requirements: job.requirements || '',
          closingDate: job.closingDate,
          isActive: job.isActive,
          rowVersion: job.rowVersion
        };
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load job.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    this.submitting = true;
    this.error = null;

    if (this.isEditMode && this.jobId) {
      const normalized = this.buildNormalizedJobPayload();
      const updateDto = this.job as UpdateJobDto;
      const payload = {
        ...normalized,
        id: this.jobId,
        rowVersion: updateDto.rowVersion
      };
      this.debugPayload = { updateJobDto: payload };
      this.jobService.updateJob(payload).subscribe({
        next: () => {
          const titleName = (payload.title || 'Job').trim();
          const formattedDate = this.formatNow();
          const message = `${titleName} job has been updated successfully on ${formattedDate}`;
          this.handleSuccess(message, ['/dashboard/jobs', this.jobId]);
        },
        error: (err) => {
          this.error = 'Failed to update job. Please try again.';
          this.toast.error('Failed to update job', 3500, true);
          this.submitting = false;
          console.error(err);
        }
      });
    } else {
      const payloadForServer = this.buildNormalizedJobPayload();

      // Debug: store outgoing payload so template can show it
      this.debugPayload = { createJobDto: payloadForServer };

      // Call service (service will wrap payload as { createJobDto: ... })
      this.jobService.createJob(payloadForServer).subscribe({
        next: (createdJob) => {
          const titleName = (payloadForServer.title || 'Job').trim();
          const formattedDate = this.formatNow();
          const message = `${titleName} job has been created successfully on ${formattedDate}`;
          this.handleSuccess(message, ['/dashboard/jobs']);
        },
        error: (err) => {
          // Surface backend validation messages if present
          try {
            const backend = err?.error;
            this.lastBackendError = backend;
            if (backend && backend.errors) {
              const msgs: string[] = [];
              for (const key of Object.keys(backend.errors)) {
                const val = backend.errors[key];
                if (Array.isArray(val)) msgs.push(...val);
                else msgs.push(String(val));
              }
              this.error = msgs.join('; ');
            } else if (backend && backend.title) {
              this.error = backend.title;
            } else {
              this.error = 'Failed to create job. Please try again.';
            }
          } catch (e) {
            this.error = 'Failed to create job. Please try again.';
          }
          this.submitting = false;
          this.toast.error('Failed to create job', 3500, true);
          console.error(err);
        }
      });
    }
  }

  isFormValid(): boolean {
    return !!(this.job.title && this.job.description && this.job.department && this.job.location);
  }

  cancel(): void {
    if (this.isEditMode && this.jobId) {
      this.router.navigate(['/dashboard/jobs', this.jobId]);
    } else {
      this.router.navigate(['/dashboard/jobs']);
    }
  }

  onClosingDateChange(value: string): void {
    this.job.closingDate = value ? new Date(value) : undefined;
  }

  private handleSuccess(message: string, redirectCommands: any[]): void {
    this.submitting = false;
    this.toast.success(message, this.toastDurationMs, true);
    this.showRedirectLoader = true;
    this.redirectSummary = message;
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }
    this.redirectTimer = setTimeout(() => {
      this.showRedirectLoader = false;
      this.redirectSummary = null;
      this.router.navigate(redirectCommands);
    }, this.toastDurationMs);
  }

  private formatNow(): string {
    const formatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'short', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
    return formatter.format(new Date());
  }

  private buildNormalizedJobPayload(): any {
    const source = this.job as CreateJobDto | UpdateJobDto;
    const requirements = this.normalizeRequirements((source as any).requirements);
    const closingDate = this.normalizeClosingDate(source.closingDate);
    const salaryNumber = this.extractSalaryNumber((source as any).salary, source.salaryRange);

    const payload: any = {
      title: source.title?.trim() ?? '',
      description: source.description?.trim() ?? '',
      department: source.department?.trim() ?? '',
      location: source.location?.trim() ?? '',
      isActive: source.isActive
    };

    if (source.salaryRange !== undefined) {
      const salaryRangeValue = source.salaryRange ? `${source.salaryRange}`.trim() : '';
      if (salaryRangeValue) payload.salaryRange = salaryRangeValue;
    }

    if (salaryNumber !== undefined) {
      payload.salary = salaryNumber;
    }

    if (requirements !== undefined) {
      payload.requirements = requirements;
    }

    if (closingDate !== undefined) {
      payload.closingDate = closingDate;
    }

    return payload;
  }

  private normalizeRequirements(value: any): string[] | undefined {
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) {
      const items = value.map(v => `${v}`.trim()).filter(Boolean);
      return items;
    }
    if (typeof value === 'string') {
      const items = value
        .split(/[\r\n,;]+/)
        .map(s => s.trim())
        .filter(Boolean);
      return items;
    }
    return undefined;
  }

  private normalizeClosingDate(value: any): string | undefined {
    if (!value) return undefined;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return undefined;
      const date = new Date(trimmed);
      return isNaN(date.getTime()) ? trimmed : date.toISOString();
    }
    return undefined;
  }

  private extractSalaryNumber(rawSalary: any, salaryRange: any): number | undefined {
    if (rawSalary !== undefined && rawSalary !== null) {
      if (typeof rawSalary === 'number' && !isNaN(rawSalary)) return rawSalary;
      const match = `${rawSalary}`.match(/\d[\d,]*/);
      if (match) {
        const digits = match[0].replace(/,/g, '');
        const parsed = parseInt(digits, 10);
        if (!isNaN(parsed)) return parsed;
      }
    }

    if (salaryRange) {
      const match = `${salaryRange}`.match(/\d[\d,]*/);
      if (match) {
        const digits = match[0].replace(/,/g, '');
        const parsed = parseInt(digits, 10);
        if (!isNaN(parsed)) return parsed;
      }
    }

    return undefined;
  }
}

