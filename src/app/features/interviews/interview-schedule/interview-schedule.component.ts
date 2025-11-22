import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type LocationType = 'virtual' | 'onsite';

interface TimeSlotSuggestion {
  label: string;
  date: string;
  time: string;
  timezone: string;
}

@Component({
  selector: 'app-interview-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interview-schedule.component.html',
  styleUrls: ['./interview-schedule.component.css']
})
export class InterviewScheduleComponent {
  stageOptions = ['Phone screen', 'Technical screen', 'Panel interview', 'Hiring manager', 'HR chat'];
  interviewerOptions = ['Anita Desai', 'Joel Mathews', 'Divya Sinha', 'Hrishikesh Rao', 'Himanshu Nayak'];
  locationOptions: { id: LocationType; label: string }[] = [
    { id: 'virtual', label: 'Virtual meeting' },
    { id: 'onsite', label: 'Onsite at office' }
  ];
  timezoneOptions = ['Asia/Kolkata (IST)', 'Asia/Dubai (GST)', 'Europe/London (GMT)', 'America/New_York (EST)'];
  reminderOptions = ['24 hours before', '3 hours before', '1 hour before', '15 minutes before'];

  availableTimeSlots: TimeSlotSuggestion[] = [
    { label: 'Team preferred slot', date: '2025-11-24', time: '10:00', timezone: 'Asia/Kolkata (IST)' },
    { label: 'Candidate request', date: '2025-11-24', time: '14:30', timezone: 'Asia/Kolkata (IST)' },
    { label: 'Alternate window', date: '2025-11-25', time: '11:00', timezone: 'Asia/Kolkata (IST)' }
  ];

  model = {
    candidate: '',
    candidateEmail: '',
    job: '',
    stage: '',
    interviewers: [] as string[],
    date: '',
    time: '',
    duration: 45,
    timezone: 'Asia/Kolkata (IST)',
    locationType: 'virtual' as LocationType,
    locationDetail: '',
    meetingLink: '',
    notesForCandidate: '',
    notesForInterviewers: '',
    reminders: ['24 hours before', '1 hour before'] as string[],
    sendCalendarInvite: true,
    sharePrepDocs: true
  };

  setSuggestedSlot(slot: TimeSlotSuggestion): void {
    this.model.date = slot.date;
    this.model.time = slot.time;
    this.model.timezone = slot.timezone;
  }

  isReminderSelected(option: string): boolean {
    return this.model.reminders.includes(option);
  }

  toggleReminder(option: string): void {
    if (this.isReminderSelected(option)) {
      this.model.reminders = this.model.reminders.filter(reminder => reminder !== option);
      return;
    }
    this.model.reminders = [...this.model.reminders, option];
  }

  schedule(): void {
    console.log('Interview scheduled', this.model);
  }
}
