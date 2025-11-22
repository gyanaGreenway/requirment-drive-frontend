import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type RiskRating = 'Cleared' | 'Review' | 'Critical';
type CompletedFilter = 'all' | 'clean' | 'exceptions';

interface CompletedResult {
  id: string;
  candidate: string;
  role: string;
  location: string;
  checksCompleted: number;
  issuesFound: number;
  completedOn: Date;
  turnaroundDays: number;
  risk: RiskRating;
  highlights: string[];
}

@Component({
  selector: 'app-bgv-completed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bgv-completed.component.html',
  styleUrls: ['./bgv-completed.component.css']
})
export class BgvCompletedComponent {
  readonly celebrationStatement = 'Convert tedious background checks into confident go-live decisions with complete audit readiness.';

  readonly filters: { id: CompletedFilter; label: string }[] = [
    { id: 'all', label: 'All completions' },
    { id: 'clean', label: 'Cleared' },
    { id: 'exceptions', label: 'Exceptions flagged' }
  ];

  selectedFilter: CompletedFilter = 'all';

  readonly results: CompletedResult[] = [
    {
      id: 'BGV-C-4101',
      candidate: 'Neha Patel',
      role: 'Data Engineer · Hyderabad',
      location: 'India',
      checksCompleted: 5,
      issuesFound: 0,
      completedOn: new Date('2025-11-10'),
      turnaroundDays: 6,
      risk: 'Cleared',
      highlights: ['All employers verified', 'No court records']
    },
    {
      id: 'BGV-C-4102',
      candidate: 'Daniel Ruiz',
      role: 'Sales Manager · Madrid',
      location: 'Spain',
      checksCompleted: 4,
      issuesFound: 1,
      completedOn: new Date('2025-11-13'),
      turnaroundDays: 8,
      risk: 'Review',
      highlights: ['One employment gap flagged', 'Awaiting hiring manager sign-off']
    },
    {
      id: 'BGV-C-4103',
      candidate: 'Iris Kim',
      role: 'HR Business Partner · Seoul',
      location: 'South Korea',
      checksCompleted: 6,
      issuesFound: 0,
      completedOn: new Date('2025-11-16'),
      turnaroundDays: 5,
      risk: 'Cleared',
      highlights: ['Education verified in 48h', 'Sanctions check clean']
    }
  ];

  setFilter(filter: CompletedFilter): void {
    this.selectedFilter = filter;
  }

  get filteredResults(): CompletedResult[] {
    switch (this.selectedFilter) {
      case 'clean':
        return this.results.filter(result => result.risk === 'Cleared');
      case 'exceptions':
        return this.results.filter(result => result.risk !== 'Cleared');
      default:
        return this.results;
    }
  }

  get totalCompleted(): number {
    return this.results.length;
  }

  get clearedCount(): number {
    return this.results.filter(result => result.risk === 'Cleared').length;
  }

  get exceptionCount(): number {
    return this.results.filter(result => result.risk !== 'Cleared').length;
  }

  get averageTurnaround(): number {
    if (!this.results.length) {
      return 0;
    }
    const total = this.results.reduce((acc, result) => acc + result.turnaroundDays, 0);
    return Math.round((total / this.results.length) * 10) / 10;
  }

  getRiskChipClass(risk: RiskRating): string {
    return `risk-chip risk-chip--${risk.replace(/\s/g, '-').toLowerCase()}`;
  }
}
