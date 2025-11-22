import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type RangeFilter = '30' | '60' | '90';
type PersonaFilter = 'all' | 'tech' | 'business' | 'leadership';

interface FunnelStage {
  stage: string;
  count: number;
  conversion: number;
  avgDays: number;
  ownership: string;
  focusAreas: string[];
}

interface FunnelMetric {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down' | 'flat';
}

interface FunnelSpotlight {
  title: string;
  description: string;
  owner: string;
  eta: string;
}

@Component({
  selector: 'app-application-funnel-report',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './application-funnel-report.component.html',
  styleUrls: ['./application-funnel-report.component.css']
})
export class ApplicationFunnelReportComponent {
  readonly narrative = 'End-to-end visibility into how candidates move from first touch to hire. Spot friction, benchmark conversion, and unlock collaborative action plans.';

  readonly rangeFilters: { id: RangeFilter; label: string }[] = [
    { id: '30', label: 'Last 30 days' },
    { id: '60', label: 'Last 60 days' },
    { id: '90', label: 'Quarter to date' }
  ];

  readonly personaFilters: { id: PersonaFilter; label: string }[] = [
    { id: 'all', label: 'All pipelines' },
    { id: 'tech', label: 'Technology' },
    { id: 'business', label: 'Business & G&A' },
    { id: 'leadership', label: 'Leadership' }
  ];

  selectedRange: RangeFilter = '60';
  selectedPersona: PersonaFilter = 'all';

  readonly stages: FunnelStage[] = [
    {
      stage: 'Applied',
      count: 248,
      conversion: 100,
      avgDays: 1.2,
      ownership: 'Talent Marketing',
      focusAreas: ['Smart screening scoring', 'Improve ROI on job boards']
    },
    {
      stage: 'Screened',
      count: 124,
      conversion: 50,
      avgDays: 2.6,
      ownership: 'Recruiting COE',
      focusAreas: ['Same-day resume triage', 'Automate referral prioritisation']
    },
    {
      stage: 'Interviewed',
      count: 58,
      conversion: 23,
      avgDays: 6.8,
      ownership: 'Hiring Panels',
      focusAreas: ['Line manager enablement', 'Structured rubric adoption']
    },
    {
      stage: 'Offer Extended',
      count: 21,
      conversion: 8,
      avgDays: 3.4,
      ownership: 'Recruiters + Compensation',
      focusAreas: ['Offer acceleration playbook', 'Equity narrative refresh']
    },
    {
      stage: 'Hired',
      count: 14,
      conversion: 6,
      avgDays: 5.1,
      ownership: 'People Ops',
      focusAreas: ['Pre-boarding readiness', 'Manager welcome journey']
    }
  ];

  readonly spotlights: FunnelSpotlight[] = [
    {
      title: 'Panel availability bottleneck',
      description: 'Interview throughput slowed by 28% due to leadership panel conflicts in the last 3 weeks.',
      owner: 'Recruiting Ops',
      eta: 'Mitigation plan by Dec 2'
    },
    {
      title: 'Offer decision support',
      description: 'Loss to competing offers increased in SaaS AE roles. Compensation benchmarking update in progress.',
      owner: 'Total Rewards',
      eta: 'New ranges roll out Dec 12'
    }
  ];

  get metrics(): FunnelMetric[] {
    return [
      {
        label: 'Overall conversion',
        value: `${this.getOverallConversion()}%`,
        delta: '+4% vs last quarter',
        trend: 'up'
      },
      {
        label: 'Median time-to-hire',
        value: `${this.getMedianTimeToHire()} days`,
        delta: 'Goal: 28 days',
        trend: 'down'
      },
      {
        label: 'Stage drop-offs',
        value: `${this.getCriticalDropCount()} hotspots`,
        delta: 'Panels flagged for coaching',
        trend: 'flat'
      },
      {
        label: 'Candidate experience score',
        value: '4.5 / 5',
        delta: '+0.3 vs previous cycle',
        trend: 'up'
      }
    ];
  }

  setRange(filter: RangeFilter): void {
    this.selectedRange = filter;
  }

  setPersona(filter: PersonaFilter): void {
    this.selectedPersona = filter;
  }

  getStageWidth(stage: FunnelStage): string {
    const maxCount = this.stages.length ? this.stages[0].count : 0;
    if (!maxCount) {
      return '0%';
    }
    const width = (stage.count / maxCount) * 100;
    return `${Math.round(width)}%`;
  }

  getDropRate(index: number): string {
    if (index === 0) {
      return 'Baseline';
    }
    const previous = this.stages[index - 1];
    const current = this.stages[index];
    if (!previous?.count) {
      return '—';
    }
    const drop = ((previous.count - current.count) / previous.count) * 100;
    return `-${Math.round(drop)}%`; 
  }

  getAvgDaysLabel(stage: FunnelStage): string {
    return `${stage.avgDays} days avg.`;
  }

  getFocusBadge(stage: FunnelStage): string {
    return stage.ownership;
  }

  getTrendClass(trend: FunnelMetric['trend']): string {
    return `metric-delta--${trend}`;
  }

  private getOverallConversion(): number {
    if (!this.stages.length) {
      return 0;
    }
    const first = this.stages[0];
    const last = this.stages[this.stages.length - 1];
    if (!first.count) {
      return 0;
    }
    return Math.round((last.count / first.count) * 100);
  }

  private getMedianTimeToHire(): number {
    if (!this.stages.length) {
      return 0;
    }
    const total = this.stages.reduce((acc, stage) => acc + stage.avgDays, 0);
    const average = total / this.stages.length;
    return Math.round(average * 10) / 10;
  }

  private getCriticalDropCount(): number {
    return this.stages.filter((stage, index) => {
      if (index === 0) {
        return false;
      }
      const previous = this.stages[index - 1];
      if (!previous?.count) {
        return false;
      }
      const drop = ((previous.count - stage.count) / previous.count) * 100;
      return drop > 50;
    }).length;
  }
}
