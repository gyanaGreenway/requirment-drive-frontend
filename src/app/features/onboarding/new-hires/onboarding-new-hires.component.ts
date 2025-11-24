import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnboardingService } from '../../../core/services/onboarding.service';
import { Onboarding } from '../../../shared/models/onboarding.model';

type OnboardingStatus = 'Preboarding' | 'IT ready' | 'Compliance pending' | 'Ready for Day 1';
type HireFilter = 'all' | 'starting-soon' | 'needs-it' | 'compliance';

@Component({
  selector: 'app-onboarding-new-hires',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-new-hires.component.html',
  styleUrls: ['./onboarding-new-hires.component.css']
})
export class OnboardingNewHiresComponent implements OnInit {
  readonly filters: { id: HireFilter; label: string }[] = [
    { id: 'all', label: 'All hires' },
    { id: 'starting-soon', label: 'Starting in 7 days' },
    { id: 'needs-it', label: 'IT setup pending' },
    { id: 'compliance', label: 'Compliance follow-up' }
  ];

  selectedFilter: HireFilter = 'all';
  newHires: Onboarding[] = [];
  loading = false;
  error: string | null = null;

  constructor(public onboardingService: OnboardingService) {}

  ngOnInit(): void {
    this.fetchNewHires();
  }

  fetchNewHires(): void {
    this.loading = true;
    this.onboardingService.getAll({ pageSize: 25 }).subscribe({
      next: (result: { items: Onboarding[] }) => {
        this.newHires = result.items;
        this.loading = false;
      },
      error: (err: any) => {
        this.error = 'Failed to load new hires.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  setFilter(filter: HireFilter): void {
    this.selectedFilter = filter;
  }

  get filteredHires(): Onboarding[] {
    switch (this.selectedFilter) {
      case 'starting-soon':
        return this.newHires.filter(hire => this.daysUntilStart(new Date(hire.startDate)) <= 7);
      case 'needs-it':
        return this.newHires.filter(hire => !hire.equipmentDispatched);
      case 'compliance':
        return this.newHires.filter(hire => !hire.backgroundCheckClear);
      default:
        return this.newHires;
    }
  }

  get nextStarting(): Onboarding | undefined {
    return [...this.newHires]
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
      .find(hire => this.daysUntilStart(new Date(hire.startDate)) >= 0);
  }

  get totalHires(): number {
    return this.newHires.length;
  }

  get startingSoonCount(): number {
    return this.newHires.filter(hire => this.daysUntilStart(new Date(hire.startDate)) <= 7).length;
  }

  get itPendingCount(): number {
    return this.newHires.filter(hire => !hire.equipmentDispatched).length;
  }

  get compliancePendingCount(): number {
    return this.newHires.filter(hire => !hire.backgroundCheckClear).length;
  }

  get averageChecklistCompletion(): number {
    const total = this.newHires.reduce((acc, hire) => acc + (hire.checklistCompletion || 0), 0);
    return this.newHires.length ? Math.round(total / this.newHires.length) : 0;
  }

  get tasksDueThisWeek(): number {
    return this.newHires.reduce((acc, hire) => acc + (hire.tasksDueThisWeek || 0), 0);
  }

  getStatusBadge(status: string): string {
    return `status-pill status-pill--${status.replace(/\s/g, '-').toLowerCase()}`;
  }

  getProgressWidth(percent: number): string {
    return `${Math.min(Math.max(percent, 0), 100)}%`;
  }

  daysUntilStart(startDate: Date): number {
    const today = new Date();
    const diff = startDate.getTime() - this.startOfDay(today).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
