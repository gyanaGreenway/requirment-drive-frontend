import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CandidateService } from '../../../core/services/candidate.service';
import { Candidate, CreateCandidateDto, UpdateCandidateDto } from '../../../shared/models/candidate.model';

@Component({
  selector: 'app-candidate-create',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './candidate-create.html',
  styleUrls: ['./candidate-create.css']
})
export class CandidateCreateComponent implements OnInit {
  candidate: CreateCandidateDto | UpdateCandidateDto = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    resumeUrl: '',
    keySkills: []
  };
  isEditMode = false;
  candidateId?: number;
  loading = false;
  error: string | null = null;
  submitting = false;

  constructor(
    private candidateService: CandidateService,
    private router: Router,
    private route: ActivatedRoute
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

  loadCandidate(): void {
    if (!this.candidateId) return;
    this.loading = true;
    this.candidateService.getCandidate(this.candidateId).subscribe({
      next: (candidate) => {
        this.candidate = {
          id: candidate.id,
          firstName: candidate.firstName,
          lastName: candidate.lastName,
          email: candidate.email,
          phone: candidate.phone || '',
          resumeUrl: candidate.resumeUrl || '',
          keySkills: candidate.keySkills || [],
          rowVersion: candidate.rowVersion
        };
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

    // Convert keySkills string to array if needed
    if (typeof this.candidate.keySkills === 'string') {
      this.candidate.keySkills = (this.candidate.keySkills as string).split(',').map(s => s.trim()).filter(s => !!s);
    }
    if (this.isEditMode && this.candidateId) {
      const updateDto = this.candidate as UpdateCandidateDto;
      updateDto.id = this.candidateId;
      this.candidateService.updateCandidate(updateDto).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/candidates', this.candidateId]);
        },
        error: (err) => {
          this.error = 'Failed to update candidate. Please try again.';
          this.submitting = false;
          console.error(err);
        }
      });
    } else {
      const createDto = this.candidate as CreateCandidateDto;
      this.candidateService.createCandidate(createDto).subscribe({
        next: (createdCandidate) => {
          this.router.navigate(['/dashboard/candidates']);
        },
        error: (err) => {
          this.error = 'Failed to create candidate. Please try again.';
          this.submitting = false;
          console.error(err);
        }
      });
    }
  }

  isFormValid(): boolean {
    return !!(this.candidate.firstName && this.candidate.lastName && this.candidate.email);
  }

  cancel(): void {
    if (this.isEditMode && this.candidateId) {
      this.router.navigate(['/dashboard/candidates', this.candidateId]);
    } else {
      this.router.navigate(['/dashboard/candidates']);
    }
  }
}

