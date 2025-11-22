import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type TaskStatus = 'Not started' | 'In progress' | 'Scheduled' | 'Completed' | 'Blocked';
type TaskCategory = 'Preboarding' | 'Day 1' | 'Week 1' | 'Culture';

type TaskFilter = 'all' | 'today' | 'overdue' | 'blocked' | TaskCategory;

interface OnboardingTask {
  id: string;
  title: string;
  assignee: string;
  ownerTeam: string;
  category: TaskCategory;
  status: TaskStatus;
  dueDate: Date;
  scheduledTime?: string;
  notes: string;
  touchpoints: string[];
  progress: number;
}

@Component({
  selector: 'app-onboarding-tasks',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './onboarding-tasks.component.html',
  styleUrls: ['./onboarding-tasks.component.css']
})
export class OnboardingTasksComponent {
  readonly missionStatement = 'Curate a predictable, high-energy onboarding week where every stakeholder knows the next move.';

  readonly filters: { id: TaskFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'today', label: 'Today' },
    { id: 'overdue', label: 'Overdue' },
    { id: 'blocked', label: 'Blocked' },
    { id: 'Preboarding', label: 'Preboarding' },
    { id: 'Day 1', label: 'Day 1' },
    { id: 'Week 1', label: 'Week 1' },
    { id: 'Culture', label: 'Culture' }
  ];

  selectedFilter: TaskFilter = 'all';

  readonly tasks: OnboardingTask[] = [
    {
      id: 'TASK-4101',
      title: 'Ship laptop & accessories',
      assignee: 'IT Logistics',
      ownerTeam: 'IT Support',
      category: 'Preboarding',
      status: 'In progress',
      dueDate: new Date('2025-11-23'),
      notes: 'Courier partner booked. Awaiting customs declaration approval.',
      touchpoints: ['IT concierge', 'New hire'],
      progress: 65
    },
    {
      id: 'TASK-4102',
      title: 'HR welcome circle',
      assignee: 'People Experience',
      ownerTeam: 'HR Team',
      category: 'Day 1',
      status: 'Scheduled',
      dueDate: new Date('2025-11-25'),
      scheduledTime: '09:30 AM',
      notes: 'Include leadership intro video and swag unboxing moment.',
      touchpoints: ['HR host', 'Leadership'],
      progress: 30
    },
    {
      id: 'TASK-4103',
      title: 'Security & compliance briefing',
      assignee: 'Risk & IT Ops',
      ownerTeam: 'Compliance',
      category: 'Week 1',
      status: 'Blocked',
      dueDate: new Date('2025-11-27'),
      notes: 'Waiting on VPN credential issuance. Reschedule once IT closes ticket #IT-5582.',
      touchpoints: ['Security lead', 'New hire'],
      progress: 45
    },
    {
      id: 'TASK-4104',
      title: 'Buddy coffee chat',
      assignee: 'Team Buddy Program',
      ownerTeam: 'People Partners',
      category: 'Culture',
      status: 'Completed',
      dueDate: new Date('2025-11-20'),
      scheduledTime: '04:00 PM',
      notes: 'Captured sentiment feedback: “Feels welcomed and excited!”.',
      touchpoints: ['Assigned buddy'],
      progress: 100
    }
  ];

  setFilter(filter: TaskFilter): void {
    this.selectedFilter = filter;
  }

  get filteredTasks(): OnboardingTask[] {
    switch (this.selectedFilter) {
      case 'today':
        return this.tasks.filter(task => this.isDueToday(task.dueDate));
      case 'overdue':
        return this.tasks.filter(task => this.daysUntil(task.dueDate) < 0 && task.status !== 'Completed');
      case 'blocked':
        return this.tasks.filter(task => task.status === 'Blocked');
      case 'Preboarding':
      case 'Day 1':
      case 'Week 1':
      case 'Culture':
        return this.tasks.filter(task => task.category === this.selectedFilter);
      default:
        return this.tasks;
    }
  }

  get totalTasks(): number {
    return this.tasks.length;
  }

  get completedTasks(): number {
    return this.tasks.filter(task => task.status === 'Completed').length;
  }

  get blockedTasks(): number {
    return this.tasks.filter(task => task.status === 'Blocked').length;
  }

  get dueToday(): number {
    return this.tasks.filter(task => this.isDueToday(task.dueDate)).length;
  }

  getStatusBadge(status: TaskStatus): string {
    return `status-pill status-pill--${status.replace(/\s/g, '-').toLowerCase()}`;
  }

  getProgressWidth(task: OnboardingTask): string {
    const clamped = Math.min(Math.max(task.progress, 0), 100);
    return `${clamped}%`;
  }

  getTimelineLabel(task: OnboardingTask): string {
    if (task.status === 'Completed') {
      return 'Done';
    }
    const days = this.daysUntil(task.dueDate);
    if (days < 0) {
      return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
    }
    if (days === 0) {
      return task.scheduledTime ? `Today · ${task.scheduledTime}` : 'Today';
    }
    if (days === 1) {
      return 'Tomorrow';
    }
    return `In ${days} days`;
  }

  getTimelineClass(task: OnboardingTask): string {
    if (task.status === 'Completed') {
      return 'timeline timeline--completed';
    }
    const days = this.daysUntil(task.dueDate);
    if (days < 0) {
      return 'timeline timeline--overdue';
    }
    if (days <= 2) {
      return 'timeline timeline--warning';
    }
    return 'timeline';
  }

  private isDueToday(date: Date): boolean {
    return this.daysUntil(date) === 0;
  }

  private daysUntil(date: Date): number {
    const today = this.startOfDay(new Date());
    const due = this.startOfDay(date);
    return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
