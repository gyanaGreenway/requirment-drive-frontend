import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type RangeFilter = 'month' | 'quarter' | 'year';

interface SummaryMetric {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'flat';
}

interface RegionSnapshot {
  region: string;
  clearRate: number;
  avgTurnaround: number;
  escalations: number;
  vendor: string;
}

interface VendorScorecard {
  partner: string;
  coverage: string;
  sla: string;
  avgTAT: number;
  compliance: number;
  backlog: number;
}

interface ComplianceSignal {
  title: string;
  score: number;
  detail: string;
}

interface ExceptionCase {
  id: string;
  candidate: string;
  risk: string;
  owner: string;
  status: 'Resolved' | 'In progress';
  eta?: string;
}

@Component({
  selector: 'app-reports-bgv-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports-bgv-reports.component.html',
  styleUrls: ['./reports-bgv-reports.component.css']
})
export class ReportsBgvReportsComponent {
  readonly narrative = 'Security-first reporting across the entire background verification estate. Track regional performance, vendor compliance, and escalation pipelines in one workspace.';

  readonly rangeFilters: { id: RangeFilter; label: string }[] = [
    { id: 'month', label: '30 days' },
    { id: 'quarter', label: 'Quarter to date' },
    { id: 'year', label: 'Year to date' }
  ];

  selectedRange: RangeFilter = 'quarter';

  readonly metrics: SummaryMetric[] = [
    { label: 'Median turnaround', value: '4.1 days', delta: '+0.6 day gain', trend: 'up' },
    { label: 'Clearance rate', value: '89%', delta: '+3 pts vs goal', trend: 'up' },
    { label: 'Escalations active', value: '9 cases', delta: '-4 urgent in queue', trend: 'down' },
    { label: 'Audit readiness', value: '97.8%', delta: 'Docs compliant last 60 days', trend: 'flat' }
  ];

  readonly regionSnapshots: RegionSnapshot[] = [
    { region: 'North America', clearRate: 91, avgTurnaround: 3.6, escalations: 2, vendor: 'SecureCheck Global' },
    { region: 'Europe & Middle East', clearRate: 86, avgTurnaround: 4.4, escalations: 3, vendor: 'Veritas Labs' },
    { region: 'Asia Pacific', clearRate: 88, avgTurnaround: 4.8, escalations: 4, vendor: 'RapidTrace' }
  ];

  readonly vendorScores: VendorScorecard[] = [
    { partner: 'SecureCheck Global', coverage: 'US · Canada', sla: '98%', avgTAT: 3.1, compliance: 99, backlog: 1 },
    { partner: 'Veritas Labs', coverage: 'Europe · Middle East', sla: '94%', avgTAT: 4.5, compliance: 95, backlog: 3 },
    { partner: 'RapidTrace', coverage: 'South & Southeast Asia', sla: '91%', avgTAT: 5.6, compliance: 92, backlog: 5 }
  ];

  readonly complianceSignals: ComplianceSignal[] = [
    { title: 'Document completion', score: 94, detail: 'ID proofs pending in 6 cases beyond SLA; escalated to onboarding.' },
    { title: 'Adverse media monitoring', score: 88, detail: 'Increase frequency for fintech hires; align with legal review cadence.' },
    { title: 'Re-check cadence', score: 98, detail: 'Annual rechecks completed for critical functions with zero misses.' }
  ];

  readonly exceptions: ExceptionCase[] = [
    { id: 'BGV-EX-2210', candidate: 'Iris Kim', risk: 'Employment variance', owner: 'Legal Ops', status: 'In progress', eta: 'Closure by Nov 29' },
    { id: 'BGV-EX-2215', candidate: 'Daniel Ruiz', risk: 'Education verification - pending', owner: 'Vendor Success', status: 'In progress', eta: 'Updated docs Nov 25' },
    { id: 'BGV-EX-2202', candidate: 'Neha Patel', risk: 'Address verification cleared', owner: 'People Ops', status: 'Resolved', eta: 'Closed Nov 18' }
  ];

  setRange(filter: RangeFilter): void {
    this.selectedRange = filter;
  }

  getTrendClass(trend: SummaryMetric['trend']): string {
    return `metric-delta--${trend}`;
  }

  getComplianceClass(score: number): string {
    if (score >= 95) {
      return 'signal-badge--great';
    }
    if (score >= 90) {
      return 'signal-badge--good';
    }
    return 'signal-badge--watch';
  }

  getExceptionClass(status: ExceptionCase['status']): string {
    return status === 'Resolved' ? 'status-pill--resolved' : 'status-pill--active';
  }
}
