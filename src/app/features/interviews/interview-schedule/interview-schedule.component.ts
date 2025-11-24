import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InterviewService } from '../../../core/services/interview.service';
import { ToastService } from '../../../core/services/toast.service';
import {
  InterviewScheduleMetadata,
  InterviewTimeSlotSuggestion,
  ScheduleInterviewRequest,
  InterviewLocationType
} from '../../../shared/models/interview.model';

interface TimeSlotSuggestionView {
  id?: string;
  label: string;
  date: string;
  time: string;
  timezone: string;
  rawStart?: Date;
}

@Component({
  selector: 'app-interview-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './interview-schedule.component.html',
  styleUrls: ['./interview-schedule.component.css']
})
export class InterviewScheduleComponent implements OnInit {
  stageOptions: string[] = [];
  interviewerOptions: string[] = [];
  locationOptions: { id: InterviewLocationType | string; label: string }[] = [];
  timezoneOptions: string[] = [];
  reminderOptions: string[] = [];
  meetingProviders: string[] = [];

  availableTimeSlots: TimeSlotSuggestionView[] = [];

  metadataLoading = false;
  metadataError: string | null = null;
  submitting = false;

  model = {
    candidate: '',
    candidateEmail: '',
    job: '',
    stage: '',
    interviewers: [] as string[],
    date: '',
    time: '',
    duration: 45,
    timezone: '',
    locationType: 'virtual' as InterviewLocationType,
    locationDetail: '',
    meetingLink: '',
    notesForCandidate: '',
    notesForInterviewers: '',
    reminders: ['24 hours before', '1 hour before'] as string[],
    sendCalendarInvite: true,
    sharePrepDocs: true,
    meetingProvider: ''
  };

  constructor(private interviewService: InterviewService, private toast: ToastService) {}

  ngOnInit(): void {
    this.loadMetadata();
  }

  setSuggestedSlot(slot: TimeSlotSuggestionView): void {
    this.model.date = slot.date;
    this.model.time = slot.time;
    this.model.timezone = slot.timezone;
  }

  handleLocationChange(value: InterviewLocationType | string): void {
    if (value !== 'virtual') {
      this.model.meetingProvider = '';
      this.model.meetingLink = '';
    } else if (!this.model.meetingProvider && this.meetingProviders.length) {
      this.model.meetingProvider = this.meetingProviders[0];
    }
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
    if (!this.model.candidate || !this.model.stage || !this.model.date || !this.model.time) {
      this.toast.warning('Candidate, stage, date, and time are required.', 4000, true);
      return;
    }

    this.submitting = true;

    const request: ScheduleInterviewRequest = {
      candidateName: this.model.candidate,
      candidateEmail: this.model.candidateEmail,
      jobTitle: this.model.job,
      stage: this.model.stage,
      interviewers: [...this.model.interviewers],
      scheduledDate: this.model.date,
      scheduledTime: this.model.time,
      timezone: this.model.timezone,
      durationMinutes: this.model.duration,
      locationType: this.model.locationType,
      meetingLink: this.model.locationType === 'virtual' ? this.model.meetingLink : undefined,
      locationDetail: this.model.locationType === 'onsite' ? this.model.locationDetail : undefined,
      notesForCandidate: this.model.notesForCandidate,
      notesForInterviewers: this.model.notesForInterviewers,
      reminders: [...this.model.reminders],
      sendCalendarInvite: this.model.sendCalendarInvite,
      sharePrepDocs: this.model.sharePrepDocs
    };

    if (this.model.meetingProvider) {
      request.meetingProvider = this.model.meetingProvider;
    }

    this.interviewService.scheduleInterview(request).subscribe({
      next: event => {
        this.toast.success(`Interview scheduled with ${event.candidate ?? 'candidate'}.`, 4000, true);
        this.submitting = false;
      },
      error: err => {
        console.error('Failed to schedule interview', err);
        this.toast.error('Could not schedule interview. Please try again.', 4000, true);
        this.submitting = false;
      }
    });
  }

  private loadMetadata(): void {
    this.metadataLoading = true;
    this.metadataError = null;

    this.interviewService.getScheduleMetadata().subscribe({
      next: (metadata: InterviewScheduleMetadata) => {
        this.stageOptions = metadata.stageOptions ?? [];
        this.interviewerOptions = metadata.interviewerOptions ?? [];
        this.locationOptions = metadata.locationOptions.length
          ? metadata.locationOptions
          : [
              { id: 'virtual', label: 'Virtual meeting' },
              { id: 'onsite', label: 'Onsite at office' }
            ];
        this.timezoneOptions = metadata.timezoneOptions.length
          ? metadata.timezoneOptions
          : ['Asia/Kolkata (IST)', 'Asia/Dubai (GST)', 'Europe/London (GMT)', 'America/New_York (EST)'];
        this.reminderOptions = metadata.reminderOptions.length
          ? metadata.reminderOptions
          : ['24 hours before', '3 hours before', '1 hour before', '15 minutes before'];
        this.meetingProviders = metadata.meetingProviders ?? [];
        this.availableTimeSlots = metadata.suggestedSlots.map(slot => this.toSlotView(slot));

        if (!this.model.timezone) {
          this.model.timezone = metadata.defaultTimezone ?? this.timezoneOptions[0] ?? 'UTC';
        }

        if (this.model.locationType === 'virtual' && !this.model.meetingProvider && this.meetingProviders.length) {
          this.model.meetingProvider = metadata.defaultProvider ?? this.meetingProviders[0];
        }

        this.metadataLoading = false;
      },
      error: err => {
        console.error('Failed to load scheduling metadata', err);
        this.metadataError = 'Unable to load interview metadata right now.';
        this.metadataLoading = false;
      }
    });
  }

  private toSlotView(slot: InterviewTimeSlotSuggestion): TimeSlotSuggestionView {
    const date = slot.start ?? new Date();
    const isoDate = this.toISODate(date);
    const isoTime = this.toISOTime(date);
    return {
      id: slot.id,
      label: slot.label,
      date: isoDate,
      time: isoTime,
      timezone: slot.timezone,
      rawStart: slot.start
    };
  }

  private toISODate(date: Date): string {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
      .getDate()
      .toString()
      .padStart(2, '0')}`;
  }

  private toISOTime(date: Date): string {
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }

  formatProvider(provider: string): string {
    const normalized = provider.replace(/[_-]+/g, ' ').trim();
    return normalized
      .split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
