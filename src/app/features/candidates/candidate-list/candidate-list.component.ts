import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CandidateService } from '../../../core/services/candidate.service';
import { Candidate } from '../../../shared/models/candidate.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './candidate-list.html',
  styleUrls: ['./candidate-list.css']
})
export class CandidateListComponent implements OnInit {
  candidates: Candidate[] = [];
  pagedResult?: PagedResult<Candidate>;
  currentPage = 1;
  pageSize = 10;
  loading = false;
  error: string | null = null;
  searchTerm = '';

  constructor(
    private candidateService: CandidateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCandidates();
  }

  loadCandidates(): void {
    this.loading = true;
    this.error = null;
    this.candidateService.getCandidates(this.currentPage, this.pageSize).subscribe({
      next: (result) => {
        this.pagedResult = result;
        this.candidates = result.items.filter(c => !c.isDeleted);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load candidates. Please try again.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadCandidates();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadCandidates();
  }

  createCandidate(): void {
    this.router.navigate(['/dashboard/candidates/create']);
  }

  viewCandidate(id: number): void {
    this.router.navigate(['/dashboard/candidates', id]);
  }

  editCandidate(id: number): void {
    this.router.navigate(['/dashboard/candidates', id, 'edit']);
  }

  deleteCandidate(id: number): void {
    if (confirm('Are you sure you want to delete this candidate?')) {
      this.candidateService.deleteCandidate(id).subscribe({
        next: () => {
          this.loadCandidates();
        },
        error: (err) => {
          this.error = 'Failed to delete candidate.';
          console.error(err);
        }
      });
    }
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
}

