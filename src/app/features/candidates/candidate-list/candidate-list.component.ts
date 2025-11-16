import { Component, OnInit } from '@angular/core';
import { CommonModule, NgForOf, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CandidateService } from '../../../core/services/candidate.service';
import { Candidate } from '../../../shared/models/candidate.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgIf, NgForOf],
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
  readonly maxSkillPreviewLength = 7;
  hoveredCandidateId: number | null = null;
  hoveredTooltip: string | null = null;

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
        this.candidates = result.items
          .filter(c => !c.isDeleted)
          .map(c => ({
            ...c,
            keySkills: this.normalizeKeySkills(c.keySkills),
            skills: this.normalizeLegacySkills(c)
          }));
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

  onRowDoubleClick(candidate: Candidate): void {
    if (!candidate?.id) return;
    this.viewCandidate(candidate.id);
  }

  formatSkills(candidate: Candidate): string {
    const skillList = this.resolveSkillList(candidate);
    if (!skillList.length) return 'N/A';
    const joined = skillList.join(', ');
    if (joined.length <= this.maxSkillPreviewLength) {
      return joined;
    }
    return `${joined.slice(0, this.maxSkillPreviewLength)}…`;
  }

  getSkillsTooltip(candidate: Candidate): string | null {
    const skillList = this.resolveSkillList(candidate);
    return skillList.length ? skillList.join(', ') : null;
  }

  onSkillMouseEnter(candidate: Candidate): void {
    if (!candidate?.id) return;
    this.hoveredCandidateId = candidate.id;
    this.hoveredTooltip = this.getSkillsTooltip(candidate);
  }

  onSkillMouseLeave(): void {
    this.hoveredCandidateId = null;
    this.hoveredTooltip = null;
  }

  private resolveSkillList(candidate: Candidate): string[] {
    if (candidate.keySkills) {
      if (Array.isArray(candidate.keySkills)) {
        return candidate.keySkills;
      }
      if (typeof candidate.keySkills === 'string') {
        return candidate.keySkills
          .split(/[,|]/)
          .map((skill: string) => skill.trim())
          .filter(Boolean);
      }
    }
    if (candidate.skills) {
      const raw = Array.isArray(candidate.skills) ? candidate.skills.join(',') : String(candidate.skills);
      return raw
        .split(/[,|]/)
        .map((skill: string) => skill.trim())
        .filter(Boolean);
    }
    return [];
  }

  private normalizeKeySkills(keySkills?: string[] | string | null): string[] | undefined {
    if (Array.isArray(keySkills)) {
      return keySkills.map(skill => skill.trim()).filter(Boolean);
    }
    if (typeof keySkills === 'string') {
      return keySkills
        .split(/[,|]/)
        .map(skill => skill.trim())
        .filter(Boolean);
    }
    return undefined;
  }

  private normalizeLegacySkills(candidate: Candidate): string | undefined {
    if (!candidate.skills) return undefined;
    const list = Array.isArray(candidate.skills)
      ? candidate.skills
      : candidate.skills
          .split(/[,|]/)
          .map(skill => skill.trim())
          .filter(Boolean);
    if (!list.length) return undefined;
    return list.join(', ');
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

