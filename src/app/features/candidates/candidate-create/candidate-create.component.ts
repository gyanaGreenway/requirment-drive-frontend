import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CandidateService } from '../../../core/services/candidate.service';
import { CreateCandidateDto, UpdateCandidateDto } from '../../../shared/models/candidate.model';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-candidate-create',
  standalone: true,
  imports: [CommonModule, NgIf, RouterModule, FormsModule],
  templateUrl: './candidate-create.html',
  styleUrls: ['./candidate-create.css']
})
export class CandidateCreateComponent implements OnInit, OnDestroy {
  candidate: CreateCandidateDto | UpdateCandidateDto = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resumeUrl: '',
    keySkills: []
  };
  keySkillsInput = '';
  passwordInput = '';
  isEditMode = false;
  candidateId?: number;
  loading = false;
  error: string | null = null;
  submitting = false;
  showRedirectLoader = false;
  redirectSummary: string | null = null;
  private redirectTimer: any = null;
  readonly toastDurationMs = 5000;

  constructor(
    private candidateService: CandidateService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.candidateId = +params['id'];
        this.isEditMode = this.router.url.includes('/edit');
        if (this.isEditMode) {
          this.loadCandidate();
        } else {
          this.router.navigate(['/dashboard/candidates', this.candidateId]);
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

  loadCandidate(): void {
    if (!this.candidateId) return;
    this.loading = true;
    this.candidateService.getCandidate(this.candidateId).subscribe({
      next: (candidate) => {
        const normalizedKeySkills = this.normalizeKeySkills(candidate.keySkills);
        const keySkillsArray = normalizedKeySkills ?? [];
        this.candidate = {
          id: candidate.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone || '',
          resumeUrl: candidate.resumeUrl || '',
          keySkills: keySkillsArray,
          rowVersion: candidate.rowVersion
        } as UpdateCandidateDto;
        this.keySkillsInput = keySkillsArray.join(', ');
        this.passwordInput = '';
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load candidate.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onSubmit(): void {
    if (!this.isFormValid()) return;

    this.submitting = true;
    this.error = null;

    const normalized = this.buildNormalizedCandidatePayload();

    if (this.isEditMode && this.candidateId) {
      const current = this.candidate as UpdateCandidateDto;
      const payload = {
        ...normalized,
        id: this.candidateId,
        rowVersion: current.rowVersion
      };

      this.candidateService.updateCandidate(payload).subscribe({
        next: () => {
          const titleName = this.buildDisplayName(payload.firstName, payload.lastName);
          const message = `${titleName} candidate has been updated successfully on ${this.formatNow()}`;
          this.handleSuccess(message, ['/dashboard/candidates', this.candidateId]);
        },
        error: (err) => {
          this.error = 'Failed to update candidate. Please try again.';
          this.submitting = false;
          this.toast.error('Failed to update candidate', 3500, true);
          console.error(err);
        }
      });
    } else {
      const password = this.passwordInput.trim();
      const payload = {
        ...normalized,
        password: password || undefined
      };

      this.candidateService.createCandidate(payload).subscribe({
        next: () => {
          const titleName = this.buildDisplayName(payload.firstName, payload.lastName);
          const message = `${titleName} candidate has been created successfully on ${this.formatNow()}`;
          this.handleSuccess(message, ['/dashboard/candidates']);
        },
        error: (err) => {
          this.error = 'Failed to create candidate. Please try again.';
          this.submitting = false;
          this.toast.error('Failed to create candidate', 3500, true);
          console.error(err);
        }
      });
    }
  }

  isFormValid(): boolean {
    const hasBasics = !!(this.candidate.firstName && this.candidate.lastName && this.candidate.email);
    if (this.isEditMode) return hasBasics;
    return hasBasics && this.passwordInput.trim().length >= 6;
  }

  cancel(): void {
    if (this.isEditMode && this.candidateId) {
      this.router.navigate(['/dashboard/candidates', this.candidateId]);
    } else {
      this.router.navigate(['/dashboard/candidates']);
    }
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

  private buildDisplayName(firstName?: string, lastName?: string): string {
    const parts = [firstName?.trim(), lastName?.trim()].filter(Boolean);
    return parts.length ? parts.join(' ') : 'Candidate';
  }

  private buildNormalizedCandidatePayload(): any {
    const source = this.candidate as CreateCandidateDto | UpdateCandidateDto;

    const payload: any = {
      firstName: source.firstName?.trim() ?? '',
      lastName: source.lastName?.trim() ?? '',
      email: source.email?.trim() ?? ''
    };

    if (source.phone !== undefined) {
      const phoneValue = source.phone ? `${source.phone}`.trim() : '';
      if (phoneValue) payload.phone = phoneValue;
    }

    if (source.resumeUrl !== undefined) {
      const resumeValue = source.resumeUrl ? `${source.resumeUrl}`.trim() : '';
      if (resumeValue) payload.resumeUrl = resumeValue;
    }

    if ((source as any).resumeHeadline) {
      payload.resumeHeadline = (source as any).resumeHeadline;
    }

    const keySkills = this.normalizeKeySkills(this.keySkillsInput);
    if (keySkills !== undefined) {
      payload.keySkills = keySkills;
    }

    if ((source as any).profileSummary) {
      payload.profileSummary = (source as any).profileSummary;
    }

    if ((source as any).accomplishments) {
      payload.accomplishments = (source as any).accomplishments;
    }

    if ((source as any).careerProfile) {
      payload.careerProfile = (source as any).careerProfile;
    }

    if ((source as any).personalDetails) {
      payload.personalDetails = (source as any).personalDetails;
    }

    return payload;
  }

  private normalizeKeySkills(value: any): string[] | undefined {
    if (value === undefined || value === null) return undefined;
    if (Array.isArray(value)) {
      return value.map(v => `${v}`.trim()).filter(Boolean);
    }
    if (typeof value === 'string') {
      return value
        .split(/[\r\n,;]+/)
        .map(s => s.trim())
        .filter(Boolean);
    }
    return undefined;
  }
}

