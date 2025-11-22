import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type EmployeeStatus = 'Active' | 'Onboarding' | 'On Leave';
type FilterOption = 'all' | 'product' | 'gtm' | 'corporate';
type LocationOption = 'all' | 'amer' | 'emea' | 'apac';

interface EmployeeProfile {
  id: string;
  name: string;
  role: string;
  department: string;
  orgArea: FilterOption;
  location: string;
  region: LocationOption;
  status: EmployeeStatus;
  manager: string;
  startDate: Date;
  tenureMonths: number;
  projects: string[];
  skills: string[];
  email: string;
}

interface DirectoryMetric {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'flat';
}

@Component({
  selector: 'app-employees-directory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employees-directory.component.html',
  styleUrls: ['./employees-directory.component.css']
})
export class EmployeesDirectoryComponent {
  readonly narrative = 'A living directory that keeps teams connected with clarity on roles, locations, and availability across the organisation.';

  readonly departmentFilters: { id: FilterOption; label: string }[] = [
    { id: 'all', label: 'All org areas' },
    { id: 'product', label: 'Product & Engineering' },
    { id: 'gtm', label: 'Go-To-Market' },
    { id: 'corporate', label: 'Corporate Services' }
  ];

  readonly locationFilters: { id: LocationOption; label: string }[] = [
    { id: 'all', label: 'All regions' },
    { id: 'amer', label: 'Americas' },
    { id: 'emea', label: 'EMEA' },
    { id: 'apac', label: 'APAC' }
  ];

  readonly statusFilters: { id: EmployeeStatus | 'all'; label: string }[] = [
    { id: 'all', label: 'Everyone' },
    { id: 'Active', label: 'Active' },
    { id: 'Onboarding', label: 'Onboarding' },
    { id: 'On Leave', label: 'On leave' }
  ];

  selectedDepartment: FilterOption = 'all';
  selectedRegion: LocationOption = 'all';
  selectedStatus: EmployeeStatus | 'all' = 'all';
  searchTerm = '';

  readonly employees: EmployeeProfile[] = [
    {
      id: 'EMP-401',
      name: 'Aakash Rao',
      role: 'Engineering Manager',
      department: 'Platform Engineering',
      orgArea: 'product',
      location: 'Bengaluru, India',
      region: 'apac',
      status: 'Active',
      manager: 'Leah Watson',
      startDate: new Date('2021-03-15'),
      tenureMonths: 52,
      projects: ['Edge performance uplift', 'Observability stack rollout'],
      skills: ['Go', 'Kubernetes', 'Site Reliability'],
      email: 'aakash.rao@example.com'
    },
    {
      id: 'EMP-402',
      name: 'Marina Costa',
      role: 'Lead Product Designer',
      department: 'Product Design',
      orgArea: 'product',
      location: 'Lisbon, Portugal',
      region: 'emea',
      status: 'Active',
      manager: 'Jonah Clarke',
      startDate: new Date('2022-07-01'),
      tenureMonths: 40,
      projects: ['New hire onboarding flows', 'Mobile brand refresh'],
      skills: ['Design Systems', 'Figma', 'User Research'],
      email: 'marina.costa@example.com'
    },
    {
      id: 'EMP-403',
      name: 'Ryan Wilson',
      role: 'Enterprise Sales Lead',
      department: 'Enterprise Sales',
      orgArea: 'gtm',
      location: 'Austin, USA',
      region: 'amer',
      status: 'Active',
      manager: 'Camila Ortiz',
      startDate: new Date('2023-02-20'),
      tenureMonths: 30,
      projects: ['Q4 expansion pipeline', 'Strategic accounts enablement'],
      skills: ['Enterprise SaaS', 'Forecasting', 'Deal Coaching'],
      email: 'ryan.wilson@example.com'
    },
    {
      id: 'EMP-404',
      name: 'Fatima Khan',
      role: 'HR Business Partner',
      department: 'People Operations',
      orgArea: 'corporate',
      location: 'Dubai, UAE',
      region: 'emea',
      status: 'Onboarding',
      manager: 'Priya Raman',
      startDate: new Date('2025-11-04'),
      tenureMonths: 1,
      projects: ['Manager capability uplift', 'Hybrid work playbook'],
      skills: ['Employee Relations', 'Talent Development'],
      email: 'fatima.khan@example.com'
    },
    {
      id: 'EMP-405',
      name: 'Diego Alvarez',
      role: 'Revenue Operations Analyst',
      department: 'Revenue Operations',
      orgArea: 'gtm',
      location: 'Bogotá, Colombia',
      region: 'amer',
      status: 'On Leave',
      manager: 'Camila Ortiz',
      startDate: new Date('2020-08-24'),
      tenureMonths: 63,
      projects: ['Salesforce hygiene program', 'Quarterly pipeline audit'],
      skills: ['CRM Strategy', 'SQL', 'RevOps'],
      email: 'diego.alvarez@example.com'
    },
    {
      id: 'EMP-406',
      name: 'Haruka Sato',
      role: 'Customer Success Manager',
      department: 'Customer Success',
      orgArea: 'gtm',
      location: 'Tokyo, Japan',
      region: 'apac',
      status: 'Active',
      manager: 'Olivia Becker',
      startDate: new Date('2024-05-13'),
      tenureMonths: 19,
      projects: ['APAC retention program', 'Voice of customer council'],
      skills: ['Customer Advocacy', 'Account Planning', 'Japanese'],
      email: 'haruka.sato@example.com'
    }
  ];

  get metrics(): DirectoryMetric[] {
    return [
      {
        label: 'Total workforce',
        value: `${this.employees.length}`,
        delta: '+4 in last 30 days',
        trend: 'up'
      },
      {
        label: 'In onboarding',
        value: `${this.onboardingCount}`,
        delta: 'Offer-to-start: 9 days',
        trend: 'up'
      },
      {
        label: 'Average tenure',
        value: `${this.averageTenure} months`,
        delta: 'Stable quarter-over-quarter',
        trend: 'flat'
      },
      {
        label: 'Active leave cases',
        value: `${this.leaveCount}`,
        delta: 'Return pipeline: 2 next month',
        trend: 'down'
      }
    ];
  }

  get filteredEmployees(): EmployeeProfile[] {
    return this.employees.filter(profile => {
      const matchesDepartment = this.selectedDepartment === 'all' || profile.orgArea === this.selectedDepartment;
      const matchesRegion = this.selectedRegion === 'all' || profile.region === this.selectedRegion;
      const matchesStatus = this.selectedStatus === 'all' || profile.status === this.selectedStatus;
      const matchesSearch = this.matchesSearch(profile);
      return matchesDepartment && matchesRegion && matchesStatus && matchesSearch;
    });
  }

  get onboardingCount(): number {
    return this.employees.filter(employee => employee.status === 'Onboarding').length;
  }

  get leaveCount(): number {
    return this.employees.filter(employee => employee.status === 'On Leave').length;
  }

  get averageTenure(): number {
    if (!this.employees.length) {
      return 0;
    }
    const total = this.employees.reduce((acc, employee) => acc + employee.tenureMonths, 0);
    return Math.round((total / this.employees.length) * 10) / 10;
  }

  setDepartment(filter: FilterOption): void {
    this.selectedDepartment = filter;
  }

  setRegion(filter: LocationOption): void {
    this.selectedRegion = filter;
  }

  setStatus(filter: EmployeeStatus | 'all'): void {
    this.selectedStatus = filter;
  }

  getStatusPill(status: EmployeeStatus): string {
    switch (status) {
      case 'Active':
        return 'status-pill status-pill--active';
      case 'Onboarding':
        return 'status-pill status-pill--onboarding';
      default:
        return 'status-pill status-pill--leave';
    }
  }

  getTenureLabel(employee: EmployeeProfile): string {
    if (employee.tenureMonths < 12) {
      return `${employee.tenureMonths} months tenure`;
    }
    const years = Math.floor(employee.tenureMonths / 12);
    const remainingMonths = employee.tenureMonths % 12;
    return remainingMonths
      ? `${years}y ${remainingMonths}m tenure`
      : `${years} years tenure`;
  }

  trackByEmployeeId(_: number, employee: EmployeeProfile): string {
    return employee.id;
  }

  private matchesSearch(profile: EmployeeProfile): boolean {
    if (!this.searchTerm.trim()) {
      return true;
    }
    const term = this.searchTerm.toLowerCase();
    return (
      profile.name.toLowerCase().includes(term) ||
      profile.role.toLowerCase().includes(term) ||
      profile.department.toLowerCase().includes(term) ||
      profile.location.toLowerCase().includes(term) ||
      profile.skills.some(skill => skill.toLowerCase().includes(term))
    );
  }
}
