import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type TrendDirection = 'up' | 'down' | 'flat';
type SentimentLevel = 'delight' | 'steady' | 'watch';
type SeverityLevel = 'high' | 'medium' | 'low';

@Component({
  selector: 'app-onboarding-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-reports.component.html',
  styleUrls: ['./onboarding-reports.component.css']
})
export class OnboardingReportsComponent {
  readonly timeframes = ['Last 30 days', 'Quarter to date', 'Year to date'] as const;
  selectedTimeframe: (typeof this.timeframes)[number];

  readonly kpis = [
    {
      label: 'Avg time to productivity',
      value: '17 days',
      change: '2.1 days faster',
      direction: 'up' as TrendDirection
    },
    {
      label: 'Tasks completed by day 30',
      value: '91%',
      change: '↑ 4.8 pts',
      direction: 'up' as TrendDirection
    },
    {
      label: 'Mentorship engagement',
      value: '87%',
      change: 'flat week-over-week',
      direction: 'flat' as TrendDirection
    },
    {
      label: 'Early attrition (90-day)',
      value: '3.2%',
      change: '↓ 0.6 pt',
      direction: 'down' as TrendDirection
    }
  ];

  readonly journeyStages = [
    {
      stage: 'Launch & orientation',
      completion: 98,
      sentiment: 'delight' as SentimentLevel,
      blockers: 2,
      trend: 'up' as TrendDirection,
      change: '↑ 1.2 pts'
    },
    {
      stage: 'Systems access',
      completion: 86,
      sentiment: 'steady' as SentimentLevel,
      blockers: 5,
      trend: 'flat' as TrendDirection,
      change: 'No change'
    },
    {
      stage: 'Role immersion',
      completion: 74,
      sentiment: 'steady' as SentimentLevel,
      blockers: 3,
      trend: 'up' as TrendDirection,
      change: '↑ 3.5 pts'
    },
    {
      stage: 'Feedback & certification',
      completion: 61,
      sentiment: 'watch' as SentimentLevel,
      blockers: 6,
      trend: 'down' as TrendDirection,
      change: '↓ 2.1 pts'
    }
  ];

  readonly cohortHighlights = [
    {
      cohort: 'Engineering academy',
      completion: 92,
      rampDays: 14,
      mentors: '12 mentors engaged',
      satisfaction: 4.7,
      trend: 'up' as TrendDirection,
      change: '+6.2 pts'
    },
    {
      cohort: 'Customer success wave',
      completion: 84,
      rampDays: 18,
      mentors: '9 mentors engaged',
      satisfaction: 4.3,
      trend: 'flat' as TrendDirection,
      change: 'Stable week-over-week'
    },
    {
      cohort: 'Sales accelerators',
      completion: 69,
      rampDays: 22,
      mentors: '6 mentors engaged',
      satisfaction: 4.1,
      trend: 'down' as TrendDirection,
      change: '-3.8 pts'
    }
  ];

  readonly sentimentSignals = [
    {
      metric: 'Belonging index',
      score: 4.6,
      change: '+0.3',
      direction: 'up' as TrendDirection,
      narrative: 'Peer welcome circles boosted confidence scores in week 2.'
    },
    {
      metric: 'Program clarity',
      score: 4.2,
      change: '0',
      direction: 'flat' as TrendDirection,
      narrative: 'Updated playbooks maintained clarity; watch for handoff gaps at week 5.'
    },
    {
      metric: 'Manager alignment',
      score: 3.8,
      change: '−0.4',
      direction: 'down' as TrendDirection,
      narrative: 'Feedback cadence slipped after day 21 for hybrid cohorts.'
    }
  ];

  readonly playbooks = [
    {
      title: 'Hybrid onboarding blueprint',
      description: 'Sequenced welcome rituals and async content that lifted belonging by 11 pts.',
      owner: 'People Ops',
      impact: 'High'
    },
    {
      title: 'Mentor moments dashboard',
      description: 'Real-time nudges that drove 2.4x mentoring touchpoints for technical hires.',
      owner: 'L&D',
      impact: 'Medium'
    },
    {
      title: '30-60-90 alignment kit',
      description: 'Manager templates reducing first 60-day churn to 2.8% across growth roles.',
      owner: 'HRBP',
      impact: 'High'
    }
  ];

  readonly riskAlerts = [
    {
      id: 'OB-431',
      title: 'Equipment provisioning delays',
      detail: '12 hires are awaiting laptops past day 3 impacting productivity readiness.',
      owner: 'IT Ops',
      status: 'Active',
      severity: 'high' as SeverityLevel,
      eta: 'Resolution in 3 days'
    },
    {
      id: 'OB-418',
      title: 'Manager touchpoint gaps',
      detail: '26% of managers skipped the week-two check-in. Nudges scheduled for Monday.',
      owner: 'People Managers',
      status: 'Monitoring',
      severity: 'medium' as SeverityLevel,
      eta: 'Review on Friday'
    },
    {
      id: 'OB-397',
      title: 'Compliance video backlog',
      detail: 'Six hires pending security compliance video; auto-reminder campaign triggered.',
      owner: 'Compliance',
      status: 'Resolved',
      severity: 'low' as SeverityLevel,
      eta: 'Closed today'
    }
  ];

  constructor() {
    this.selectedTimeframe = this.timeframes[0];
  }

  setTimeframe(timeframe: (typeof this.timeframes)[number]): void {
    this.selectedTimeframe = timeframe;
  }

  getTrendClass(direction: TrendDirection): string {
    return `delta delta--${direction}`;
  }

  getSentimentClass(level: SentimentLevel): string {
    return `sentiment sentiment--${level}`;
  }

  getStageBarStyle(completion: number): Record<string, string> {
    return { width: `${completion}%` };
  }

  getSeverityClass(severity: SeverityLevel): string {
    return `severity-pill severity-pill--${severity}`;
  }

  getStatusClass(status: string): string {
    return `status-pill status-pill--${status.toLowerCase().replace(/\s+/g, '-')}`;
  }
}
