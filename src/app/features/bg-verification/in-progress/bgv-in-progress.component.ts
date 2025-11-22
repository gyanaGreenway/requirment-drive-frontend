import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type InvestigationStatus = 'Verifying' | 'Awaiting client input' | 'Provider escalation';
type InvestigationStage = 'Identity' | 'Employment' | 'Education' | 'Criminal';
type InProgressFilter = 'all' | 'eta-3' | 'awaiting-client' | 'escalations';

interface InvestigationRecord {
  id: string;
  candidate: string;
  role: string;
  provider: string;
  stages: InvestigationStage[];
  startedOn: Date;
  etaDays: number;
  status: InvestigationStatus;
  progress: number;
  notes: string;
}

@Component({
  selector: 'app-bgv-in-progress',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bgv-in-progress.component.html',
  styleUrls: ['./bgv-in-progress.component.css']
})
export class BgvInProgressComponent {
  readonly missionStatement = 'Keep investigations moving with zero surprises for recruiters, candidates, or compliance leaders.';

  readonly filters: { id: InProgressFilter; label: string }[] = [
    { id: 'all', label: 'All investigations' },
    { id: 'eta-3', label: 'ETA < 3 days' },
    { id: 'awaiting-client', label: 'Client action needed' },
    { id: 'escalations', label: 'Provider escalations' }
  ];

  selectedFilter: InProgressFilter = 'all';

  readonly investigations: InvestigationRecord[] = [
    {
      id: 'BGV-IP-3201',
      candidate: 'Rohan Verma',
      role: 'Platform Engineer · Pune',
      provider: 'CheckMate',
      stages: ['Employment', 'Education'],
      startedOn: new Date('2025-11-18'),
      etaDays: 3,
      status: 'Verifying',
      progress: 58,
      notes: 'Employment references verified. Education transcripts under validation.'
    },
    {
      id: 'BGV-IP-3202',
      candidate: 'Emily Chen',
      role: 'Product Designer · Singapore',
      provider: 'SecureVerify',
      stages: ['Identity', 'Criminal'],
      startedOn: new Date('2025-11-16'),
      etaDays: 5,
      status: 'Awaiting client input',
      progress: 42,
      notes: 'Need candidate signature on police clearance form. Reminder sent yesterday.'
    },
    {
      id: 'BGV-IP-3203',
      candidate: 'Carlos Ortiz',
      role: 'Customer Success Lead · Mexico City',
      provider: 'TrustedBG',
      stages: ['Criminal', 'Employment'],
      startedOn: new Date('2025-11-19'),
      etaDays: 2,
      status: 'Provider escalation',
      progress: 67,
      notes: 'Local court record needs manual retrieval. Partner regional head looped in.'
    }
  ];

  setFilter(filter: InProgressFilter): void {
    this.selectedFilter = filter;
  }

  get filteredInvestigations(): InvestigationRecord[] {
    switch (this.selectedFilter) {
      case 'eta-3':
        return this.investigations.filter(item => item.etaDays <= 3);
      case 'awaiting-client':
        return this.investigations.filter(item => item.status === 'Awaiting client input');
      case 'escalations':
        return this.investigations.filter(item => item.status === 'Provider escalation');
      default:
        return this.investigations;
    }
  }

  get totalInvestigations(): number {
    return this.investigations.length;
  }

  get averageEta(): number {
    if (!this.investigations.length) {
      return 0;
    }
    const total = this.investigations.reduce((acc, item) => acc + item.etaDays, 0);
    return Math.round((total / this.investigations.length) * 10) / 10;
  }

  get awaitingClientCount(): number {
    return this.investigations.filter(item => item.status === 'Awaiting client input').length;
  }

  get escalationsCount(): number {
    return this.investigations.filter(item => item.status === 'Provider escalation').length;
  }

  getStatusClass(status: InvestigationStatus): string {
    return `status-pill status-pill--${status.replace(/\s/g, '-').toLowerCase()}`;
  }

  getEtaChipClass(record: InvestigationRecord): string {
    if (record.status === 'Provider escalation') {
      return 'eta eta--escalated';
    }
    if (record.etaDays <= 2) {
      return 'eta eta--fast';
    }
    if (record.etaDays <= 5) {
      return 'eta eta--standard';
    }
    return 'eta';
  }

  getProgressWidth(record: InvestigationRecord): string {
    const clamped = Math.min(Math.max(record.progress, 0), 100);
    return `${clamped}%`;
  }
}
