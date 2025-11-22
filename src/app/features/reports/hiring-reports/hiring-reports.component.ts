import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type TrendDirection = 'up' | 'down' | 'flat';
type SeverityLevel = 'high' | 'medium' | 'low';

@Component({
  selector: 'app-hiring-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hiring-reports.component.html',
  styleUrls: ['./hiring-reports.component.css']
})
export class HiringReportsComponent {
  readonly views = ['Quarter to date', 'Last 90 days', 'Year to date'] as const;
  selectedView: (typeof this.views)[number];

  readonly velocityMetrics = [
    {
      label: 'Median time to fill',
      value: '29 days',
      change: '↓ 4.5 days',
      direction: 'up' as TrendDirection
    },
    {
      label: 'Offer acceptance rate',
      value: '81%',
      change: '↑ 6.2 pts',
      direction: 'up' as TrendDirection
    },
    {
      label: 'Interview-to-offer conversion',
      value: '24%',
      change: '↑ 2.1 pts',
      direction: 'up' as TrendDirection
    },
    {
      label: 'Pipeline health index',
      value: '4.3 / 5',
      change: 'flat week-over-week',
      direction: 'flat' as TrendDirection
    }
  ];

  readonly pipelineStages = [
    {
      stage: 'Sourced',
      volume: 840,
      conversion: 64,
      change: '+5.4 pts',
      direction: 'up' as TrendDirection
    },
    {
      stage: 'Screened',
      volume: 412,
      conversion: 52,
      change: '+1.8 pts',
      direction: 'up' as TrendDirection
    },
    {
      stage: 'Panel interview',
      volume: 188,
      conversion: 37,
      change: '-3.2 pts',
      direction: 'down' as TrendDirection
    },
    {
      stage: 'Offer extended',
      volume: 94,
      conversion: 73,
      change: '+2.9 pts',
      direction: 'up' as TrendDirection
    }
  ];

  readonly sourcingChannels = [
    {
      channel: 'Employee referrals',
      hires: 36,
      share: 32,
      quality: 'Premium',
      direction: 'up' as TrendDirection,
      change: '+11 pts'
    },
    {
      channel: 'Outbound sourcing',
      hires: 22,
      share: 19,
      quality: 'Calibrated',
      direction: 'flat' as TrendDirection,
      change: 'Stable'
    },
    {
      channel: 'Job boards',
      hires: 18,
      share: 16,
      quality: 'Emerging',
      direction: 'down' as TrendDirection,
      change: '-6 pts'
    },
    {
      channel: 'Campus partnerships',
      hires: 14,
      share: 12,
      quality: 'Growing',
      direction: 'up' as TrendDirection,
      change: '+3 pts'
    }
  ];

  readonly interviewLoad = [
    {
      team: 'Product & design',
      interviews: 124,
      load: 'High',
      detail: 'Add two flex interviewers to reduce waitlists.'
    },
    {
      team: 'Engineering',
      interviews: 178,
      load: 'Optimized',
      detail: 'Panel rotation holding at 4.1 interviews per hire.'
    },
    {
      team: 'Revenue',
      interviews: 96,
      load: 'Watch',
      detail: 'Enable async demos to cut prep time by 18%. '
    }
  ];

  readonly offerSignals = [
    {
      title: 'Offer win rate',
      value: '81%',
      detail: 'Warming bonuses drove +9 pts uplift for critical roles.',
      direction: 'up' as TrendDirection
    },
    {
      title: 'Decline reasons tracked',
      value: '92%',
      detail: 'Benefits clarity and career path top themes. Actions in flight.',
      direction: 'flat' as TrendDirection
    },
    {
      title: 'Comp bands variance',
      value: 'Within 3%',
      detail: 'Comp aligned to benchmark; watch new geo differential requests.',
      direction: 'up' as TrendDirection
    }
  ];

  readonly riskQueue = [
    {
      id: 'HR-512',
      title: 'Panel bottleneck for Staff Engineer',
      owner: 'Engineering TA',
      status: 'Active',
      severity: 'high' as SeverityLevel,
      eta: 'Expedite slate by Tuesday'
    },
    {
      id: 'HR-498',
      title: 'Offer declines citing relocation',
      owner: 'People Ops',
      status: 'Monitoring',
      severity: 'medium' as SeverityLevel,
      eta: 'Policy review next sprint'
    },
    {
      id: 'HR-471',
      title: 'Background check cycle time creep',
      owner: 'Compliance',
      status: 'Resolved',
      severity: 'low' as SeverityLevel,
      eta: 'Closed after vendor calibration'
    }
  ];

  readonly sprintActions = [
    {
      action: 'Launch referral blitz for revenue team',
      owner: 'TA Marketing',
      due: 'Kickoff Monday',
      detail: 'Goal: +20 warm leads with enablement collateral refresh.'
    },
    {
      action: 'Pilot structured debrief notes',
      owner: 'Hiring Managers',
      due: 'Deploy Wednesday',
      detail: 'Reduce decision lag by pushing insights to Slack hiring HQ.'
    },
    {
      action: 'Compensation storytelling workshop',
      owner: 'People Ops',
      due: 'Friday',
      detail: 'Equip recruiters with scenario-based exercises for offers.'
    }
  ];

  constructor() {
    this.selectedView = this.views[0];
  }

  setView(view: (typeof this.views)[number]): void {
    this.selectedView = view;
  }

  getTrendClass(direction: TrendDirection): string {
    return `delta delta--${direction}`;
  }

  getBarStyle(conversion: number): Record<string, string> {
    return { width: `${conversion}%` };
  }

  getSeverityClass(severity: SeverityLevel): string {
    return `severity-pill severity-pill--${severity}`;
  }

  getStatusClass(status: string): string {
    return `status-pill status-pill--${status.toLowerCase()}`;
  }
}
