import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type ChecklistAudience = 'Engineering' | 'Design' | 'Product' | 'Sales';

interface ChecklistTemplate {
  id: string;
  name: string;
  audience: ChecklistAudience;
  items: number;
  completionRate: number;
  lastUpdated: Date;
  owner: string;
  highlights: string[];
  timeToComplete: string;
}

interface ChecklistRun {
  candidate: string;
  template: string;
  progress: number;
  anchorTasks: string[];
  status: 'On track' | 'Lagging';
}

@Component({
  selector: 'app-onboarding-checklists',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-checklists.component.html',
  styleUrls: ['./onboarding-checklists.component.css']
})
export class OnboardingChecklistsComponent {
  readonly purposeStatement = 'Codify wow moments and critical compliance steps so new hires feel confident, welcomed, and productive fast.';

  readonly templates: ChecklistTemplate[] = [
    {
      id: 'CL-ENG',
      name: 'Engineering Launchpad',
      audience: 'Engineering',
      items: 18,
      completionRate: 89,
      lastUpdated: new Date('2025-11-12'),
      owner: 'Engineering Ops',
      highlights: ['CI/CD access', 'Pair programming rituals', 'Guardrails review'],
      timeToComplete: '5 days'
    },
    {
      id: 'CL-UX',
      name: 'Design Experience Sprint',
      audience: 'Design',
      items: 14,
      completionRate: 92,
      lastUpdated: new Date('2025-11-06'),
      owner: 'Product Design Studio',
      highlights: ['Figma systems tour', 'Critique session', 'Brand immersion kit'],
      timeToComplete: '4 days'
    },
    {
      id: 'CL-PM',
      name: 'Product Management Navigator',
      audience: 'Product',
      items: 16,
      completionRate: 84,
      lastUpdated: new Date('2025-11-14'),
      owner: 'Product Ops',
      highlights: ['Roadmap runway', 'Stakeholder mapping', 'OKR playbook'],
      timeToComplete: '6 days'
    },
    {
      id: 'CL-SALES',
      name: 'Revenue Accelerator',
      audience: 'Sales',
      items: 12,
      completionRate: 78,
      lastUpdated: new Date('2025-10-29'),
      owner: 'Revenue Enablement',
      highlights: ['Pitch lab', 'Competitor debrief', 'Pipeline hygiene'],
      timeToComplete: '7 days'
    }
  ];

  readonly activeRuns: ChecklistRun[] = [
    {
      candidate: 'Amit Verma',
      template: 'Engineering Launchpad',
      progress: 62,
      anchorTasks: ['CI access provisioned', 'Buddy pair formed'],
      status: 'On track'
    },
    {
      candidate: 'Sara Khan',
      template: 'Design Experience Sprint',
      progress: 48,
      anchorTasks: ['First critique scheduled', 'Mentor sync pending'],
      status: 'Lagging'
    }
  ];

  get totalTemplates(): number {
    return this.templates.length;
  }

  get averageCompletion(): number {
    if (!this.templates.length) {
      return 0;
    }
    const total = this.templates.reduce((acc, template) => acc + template.completionRate, 0);
    return Math.round(total / this.templates.length);
  }

  get totalItemsAcrossTemplates(): number {
    return this.templates.reduce((acc, template) => acc + template.items, 0);
  }

  get onTrackRuns(): number {
    return this.activeRuns.filter(run => run.status === 'On track').length;
  }

  get laggingRuns(): number {
    return this.activeRuns.filter(run => run.status === 'Lagging').length;
  }

  getStatusClass(status: ChecklistRun['status']): string {
    return status === 'On track' ? 'run-status run-status--on-track' : 'run-status run-status--lagging';
  }

  getProgressWidth(percent: number): string {
    const clamped = Math.min(Math.max(percent, 0), 100);
    return `${clamped}%`;
  }
}
