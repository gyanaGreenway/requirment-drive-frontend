import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type DepartmentHealth = 'Scaling' | 'Stable' | 'Attention';
type PillarFilter = 'all' | 'product' | 'customer' | 'corporate';
type HiringFilter = 'all' | 'hiring' | 'steady';

interface DepartmentProfile {
  id: string;
  name: string;
  head: string;
  location: string;
  pillar: PillarFilter;
  headcount: number;
  openRoles: number;
  engagementScore: number;
  budgetUtilization: number;
  okrProgress: number;
  strategicFocus: string[];
  keyInitiatives: string[];
  health: DepartmentHealth;
  hiringVelocity: string;
}

interface DepartmentMetric {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'flat';
}

@Component({
  selector: 'app-employees-departments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './employees-departments.component.html',
  styleUrls: ['./employees-departments.component.css']
})
export class EmployeesDepartmentsComponent {
  readonly vision = 'A command centre view of how every department is staffed, funded, and executing against strategic focus areas.';

  readonly pillarFilters: { id: PillarFilter; label: string }[] = [
    { id: 'all', label: 'All pillars' },
    { id: 'product', label: 'Product & Engineering' },
    { id: 'customer', label: 'Customer & Revenue' },
    { id: 'corporate', label: 'Corporate Services' }
  ];

  readonly hiringFilters: { id: HiringFilter; label: string }[] = [
    { id: 'all', label: 'All hiring states' },
    { id: 'hiring', label: 'Actively hiring' },
    { id: 'steady', label: 'Steady state' }
  ];

  selectedPillar: PillarFilter = 'all';
  selectedHiring: HiringFilter = 'all';

  readonly departments: DepartmentProfile[] = [
    {
      id: 'DEPT-01',
      name: 'Platform Engineering',
      head: 'Sweta Iyer',
      location: 'Bengaluru · Remote friendly',
      pillar: 'product',
      headcount: 68,
      openRoles: 6,
      engagementScore: 87,
      budgetUtilization: 82,
      okrProgress: 0.71,
      strategicFocus: ['API reliability uplift', 'Developer velocity enablement'],
      keyInitiatives: ['Incident command refresh', 'Service catalog automation'],
      health: 'Scaling',
      hiringVelocity: 'Avg time-to-fill: 32 days'
    },
    {
      id: 'DEPT-02',
      name: 'Experience Design',
      head: 'Amelia Chen',
      location: 'Lisbon · Hybrid',
      pillar: 'product',
      headcount: 24,
      openRoles: 2,
      engagementScore: 92,
      budgetUtilization: 76,
      okrProgress: 0.64,
      strategicFocus: ['Design system 3.0', 'Employee journey blueprint'],
      keyInitiatives: ['Design QA guild', 'Accessibility clinic'],
      health: 'Stable',
      hiringVelocity: 'Avg time-to-fill: 27 days'
    },
    {
      id: 'DEPT-03',
      name: 'Customer Success',
      head: 'Olivia Becker',
      location: 'Toronto · Regional hubs',
      pillar: 'customer',
      headcount: 56,
      openRoles: 3,
      engagementScore: 84,
      budgetUtilization: 88,
      okrProgress: 0.58,
      strategicFocus: ['Gross retention to 94%', 'Voice of customer loops'],
      keyInitiatives: ['Playbook 2.0 rollout', 'Health score automation'],
      health: 'Scaling',
      hiringVelocity: 'Avg time-to-fill: 29 days'
    },
    {
      id: 'DEPT-04',
      name: 'People Operations',
      head: 'Priya Raman',
      location: 'Dubai · Global coverage',
      pillar: 'corporate',
      headcount: 31,
      openRoles: 0,
      engagementScore: 89,
      budgetUtilization: 73,
      okrProgress: 0.66,
      strategicFocus: ['Manager capability uplift', 'People analytics maturity'],
      keyInitiatives: ['Manager lab series', 'HRIS automation stream'],
      health: 'Stable',
      hiringVelocity: 'No active requisitions'
    }
  ];

  get metrics(): DepartmentMetric[] {
    return [
      {
        label: 'Total headcount',
        value: `${this.totalHeadcount}`,
        delta: '+12 net new this quarter',
        trend: 'up'
      },
      {
        label: 'Open roles',
        value: `${this.openRoles}`,
        delta: 'Hiring velocity improving',
        trend: 'up'
      },
      {
        label: 'Avg engagement',
        value: `${this.averageEngagement}%`,
        delta: '+3 pts vs last quarter',
        trend: 'up'
      },
      {
        label: 'Budget utilisation',
        value: `${this.averageBudget}%`,
        delta: 'Holding within plan',
        trend: 'flat'
      }
    ];
  }

  get filteredDepartments(): DepartmentProfile[] {
    return this.departments.filter(department => {
      const matchesPillar = this.selectedPillar === 'all' || department.pillar === this.selectedPillar;
      const matchesHiring = this.matchesHiringFilter(department);
      return matchesPillar && matchesHiring;
    });
  }

  get totalHeadcount(): number {
    return this.departments.reduce((acc, department) => acc + department.headcount, 0);
  }

  get openRoles(): number {
    return this.departments.reduce((acc, department) => acc + department.openRoles, 0);
  }

  get averageEngagement(): number {
    if (!this.departments.length) {
      return 0;
    }
    const total = this.departments.reduce((acc, department) => acc + department.engagementScore, 0);
    return Math.round((total / this.departments.length) * 10) / 10;
  }

  get averageBudget(): number {
    if (!this.departments.length) {
      return 0;
    }
    const total = this.departments.reduce((acc, department) => acc + department.budgetUtilization, 0);
    return Math.round(total / this.departments.length);
  }

  setPillar(filter: PillarFilter): void {
    this.selectedPillar = filter;
  }

  setHiring(filter: HiringFilter): void {
    this.selectedHiring = filter;
  }

  getHealthBadge(health: DepartmentHealth): string {
    switch (health) {
      case 'Scaling':
        return 'health-pill health-pill--scaling';
      case 'Stable':
        return 'health-pill health-pill--stable';
      default:
        return 'health-pill health-pill--attention';
    }
  }

  getBudgetLabel(budget: number): string {
    if (budget > 90) {
      return 'At risk of overspend';
    }
    if (budget < 70) {
      return 'Under plan';
    }
    return 'On plan';
  }

  getProgressWidth(progress: number): string {
    return `${Math.round(progress * 100)}%`;
  }

  trackByDepartment(_: number, department: DepartmentProfile): string {
    return department.id;
  }

  private matchesHiringFilter(department: DepartmentProfile): boolean {
    if (this.selectedHiring === 'hiring') {
      return department.openRoles > 0;
    }
    if (this.selectedHiring === 'steady') {
      return department.openRoles === 0;
    }
    return true;
  }
}
