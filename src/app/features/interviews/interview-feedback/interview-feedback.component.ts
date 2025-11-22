import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type FeedbackFilter = 'all' | 'pending-action' | 'ready-for-offer' | 'needs-alignment';

interface FeedbackEntry {
  id: string;
  candidate: string;
  role: string;
  stage: string;
  interviewer: string;
  submittedOn: Date;
  score: number;
  verdict: 'Advance' | 'Hold for next round' | 'Reject';
  strengths: string[];
  reservations: string[];
  notes: string;
  status: 'Pending decision' | 'Offer in progress' | 'Awaiting panel sync';
  nextActions: string;
}

@Component({
  selector: 'app-interview-feedback',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interview-feedback.component.html',
  styleUrls: ['./interview-feedback.component.css']
})
export class InterviewFeedbackComponent {
  filters: { id: FeedbackFilter; label: string }[] = [
    { id: 'all', label: 'All feedback' },
    { id: 'pending-action', label: 'Pending action' },
    { id: 'ready-for-offer', label: 'Ready for offer' },
    { id: 'needs-alignment', label: 'Needs panel alignment' }
  ];

  selectedFilter: FeedbackFilter = 'all';

  feedbackEntries: FeedbackEntry[] = [
    {
      id: 'FB-1780',
      candidate: 'Mamta Sharma',
      role: 'Senior React Engineer',
      stage: 'Panel interview',
      interviewer: 'Anita Desai',
      submittedOn: new Date('2025-11-21T10:30:00'),
      score: 4.6,
      verdict: 'Advance',
      strengths: ['Deep component architecture expertise', 'Great async patterns'],
      reservations: ['Prefers hybrid work model'],
      notes: 'Would pair with lead FE for design system evolution. Recommending final round with CTO.',
      status: 'Offer in progress',
      nextActions: 'Prep final culture-fit with CTO; share salary band by Tuesday.'
    },
    {
      id: 'FB-1781',
      candidate: 'Ranjan Patnaik',
      role: 'Node.js Platform Engineer',
      stage: 'Technical screen',
      interviewer: 'Joel Mathews',
      submittedOn: new Date('2025-11-20T15:45:00'),
      score: 4.9,
      verdict: 'Advance',
      strengths: ['Exceptional debugging approach', 'Solid observability mindset'],
      reservations: [],
      notes: 'Ready for architecture round. Please line up platform lead for deep dive.',
      status: 'Pending decision',
      nextActions: 'Schedule architecture round this week; attach system design brief.'
    },
    {
      id: 'FB-1782',
      candidate: 'Priya Malik',
      role: 'Product Designer',
      stage: 'Portfolio review',
      interviewer: 'Suresh Batra',
      submittedOn: new Date('2025-11-19T11:20:00'),
      score: 3.2,
      verdict: 'Hold for next round',
      strengths: ['Thoughtful storytelling', 'User research depth'],
      reservations: ['Needs stronger motion prototypes', 'Timeline sensitivity concerns'],
      notes: 'Would benefit from pairing challenge with PM & Engineer. Seek additional context before final call.',
      status: 'Awaiting panel sync',
      nextActions: 'Run sync with PM lead Friday; decide between design exercise vs. closing.'
    },
    {
      id: 'FB-1783',
      candidate: 'Miguel Torres',
      role: 'QA Lead',
      stage: 'Manager round',
      interviewer: 'Divya Sinha',
      submittedOn: new Date('2025-11-18T09:00:00'),
      score: 2.8,
      verdict: 'Reject',
      strengths: ['People leadership'],
      reservations: ['Limited automation depth', 'Scaling experience not proven'],
      notes: 'Recommend decline but share future contract gig option when automation team expands.',
      status: 'Pending decision',
      nextActions: 'Send decline template; highlight specialist contractor network.'
    }
  ];

  get filteredFeedback(): FeedbackEntry[] {
    switch (this.selectedFilter) {
      case 'pending-action':
        return this.feedbackEntries.filter(entry => entry.status === 'Pending decision');
      case 'ready-for-offer':
        return this.feedbackEntries.filter(entry => entry.status === 'Offer in progress');
      case 'needs-alignment':
        return this.feedbackEntries.filter(entry => entry.status === 'Awaiting panel sync');
      default:
        return this.feedbackEntries;
    }
  }

  get averageScore(): number {
    const total = this.feedbackEntries.reduce((acc, entry) => acc + entry.score, 0);
    return this.feedbackEntries.length ? Number((total / this.feedbackEntries.length).toFixed(1)) : 0;
  }

  get offerReadyCount(): number {
    return this.feedbackEntries.filter(entry => entry.status === 'Offer in progress').length;
  }

  get pendingCount(): number {
    return this.feedbackEntries.filter(entry => entry.status === 'Pending decision').length;
  }

  get alignmentNeededCount(): number {
    return this.feedbackEntries.filter(entry => entry.status === 'Awaiting panel sync').length;
  }

  setFilter(filter: FeedbackFilter): void {
    this.selectedFilter = filter;
  }

  getScoreBadge(score: number): 'success' | 'warning' | 'danger' {
    if (score >= 4.5) {
      return 'success';
    }
    if (score >= 3.3) {
      return 'warning';
    }
    return 'danger';
  }

  getVerdictEmoji(verdict: FeedbackEntry['verdict']): string {
    switch (verdict) {
      case 'Advance':
        return '🚀';
      case 'Hold for next round':
        return '⏳';
      default:
        return '⚠️';
    }
  }
}
