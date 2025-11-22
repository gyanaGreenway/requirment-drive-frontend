import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

type FilterOption = 'today' | 'week' | 'month' | 'all';

interface InterviewEvent {
  id: string;
  candidate: string;
  role: string;
  stage: string;
  interviewer: string;
  dateTime: Date;
  duration: string;
  location: string;
  type: 'Virtual' | 'In person';
  meetingLink?: string;
  notes?: string;
}

interface InterviewGroup {
  date: Date;
  items: InterviewEvent[];
}

@Component({
  selector: 'app-interview-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interview-calendar.component.html',
  styleUrls: ['./interview-calendar.component.css']
})
export class InterviewCalendarComponent {
  readonly filterOptions: { id: FilterOption; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'all', label: 'All Upcoming' }
  ];

  selectedTimeframe: FilterOption = 'week';

  readonly interviews: InterviewEvent[] = [
    {
      id: 'INT-3011',
      candidate: 'Mamta Sharma',
      role: 'Senior React Engineer',
      stage: 'Panel Interview',
      interviewer: 'Anita Desai',
      dateTime: new Date('2025-11-24T10:00:00'),
      duration: '60 mins',
      location: 'Zoom',
      type: 'Virtual',
      meetingLink: 'https://meet.example.com/react-panel'
    },
    {
      id: 'INT-3012',
      candidate: 'Ranjan Patnaik',
      role: 'Node.js Engineer',
      stage: 'Technical Screen',
      interviewer: 'Joel Mathews',
      dateTime: new Date('2025-11-24T14:30:00'),
      duration: '45 mins',
      location: 'Teams',
      type: 'Virtual',
      meetingLink: 'https://meet.example.com/node-screen',
      notes: 'Share coding exercise link 10 mins before call.'
    },
    {
      id: 'INT-3013',
      candidate: 'Priya Malik',
      role: 'Product Designer',
      stage: 'Portfolio Review',
      interviewer: 'Suresh Batra',
      dateTime: new Date('2025-11-25T11:00:00'),
      duration: '30 mins',
      location: 'HQ - Collaboration Room 2',
      type: 'In person'
    },
    {
      id: 'INT-3014',
      candidate: 'Miguel Torres',
      role: 'QA Lead',
      stage: 'Manager Round',
      interviewer: 'Divya Sinha',
      dateTime: new Date('2025-11-26T09:30:00'),
      duration: '45 mins',
      location: 'HQ - Conf Room 5',
      type: 'In person',
      notes: 'Provide onsite visitor badge at reception.'
    },
    {
      id: 'INT-3015',
      candidate: 'Louise Chen',
      role: 'Data Scientist',
      stage: 'Final Round',
      interviewer: 'Hrishikesh Rao',
      dateTime: new Date('2025-11-28T16:00:00'),
      duration: '60 mins',
      location: 'Zoom',
      type: 'Virtual',
      meetingLink: 'https://meet.example.com/data-final'
    },
    {
      id: 'INT-3016',
      candidate: 'Nia Johnson',
      role: 'People Partner',
      stage: 'HR Conversation',
      interviewer: 'Himanshu Nayak',
      dateTime: new Date('2025-12-04T13:00:00'),
      duration: '30 mins',
      location: 'Teams',
      type: 'Virtual',
      meetingLink: 'https://meet.example.com/hr-conversation'
    }
  ];

  setTimeframe(filter: FilterOption): void {
    this.selectedTimeframe = filter;
  }

  get groupedInterviews(): InterviewGroup[] {
    const filtered = this.getFilteredInterviews();

    // Groups interviews by calendar date to keep template bindings efficient.
    const groups = new Map<string, InterviewEvent[]>();
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
    return this.interviews.filter(event => event.stage.toLowerCase().includes('review')).length;
  }

  get nextInterview(): InterviewEvent | undefined {
    const upcoming = this.interviews
      .filter(event => event.dateTime >= new Date())
      .sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());
    return upcoming[0];
  }

  private getFilteredInterviews(): InterviewEvent[] {
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
