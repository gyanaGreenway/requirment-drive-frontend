import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type OnboardingStatus = 'Preboarding' | 'IT ready' | 'Compliance pending' | 'Ready for Day 1';
type HireFilter = 'all' | 'starting-soon' | 'needs-it' | 'compliance';

interface NewHireProfile {
  id: string;
  name: string;
  role: string;
  location: string;
  startDate: Date;
  manager: string;
  buddy: string;
  status: OnboardingStatus;
  checklistCompletion: number;
  tasksDueThisWeek: number;
  equipmentDispatched: boolean;
  backgroundCheckClear: boolean;
  notes: string;
}

@Component({
  selector: 'app-onboarding-new-hires',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-new-hires.component.html',
  styleUrls: ['./onboarding-new-hires.component.css']
})
export class OnboardingNewHiresComponent {
  readonly filters: { id: HireFilter; label: string }[] = [
    { id: 'all', label: 'All hires' },
    { id: 'starting-soon', label: 'Starting in 7 days' },
    { id: 'needs-it', label: 'IT setup pending' },
    { id: 'compliance', label: 'Compliance follow-up' }
  ];

  selectedFilter: HireFilter = 'all';

  readonly newHires: NewHireProfile[] = [
    {
      id: 'NH-2101',
      name: 'Amit Verma',
      role: 'Backend Engineer',
      location: 'Bengaluru · Hybrid',
      startDate: new Date('2025-12-01'),
      manager: 'Sonia Mehta',
      buddy: 'Ravi Patel',
      status: 'Preboarding',
      checklistCompletion: 62,
      tasksDueThisWeek: 3,
      equipmentDispatched: true,
      backgroundCheckClear: true,
      notes: 'Visa extension submitted. Share sprint rituals overview before day 1.'
    },
    {
      id: 'NH-2102',
      name: 'Sara Khan',
      role: 'Product Designer',
      location: 'Remote · Dubai',
      startDate: new Date('2025-12-05'),
      manager: 'Joel Mathews',
      buddy: 'Laila Menon',
      status: 'IT ready',
      checklistCompletion: 28,
      tasksDueThisWeek: 5,
      equipmentDispatched: false,
      backgroundCheckClear: true,
      notes: 'Awaiting MacBook customs clearance. Schedule design systems walkthrough.'
    },
    {
      id: 'NH-2103',
      name: 'Marcus Lee',
      role: 'Customer Success Lead',
      location: 'Singapore · Onsite',
      startDate: new Date('2025-12-09'),
      manager: 'Anita Desai',
      buddy: 'Pooja Nair',
      status: 'Compliance pending',
      checklistCompletion: 45,
      tasksDueThisWeek: 2,
      equipmentDispatched: true,
      backgroundCheckClear: false,
      notes: 'Follow up with vendor for final background check report.'
    },
    {
      id: 'NH-2104',
      name: 'Luis Romero',
      role: 'QA Automation Engineer',
      location: 'Remote · Mexico',
      startDate: new Date('2025-12-16'),
      manager: 'Divya Sinha',
      buddy: 'Hina Kapoor',
      status: 'Ready for Day 1',
      checklistCompletion: 90,
      tasksDueThisWeek: 1,
      equipmentDispatched: true,
      backgroundCheckClear: true,
      notes: 'Day-0 orientation confirmed. Share product release calendar on Friday.'
    }
  ];

  setFilter(filter: HireFilter): void {
    this.selectedFilter = filter;
  }

  get filteredHires(): NewHireProfile[] {
    switch (this.selectedFilter) {
      case 'starting-soon':
        return this.newHires.filter(hire => this.daysUntilStart(hire.startDate) <= 7);
      case 'needs-it':
        return this.newHires.filter(hire => !hire.equipmentDispatched);
      case 'compliance':
        return this.newHires.filter(hire => !hire.backgroundCheckClear);
      default:
        return this.newHires;
    }
  }

  get nextStarting(): NewHireProfile | undefined {
    return [...this.newHires]
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
      .find(hire => this.daysUntilStart(hire.startDate) >= 0);
  }

  get totalHires(): number {
    return this.newHires.length;
  }

  get startingSoonCount(): number {
    return this.newHires.filter(hire => this.daysUntilStart(hire.startDate) <= 7).length;
  }

  get itPendingCount(): number {
    return this.newHires.filter(hire => !hire.equipmentDispatched).length;
  }

  get compliancePendingCount(): number {
    return this.newHires.filter(hire => !hire.backgroundCheckClear).length;
  }

  get averageChecklistCompletion(): number {
    const total = this.newHires.reduce((acc, hire) => acc + hire.checklistCompletion, 0);
    return this.newHires.length ? Math.round(total / this.newHires.length) : 0;
  }

  get tasksDueThisWeek(): number {
    return this.newHires.reduce((acc, hire) => acc + hire.tasksDueThisWeek, 0);
  }

  getStatusBadge(status: OnboardingStatus): string {
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
