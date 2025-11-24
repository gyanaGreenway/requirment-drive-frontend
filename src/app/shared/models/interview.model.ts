export type InterviewTimeframe = 'today' | 'week' | 'month' | 'all';

export interface InterviewCalendarFilter {
  timeframe?: InterviewTimeframe;
  startDate?: Date;
  endDate?: Date;
  interviewerId?: number | string;
  jobId?: number;
  stage?: string;
}

export type InterviewFormat = 'Virtual' | 'In person' | 'Onsite';

export interface InterviewCalendarEvent {
  id: string;
  candidateId?: number;
  candidate?: string;
  candidateEmail?: string;
  role?: string;
  jobId?: number;
  stage?: string;
  interviewerId?: number | string;
  interviewer?: string;
  dateTime: Date;
  duration?: string | null;
  durationMinutes?: number | null;
  location?: string | null;
  type?: InterviewFormat;
  meetingLink?: string | null;
  notes?: string | null;
  timezone?: string | null;
}

export interface InterviewCalendarResponse {
  events: InterviewCalendarEvent[];
  totalCount?: number;
  generatedAt?: Date;
}

export interface InterviewScheduleMetadata {
  stageOptions: string[];
  interviewerOptions: string[];
  timezoneOptions: string[];
  reminderOptions: string[];
  locationOptions: Array<{ id: string; label: string }>;
  suggestedSlots: InterviewTimeSlotSuggestion[];
  defaultTimezone?: string;
  meetingProviders: string[];
  defaultProvider?: string;
}

export interface InterviewTimeSlotSuggestion {
  id?: string;
  label: string;
  start: Date;
  timezone: string;
  durationMinutes?: number;
}

export type InterviewLocationType = 'virtual' | 'onsite';

export interface ScheduleInterviewRequest {
  candidateId?: number;
  candidateName: string;
  candidateEmail?: string;
  jobId?: number;
  jobTitle?: string;
  stage: string;
  interviewers: string[];
  scheduledDate: string;
  scheduledTime: string;
  timezone: string;
  durationMinutes: number;
  locationType: InterviewLocationType;
  meetingLink?: string;
  meetingProvider?: string;
  locationDetail?: string;
  notesForCandidate?: string;
  notesForInterviewers?: string;
  reminders?: string[];
  sendCalendarInvite?: boolean;
  sharePrepDocs?: boolean;
  payload?: Record<string, any>;
}

export interface InterviewFeedbackEntry {
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
  notes?: string | null;
  status: string;
  nextActions?: string | null;
}

export interface InterviewFeedbackFilter {
  status?: string;
  verdict?: string;
  jobId?: number;
  interviewerId?: number | string;
  startDate?: Date;
  endDate?: Date;
}
