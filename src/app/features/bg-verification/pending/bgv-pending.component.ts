import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type PendingStatus = 'Awaiting partner pickup' | 'Client clarification' | 'Escalated';
type RiskSignal = 'Low' | 'Medium' | 'High';
type PendingFilter = 'all' | 'overdue' | 'documents' | 'high-risk';

interface PendingCase {
  id: string;
  candidate: string;
  role: string;
  location: string;
  checks: string[];
  provider: string;
  submittedOn: Date;
  daysPending: number;
  documentsOutstanding: string[];
  risk: RiskSignal;
  status: PendingStatus;
  notes: string;
}

@Component({
  selector: 'app-bgv-pending',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bgv-pending.component.html',
  styleUrls: ['./bgv-pending.component.css']
})
export class BgvPendingComponent {
  readonly missionStatement = 'Spot risk early, keep candidates moving, and remove the mystery around pending background checks.';

  readonly filters: { id: PendingFilter; label: string }[] = [
    { id: 'all', label: 'All pending' },
    { id: 'overdue', label: 'Over 5 days' },
    { id: 'documents', label: 'Documents required' },
    { id: 'high-risk', label: 'High risk signals' }
  ];

  selectedFilter: PendingFilter = 'all';

  readonly pendingCases: PendingCase[] = [
    {
      id: 'BGV-P-2101',
      candidate: 'Asha Nair',
      role: 'Backend Engineer · Bengaluru',
      location: 'India',
      checks: ['Education', 'Criminal'],
      provider: 'CheckMate',
      submittedOn: new Date('2025-11-15'),
      daysPending: 8,
      documentsOutstanding: ['Degree certificate notarised copy'],
      risk: 'Medium',
      status: 'Client clarification',
      notes: 'University registrar closed for holiday. Candidate sourcing alternate letter.'
    },
    {
      id: 'BGV-P-2102',
      candidate: 'Leo Martins',
      role: 'Sales Executive · Lisbon',
      location: 'Portugal',
      checks: ['Employment', 'Global sanctions'],
      provider: 'SecureVerify',
      submittedOn: new Date('2025-11-19'),
      daysPending: 4,
      documentsOutstanding: [],
      risk: 'Low',
      status: 'Awaiting partner pickup',
      notes: 'Partner ETA confirmed EOD Thursday. No red flags so far.'
    },
    {
      id: 'BGV-P-2103',
      candidate: 'Mia Torres',
      role: 'Compliance Analyst · Manila',
      location: 'Philippines',
      checks: ['Criminal', 'Education', 'Employment'],
      provider: 'TrustedBG',
      submittedOn: new Date('2025-11-21'),
      daysPending: 2,
      documentsOutstanding: ['Previous employer relieving letter'],
      risk: 'High',
      status: 'Escalated',
      notes: 'Employer HR contact unresponsive. Escalated to partner regional lead.'
    }
  ];

  setFilter(filter: PendingFilter): void {
    this.selectedFilter = filter;
  }

  get filteredCases(): PendingCase[] {
    switch (this.selectedFilter) {
      case 'overdue':
        return this.pendingCases.filter(item => item.daysPending > 5);
      case 'documents':
        return this.pendingCases.filter(item => item.documentsOutstanding.length > 0);
      case 'high-risk':
        return this.pendingCases.filter(item => item.risk === 'High');
      default:
        return this.pendingCases;
    }
  }

  get totalPending(): number {
    return this.pendingCases.length;
  }

  get averagePendingDays(): number {
    if (!this.pendingCases.length) {
      return 0;
    }
    const total = this.pendingCases.reduce((acc, item) => acc + item.daysPending, 0);
    return Math.round(total / this.pendingCases.length);
  }

  get documentsRequired(): number {
    return this.pendingCases.filter(item => item.documentsOutstanding.length > 0).length;
  }

  get highRiskCount(): number {
    return this.pendingCases.filter(item => item.risk === 'High').length;
  }

  getStatusClass(status: PendingStatus): string {
    return `status-pill status-pill--${status.replace(/\s/g, '-').toLowerCase()}`;
  }

  getRiskClass(risk: RiskSignal): string {
    return `risk-chip risk-chip--${risk.toLowerCase()}`;
  }

  getDocumentsLabel(caseItem: PendingCase): string {
    if (!caseItem.documentsOutstanding.length) {
      return 'All documents in';
    }
    if (caseItem.documentsOutstanding.length === 1) {
      return caseItem.documentsOutstanding[0];
    }
    return `${caseItem.documentsOutstanding.length} items pending`;
  }
}
