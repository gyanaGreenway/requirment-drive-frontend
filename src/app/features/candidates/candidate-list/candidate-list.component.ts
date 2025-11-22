import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CandidateService } from '../../../core/services/candidate.service';
import { Candidate } from '../../../shared/models/candidate.model';
import { PagedResult } from '../../../shared/models/paged-result.model';

interface SkillStat {
  label: string;
  count: number;
}

interface LocationStat {
  label: string;
  count: number;
  percentage: number;
}

@Component({
  selector: 'app-candidate-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NgIf, NgFor],
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
  lastRefreshed: Date | null = null;

  matchingCandidatesCount = 0;
  totalCandidatesCount = 0;
  resumeReadyCount = 0;
  headlineCount = 0;
  profileSummaryCount = 0;
  topSkills: SkillStat[] = [];
  locationBreakdown: LocationStat[] = [];

  readonly maxSkillChips = 4;

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
    this.candidateService.getCandidates(this.currentPage, this.pageSize, this.searchTerm).subscribe({
      next: (result) => {
        this.pagedResult = result;
        this.candidates = (result.items ?? [])
          .filter(c => !c.isDeleted)
          .map(c => ({
            ...c,
            keySkills: this.normalizeKeySkills(c.keySkills),
            skills: this.normalizeLegacySkills(c)
          }));
        this.loading = false;
        this.lastRefreshed = new Date();
        this.buildInsights();
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

  clearSearch(): void {
    if (!this.searchTerm) return;
    this.searchTerm = '';
    this.onSearch();
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

  trackByCandidate = (_index: number, candidate: Candidate): number => candidate.id;

  trackBySkill = (_index: number, stat: SkillStat): string => stat.label;

  getInitials(candidate: Candidate): string {
    const first = candidate.firstName?.charAt(0) ?? '';
    const last = candidate.lastName?.charAt(0) ?? '';
    const initials = `${first}${last}`.trim();
    return initials || 'C';
  }

  getSkillChips(candidate: Candidate): string[] {
    return this.resolveSkillList(candidate).slice(0, this.maxSkillChips);
  }

  getAdditionalSkillCount(candidate: Candidate): number {
    const total = this.resolveSkillList(candidate).length;
    return total > this.maxSkillChips ? total - this.maxSkillChips : 0;
  }

  getProfileSummarySnippet(candidate: Candidate): string | null {
    if (!candidate.profileSummary) return null;
    const trimmed = candidate.profileSummary.trim();
    if (!trimmed) return null;
    return trimmed.length > 160 ? `${trimmed.slice(0, 160)}…` : trimmed;
  }

  private buildInsights(): void {
    this.matchingCandidatesCount = this.candidates.length;
    this.totalCandidatesCount = this.pagedResult?.totalCount ?? this.candidates.length;
    this.resumeReadyCount = this.candidates.filter(candidate => !!candidate.resumeUrl).length;
    this.headlineCount = this.candidates.filter(candidate => !!candidate.resumeHeadline).length;
    this.profileSummaryCount = this.candidates.filter(candidate => !!candidate.profileSummary).length;
    this.topSkills = this.computeTopSkills(this.candidates, 6);
    this.locationBreakdown = this.computeLocationBreakdown(this.candidates);
  }

  private computeTopSkills(candidates: Candidate[], limit: number): SkillStat[] {
    if (!candidates.length) return [];
    const tally = new Map<string, number>();
    for (const candidate of candidates) {
      const skills = this.resolveSkillList(candidate);
      for (const skill of skills) {
        const label = skill.trim();
        if (!label) continue;
        tally.set(label, (tally.get(label) ?? 0) + 1);
      }
    }
    return Array.from(tally.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([label, count]) => ({ label, count }));
  }

  private computeLocationBreakdown(candidates: Candidate[]): LocationStat[] {
    if (!candidates.length) return [];
    const tally = new Map<string, number>();
    for (const candidate of candidates) {
      const details = candidate.personalDetails;
      const raw = `${details?.city ?? ''}`.trim() || `${details?.state ?? ''}`.trim() || `${details?.country ?? ''}`.trim() || 'Unspecified';
      const label = raw || 'Unspecified';
      tally.set(label, (tally.get(label) ?? 0) + 1);
    }
    const total = candidates.length;
    return Array.from(tally.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([label, count]) => ({
        label,
        count,
        percentage: Math.round((count / total) * 100)
      }));
  }

  private resolveSkillList(candidate: Candidate): string[] {
    if (candidate.keySkills) {
      if (Array.isArray(candidate.keySkills)) {
        return candidate.keySkills;
      }
      if (typeof candidate.keySkills === 'string') {
        return candidate.keySkills
          .split(/[,|]/)
          .map(skill => skill.trim())
          .filter(Boolean);
      }
    }
    if (candidate.skills) {
      const raw = Array.isArray(candidate.skills) ? candidate.skills.join(',') : String(candidate.skills);
      return raw
        .split(/[,|]/)
        .map(skill => skill.trim())
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
}

