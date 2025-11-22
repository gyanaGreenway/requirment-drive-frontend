import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type RangeFilter = 'month' | 'quarter' | 'half';

interface SummaryMetric {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'flat';
}

interface TrendPoint {
  month: string;
  completed: number;
  escalations: number;
  avgTurnaround: number;
}

interface RiskSegment {
  label: string;
  percentage: number;
  count: number;
}

interface PartnerScore {
  vendor: string;
  region: string;
  sla: string;
  avgTAT: number;
  compliance: number;
  activeCases: number;
}

interface ExceptionSpotlight {
  id: string;
  candidate: string;
  issue: string;
  owner: string;
  status: 'Resolved' | 'In progress';
  resolvedOn?: Date;
}

interface ComplianceSignal {
  title: string;
  score: number;
  description: string;
}

@Component({
  selector: 'app-bgv-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bgv-reports.component.html',
  styleUrls: ['./bgv-reports.component.css']
})
export class BgvReportsComponent {
  readonly narrative = 'Insight-ready reporting to help HR, compliance, and security teams close loops faster and track every background investigation with confidence.';

  readonly ranges: { id: RangeFilter; label: string }[] = [
    { id: 'month', label: '30 days' },
    { id: 'quarter', label: '90 days' },
    { id: 'half', label: 'Year to date' }
  ];

  selectedRange: RangeFilter = 'quarter';

  readonly metrics: SummaryMetric[] = [
    { label: 'Median turnaround', value: '4.2 days', delta: '-0.4 vs last qtr', trend: 'up' },
    { label: 'Case completion', value: '93%', delta: '+5% resolved', trend: 'up' },
    { label: 'Escalation load', value: '12 active', delta: '-3 critical', trend: 'down' },
    { label: 'Audit ready', value: '98.5%', delta: '2% gap on docs', trend: 'flat' }
  ];

  readonly trendData: TrendPoint[] = [
    { month: 'Jul', completed: 38, escalations: 6, avgTurnaround: 4.9 },
    { month: 'Aug', completed: 42, escalations: 4, avgTurnaround: 4.4 },
    { month: 'Sep', completed: 47, escalations: 3, avgTurnaround: 4.1 },
    { month: 'Oct', completed: 52, escalations: 5, avgTurnaround: 3.8 },
    { month: 'Nov', completed: 56, escalations: 2, avgTurnaround: 3.6 }
  ];

  readonly riskMix: RiskSegment[] = [
    { label: 'Cleared', percentage: 72, count: 154 },
    { label: 'Requires review', percentage: 21, count: 45 },
    { label: 'Critical findings', percentage: 7, count: 16 }
  ];

  readonly partnerScores: PartnerScore[] = [
    { vendor: 'SecureCheck Global', region: 'North America', sla: '98%', avgTAT: 3.2, compliance: 99, activeCases: 18 },
    { vendor: 'Veritas Labs', region: 'EMEA', sla: '95%', avgTAT: 4.1, compliance: 96, activeCases: 12 },
    { vendor: 'RapidTrace', region: 'APAC', sla: '92%', avgTAT: 5.5, compliance: 93, activeCases: 24 }
  ];

  readonly exceptionSpotlights: ExceptionSpotlight[] = [
    {
      id: 'BGV-EX-3110',
      candidate: 'Priya Raman',
      issue: 'Employment variance (2019)',
      owner: 'Legal Ops',
      status: 'In progress'
    },
    {
      id: 'BGV-EX-3116',
      candidate: 'Lucas Meyer',
      issue: 'Education verification pending',
      owner: 'Vendor Success',
      status: 'Resolved',
      resolvedOn: new Date('2025-11-14')
    },
    {
      id: 'BGV-EX-3120',
      candidate: 'Fatima Khan',
      issue: 'Adverse media hit – Tier 2',
      owner: 'Risk & Compliance',
      status: 'In progress'
    }
  ];

  readonly complianceSignals: ComplianceSignal[] = [
    {
      title: 'Document completeness',
      score: 94,
      description: 'Offer letters signed but identity proofs pending in 6 cases.'
    },
    {
      title: 'SLA adherence',
      score: 88,
      description: 'APAC vendor breaching SLA on high-volume weeks; review capacity plan.'
    },
    {
      title: 'Audit log coverage',
      score: 99,
      description: 'IAM logs synced nightly with zero gap for the last 45 days.'
    }
  ];

  setRange(range: RangeFilter): void {
    this.selectedRange = range;
  }

  get maxCompleted(): number {
    return this.trendData.length
      ? Math.max(...this.trendData.map(point => point.completed))
      : 0;
  }

  getCompletedWidth(point: TrendPoint): string {
    if (!this.maxCompleted) {
      return '0%';
    }
    const width = (point.completed / this.maxCompleted) * 100;
    return `${Math.round(width)}%`;
  }

  getEscalationWidth(point: TrendPoint): string {
    const maxEscalations = this.trendData.length
      ? Math.max(...this.trendData.map(dataPoint => dataPoint.escalations))
      : 0;
    if (!maxEscalations) {
      return '0%';
    }
    const width = (point.escalations / maxEscalations) * 100;
    return `${Math.round(width)}%`;
  }

  getTrendClass(trend: SummaryMetric['trend']): string {
    return `metric-delta--${trend}`;
  }

  getRiskBarWidth(segment: RiskSegment): string {
    return `${segment.percentage}%`;
  }

  getComplianceClass(score: number): string {
    if (score >= 95) {
      return 'signal-badge--great';
    }
    if (score >= 90) {
      return 'signal-badge--good';
    }
    return 'signal-badge--risk';
  }

  getStatusClass(status: ExceptionSpotlight['status']): string {
    return status === 'Resolved' ? 'status-pill--success' : 'status-pill--pending';
  }
}
