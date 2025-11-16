import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CandidateService } from '../../../core/services/candidate.service';
import { Candidate } from '../../../shared/models/candidate.model';

@Component({
  selector: 'app-candidate-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './candidate-details.html',
  styleUrls: ['./candidate-details.css']
})
export class CandidateDetailsComponent implements OnInit {
  candidate?: Candidate;
  loading = false;
  error: string | null = null;

  constructor(
    private candidateService: CandidateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadCandidate(id);
    });
  }

  loadCandidate(id: number): void {
    this.loading = true;
    this.error = null;
    this.candidateService.getCandidate(id).subscribe({
      next: (candidate) => {
        this.candidate = candidate;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load candidate details.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  editCandidate(): void {
    if (this.candidate) {
      this.router.navigate(['/dashboard/candidates', this.candidate.id, 'edit']);
    }
  }

  deleteCandidate(): void {
    if (this.candidate && confirm('Are you sure you want to delete this candidate?')) {
      this.candidateService.deleteCandidate(this.candidate.id).subscribe({
        next: () => {
          this.router.navigate(['/dashboard/candidates']);
        },
        error: (err) => {
          this.error = 'Failed to delete candidate.';
          console.error(err);
        }
      });
    }
  }

  backToList(): void {
    this.router.navigate(['/dashboard/candidates']);
  }
}

