import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InterviewService } from '../../../core/services/interview.service';
import {
  InterviewCalendarEvent,
  InterviewCalendarFilter,
  InterviewCalendarResponse,
  InterviewTimeframe
} from '../../../shared/models/interview.model';

type InterviewGroup = { date: Date; items: InterviewCalendarEvent[] };

@Component({
  selector: 'app-interview-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interview-calendar.component.html',
  styleUrls: ['./interview-calendar.component.css']
})
export class InterviewCalendarComponent implements OnInit {
  readonly filterOptions: { id: InterviewTimeframe; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'all', label: 'All Upcoming' }
  ];

  selectedTimeframe: InterviewTimeframe = 'week';
  interviews: InterviewCalendarEvent[] = [];
  loading = false;
  error: string | null = null;
  lastRefreshed: Date | null = null;

  constructor(private interviewService: InterviewService) {}

  ngOnInit(): void {
    this.loadInterviews();
  }

  setTimeframe(filter: InterviewTimeframe): void {
    if (this.selectedTimeframe === filter) {
      return;
    }
    this.selectedTimeframe = filter;
    this.loadInterviews();
  }

  get groupedInterviews(): InterviewGroup[] {
    const filtered = this.getFilteredInterviews();
    const groups = new Map<string, InterviewCalendarEvent[]>();

    filtered.forEach(event => {
      const key = this.toDateKey(event.dateTime);
      const existing = groups.get(key) ?? [];
      existing.push(event);
      groups.set(key, existing);
    });

    return Array.from(groups.entries())
      .map(([key, items]) => ({
        date: this.fromDateKey(key),
        items: items.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  get totalUpcoming(): number {
    const todayStart = this.startOfDay(new Date());
    return this.interviews.filter(event => event.dateTime >= todayStart).length;
  }

  get scheduledToday(): number {
    const today = new Date();
    return this.interviews.filter(event => this.isSameDay(event.dateTime, today)).length;
  }

  get awaitingFeedback(): number {
    return this.interviews.filter(event => event.stage?.toLowerCase().includes('review') ?? false).length;
  }

  get nextInterview(): InterviewCalendarEvent | undefined {
    const upcoming = this.interviews
      .filter(event => event.dateTime >= new Date())
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
    return upcoming[0];
  }

  trackByGroup(index: number, group: InterviewGroup): string {
    return group?.date?.toISOString() ?? `group-${index}`;
  }

  trackByInterview(index: number, interview: InterviewCalendarEvent): string {
    return interview?.id ?? `interview-${index}`;
  }

  private loadInterviews(): void {
    const filter: InterviewCalendarFilter = { timeframe: this.selectedTimeframe };
    this.loading = true;
    this.error = null;

    this.interviewService.getCalendarEvents(filter).subscribe({
      next: (response: InterviewCalendarResponse) => {
        this.interviews = response.events.map(event => ({
          ...event,
          candidate: event.candidate ?? 'Pending candidate',
          role: event.role ?? 'Role TBD',
          stage: event.stage ?? 'Interview stage',
          interviewer: event.interviewer ?? 'Panel',
          duration: event.duration ?? (event.durationMinutes ? `${event.durationMinutes} mins` : '—'),
          location: event.location ?? (event.type === 'Virtual' ? 'Virtual meeting' : 'Onsite')
        }));
        this.lastRefreshed = response.generatedAt ?? new Date();
        this.loading = false;
      },
      error: err => {
        console.error('Failed to load interview calendar', err);
        this.error = 'Unable to load interviews. Please try again soon.';
        this.interviews = [];
        this.loading = false;
      }
    });
  }

  private getFilteredInterviews(): InterviewCalendarEvent[] {
    const now = new Date();
    const startToday = this.startOfDay(now);
    const endToday = this.endOfDay(now);
    const startWeek = this.startOfWeek(now);
    const endWeek = this.endOfWeek(startWeek);
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    return this.interviews
      .filter(event => event.dateTime >= startToday)
      .filter(event => {
        switch (this.selectedTimeframe) {
          case 'today':
            return event.dateTime >= startToday && event.dateTime <= endToday;
          case 'week':
            return event.dateTime >= startWeek && event.dateTime <= endWeek;
          case 'month':
            return event.dateTime >= startMonth && event.dateTime <= endMonth;
          default:
            return true;
        }
      })
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private endOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  }

  private startOfWeek(date: Date): Date {
    const start = this.startOfDay(date);
    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day; // ensure Monday as week start
    start.setDate(start.getDate() + diff);
    return start;
  }

  private endOfWeek(start: Date): Date {
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return this.endOfDay(end);
  }

  private isSameDay(a: Date, b: Date): boolean {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  private toDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private fromDateKey(key: string): Date {
    const [year, month, day] = key.split('-').map(value => Number(value));
    return new Date(year, month - 1, day);
  }
}
