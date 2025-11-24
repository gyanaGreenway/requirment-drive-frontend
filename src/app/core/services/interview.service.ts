import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  InterviewCalendarEvent,
  InterviewCalendarFilter,
  InterviewCalendarResponse,
  InterviewFeedbackEntry,
  InterviewFeedbackFilter,
  InterviewLocationType,
  InterviewScheduleMetadata,
  InterviewTimeSlotSuggestion,
  InterviewTimeframe,
  ScheduleInterviewRequest
} from '../../shared/models/interview.model';

interface CalendarApiResponse {
  items?: any[];
  events?: any[];
  data?: any[];
  totalCount?: number;
  generatedAt?: string;
  [key: string]: any;
}

interface FeedbackApiResponse {
  items?: any[];
  data?: any[];
  feedback?: any[];
  totalCount?: number;
}

interface ScheduleMetadataApiResponse {
  stageOptions?: any;
  stages?: any;
  stage?: any;
  interviewerOptions?: any;
  interviewers?: any;
  interviewer?: any;
  timezoneOptions?: any;
  timezones?: any;
  timezone?: any;
  reminderOptions?: any;
  reminders?: any;
  reminder?: any;
  locationOptions?: any;
  locations?: any;
  suggestedSlots?: any;
  slots?: any;
  defaultTimezone?: string;
  meetingProviders?: any;
  defaultProvider?: string;
}

@Injectable({ providedIn: 'root' })
export class InterviewService {
  private readonly calendarEndpoint = 'Interviews/calendar';
  private readonly feedbackEndpoint = 'Interviews/feedback';
  private readonly scheduleMetadataEndpoint = 'Interviews/schedule/metadata';
  private readonly scheduleEndpoint = 'Interviews';

  constructor(private api: ApiService) {}

  getCalendarEvents(filter: InterviewCalendarFilter = {}): Observable<InterviewCalendarResponse> {
    const params: Record<string, any> = {};

    if (filter.timeframe) params['timeframe'] = filter.timeframe;
    if (filter.startDate) params['startDate'] = filter.startDate;
    if (filter.endDate) params['endDate'] = filter.endDate;
    if (filter.interviewerId) params['interviewerId'] = filter.interviewerId;
    if (filter.jobId) params['jobId'] = filter.jobId;
    if (filter.stage) params['stage'] = filter.stage;

    return this.api.get<CalendarApiResponse>(this.calendarEndpoint, params).pipe(
      map(response => this.normalizeCalendarResponse(response)),
      catchError(err => {
        if (err?.status === 404) {
          return of({ events: [], totalCount: 0 });
        }
        return throwError(() => err);
      })
    );
  }

  getScheduleMetadata(): Observable<InterviewScheduleMetadata> {
    return this.api.get<ScheduleMetadataApiResponse>(this.scheduleMetadataEndpoint).pipe(
      map(response => this.normalizeScheduleMetadata(response)),
      catchError(err => {
        if (err?.status === 404) {
          return of({
            stageOptions: [],
            interviewerOptions: [],
            timezoneOptions: [],
            reminderOptions: [],
            locationOptions: [],
            suggestedSlots: [],
            meetingProviders: [],
            defaultProvider: undefined,
            defaultTimezone: undefined
          });
        }
        return throwError(() => err);
      })
    );
  }

  scheduleInterview(request: ScheduleInterviewRequest): Observable<InterviewCalendarEvent> {
    const payload = this.buildSchedulePayload(request);
    return this.api.post<any>(this.scheduleEndpoint, payload).pipe(
      map(raw => this.normalizeCalendarEvent(raw)),
      catchError(err => throwError(() => err))
    );
  }

  getFeedbackEntries(filter: InterviewFeedbackFilter = {}): Observable<InterviewFeedbackEntry[]> {
    const params: Record<string, any> = {};
    if (filter.status) params['status'] = filter.status;
    if (filter.verdict) params['verdict'] = filter.verdict;
    if (filter.jobId) params['jobId'] = filter.jobId;
    if (filter.interviewerId) params['interviewerId'] = filter.interviewerId;
    if (filter.startDate) params['startDate'] = filter.startDate;
    if (filter.endDate) params['endDate'] = filter.endDate;

    return this.api.get<FeedbackApiResponse>(this.feedbackEndpoint, params).pipe(
      map(response => this.normalizeFeedbackResponse(response)),
      catchError(err => {
        if (err?.status === 404) {
          return of([]);
        }
        return throwError(() => err);
      })
    );
  }

  private normalizeCalendarResponse(response: CalendarApiResponse | null | undefined): InterviewCalendarResponse {
    if (!response) {
      return { events: [], totalCount: 0 };
    }

    const rawEvents = Array.isArray(response.items)
      ? response.items
      : Array.isArray(response.events)
      ? response.events
      : Array.isArray(response.data)
      ? response.data
      : [];

    const events = rawEvents.map(item => this.normalizeCalendarEvent(item));
    const totalCount = response.totalCount ?? events.length;
    const generatedAt = response.generatedAt ? this.toDate(response.generatedAt) ?? undefined : undefined;

    return { events, totalCount, generatedAt };
  }

  private normalizeScheduleMetadata(raw: ScheduleMetadataApiResponse | null | undefined): InterviewScheduleMetadata {
    if (!raw) {
      return {
        stageOptions: [],
        interviewerOptions: [],
        timezoneOptions: [],
        reminderOptions: [],
        locationOptions: [],
        suggestedSlots: [],
        meetingProviders: []
      };
    }

    const stageOptions = this.extractStringArray(raw.stageOptions ?? raw.stages ?? raw.stage);
    const interviewerOptions = this.extractStringArray(raw.interviewerOptions ?? raw.interviewers ?? raw.interviewer);
    const timezoneOptions = this.extractStringArray(raw.timezoneOptions ?? raw.timezones ?? raw.timezone);
    const reminderOptions = this.extractStringArray(raw.reminderOptions ?? raw.reminders ?? raw.reminder);
    const locationOptionsRaw = Array.isArray(raw.locationOptions ?? raw.locations)
      ? (raw.locationOptions ?? raw.locations)
      : [];
    const locationOptions = locationOptionsRaw.map((option: any) => ({
      id: option?.id ?? option?.value ?? option?.key ?? option ?? '',
      label: option?.label ?? option?.name ?? option?.title ?? option ?? ''
    })).filter((option: { label: string }) => option.label);

    const slotsRaw = Array.isArray(raw.suggestedSlots ?? raw.slots)
      ? (raw.suggestedSlots ?? raw.slots)
      : [];
    const suggestedSlots = slotsRaw
      .map((slot: any) => this.normalizeSlot(slot))
      .filter((slot: InterviewTimeSlotSuggestion | null): slot is InterviewTimeSlotSuggestion => !!slot);

    const meetingProviders = this.extractStringArray(raw.meetingProviders);
    const defaultProvider = typeof raw.defaultProvider === 'string' ? raw.defaultProvider : undefined;

    return {
      stageOptions,
      interviewerOptions,
      timezoneOptions,
      reminderOptions,
      locationOptions,
      suggestedSlots,
      defaultTimezone: raw.defaultTimezone,
      meetingProviders,
      defaultProvider
    };
  }

  private normalizeSlot(slot: any): InterviewTimeSlotSuggestion | null {
    if (!slot) {
      return null;
    }

    const startValue = slot.start ?? slot.startTime ?? slot.startUtc ?? slot.dateTime;
    const timezone = slot.timezone ?? slot.timeZone ?? slot.zone ?? '';
    const label = slot.label ?? slot.name ?? `${timezone} slot`;
    const duration = slot.durationMinutes ?? slot.duration ?? null;
    const startDate = this.toDate(startValue);
    if (!startDate) {
      return null;
    }

    return {
      id: slot.id ?? slot.key ?? undefined,
      label,
      start: startDate,
      timezone: timezone || 'UTC',
      durationMinutes: typeof duration === 'number' ? duration : undefined
    };
  }

  private normalizeCalendarEvent(raw: any): InterviewCalendarEvent {
    const dateValue = raw?.dateTime ?? raw?.scheduledStart ?? raw?.startTime ?? raw?.start;
    const dateTime = this.toDate(dateValue) ?? new Date();
    const durationMinutes = this.resolveDuration(raw);
    const durationLabel = this.formatDuration(raw?.duration ?? raw?.durationLabel, durationMinutes);
    const formatText = raw?.type ?? raw?.format ?? raw?.mode ?? null;

    return {
      id: this.coerceId(raw),
      candidateId: raw?.candidateId ?? raw?.CandidateId,
      candidate: raw?.candidate ?? raw?.candidateName ?? raw?.CandidateName ?? 'Pending assignment',
      candidateEmail: raw?.candidateEmail ?? raw?.CandidateEmail ?? null,
      role: raw?.role ?? raw?.roleTitle ?? raw?.jobTitle ?? raw?.JobTitle ?? 'Untitled role',
      jobId: raw?.jobId ?? raw?.JobId,
      stage: raw?.stage ?? raw?.Stage ?? raw?.phase ?? 'Interview',
      interviewerId: raw?.interviewerId ?? raw?.InterviewerId,
      interviewer: raw?.interviewer ?? raw?.interviewerName ?? raw?.InterviewerName ?? 'Hiring team',
      dateTime,
      duration: durationLabel,
      durationMinutes,
      location: raw?.location ?? raw?.Location ?? raw?.venue ?? null,
      type: this.normalizeFormat(formatText),
      meetingLink: raw?.meetingLink ?? raw?.MeetingLink ?? raw?.joinUrl ?? raw?.JoinUrl ?? null,
      notes: raw?.notes ?? raw?.Notes ?? raw?.description ?? raw?.Description ?? null,
      timezone: raw?.timezone ?? raw?.timeZone ?? raw?.Timezone ?? null
    };
  }

  private normalizeFeedbackResponse(response: FeedbackApiResponse | null | undefined): InterviewFeedbackEntry[] {
    if (!response) {
      return [];
    }

    const rawEntries = Array.isArray(response.items)
      ? response.items
      : Array.isArray(response.feedback)
      ? response.feedback
      : Array.isArray(response.data)
      ? response.data
      : [];

    return rawEntries.map(entry => this.normalizeFeedback(entry));
  }

  private normalizeFeedback(raw: any): InterviewFeedbackEntry {
    return {
      id: String(raw?.id ?? raw?.feedbackId ?? raw?.FeedbackId ?? raw?.code ?? Math.random().toString(36).slice(2)),
      candidate: raw?.candidate ?? raw?.candidateName ?? raw?.CandidateName ?? 'Unknown candidate',
      role: raw?.role ?? raw?.roleTitle ?? raw?.jobTitle ?? raw?.JobTitle ?? 'Unknown role',
      stage: raw?.stage ?? raw?.Stage ?? 'Interview',
      interviewer: raw?.interviewer ?? raw?.interviewerName ?? raw?.InterviewerName ?? 'Panel',
      submittedOn: this.toDate(raw?.submittedOn ?? raw?.submittedAt ?? raw?.SubmittedOn ?? raw?.SubmittedAt) ?? new Date(),
      score: this.toNumber(raw?.score ?? raw?.Score, 0),
      verdict: this.normalizeVerdict(raw?.verdict ?? raw?.Verdict),
      strengths: this.extractStringArray(raw?.strengths ?? raw?.Strengths),
      reservations: this.extractStringArray(raw?.reservations ?? raw?.Reservations),
      notes: raw?.notes ?? raw?.Notes ?? null,
      status: raw?.status ?? raw?.Status ?? 'Pending decision',
      nextActions: raw?.nextActions ?? raw?.NextActions ?? null
    };
  }

  private buildSchedulePayload(request: ScheduleInterviewRequest): any {
    const base: any = {
      candidateId: request.candidateId,
      candidateName: request.candidateName,
      candidateEmail: request.candidateEmail,
      jobId: request.jobId,
      jobTitle: request.jobTitle,
      stage: request.stage,
      interviewers: request.interviewers,
      scheduledDate: request.scheduledDate,
      scheduledTime: request.scheduledTime,
      timezone: request.timezone,
      durationMinutes: request.durationMinutes,
      locationType: request.locationType,
      meetingLink: request.meetingLink,
      meetingProvider: request.meetingProvider,
      locationDetail: request.locationDetail,
      notesForCandidate: request.notesForCandidate,
      notesForInterviewers: request.notesForInterviewers,
      reminders: request.reminders,
      sendCalendarInvite: request.sendCalendarInvite,
      sharePrepDocs: request.sharePrepDocs
    };

    if (request.payload && typeof request.payload === 'object') {
      Object.assign(base, request.payload);
    }

    return base;
  }

  private resolveDuration(raw: any): number | undefined {
    const direct = raw?.durationMinutes ?? raw?.DurationMinutes ?? raw?.duration ?? raw?.Duration;
    if (typeof direct === 'number') {
      return direct;
    }
    if (typeof direct === 'string') {
      const parsed = parseInt(direct, 10);
      return Number.isFinite(parsed) ? parsed : undefined;
    }
    const stringValue = raw?.durationLabel ?? raw?.DurationLabel;
    if (typeof stringValue === 'string') {
      const match = stringValue.match(/(\d+)/);
      if (match) {
        const parsed = parseInt(match[1], 10);
        return Number.isFinite(parsed) ? parsed : undefined;
      }
    }
    return undefined;
  }

  private formatDuration(label: any, minutes: number | undefined): string | null {
    if (typeof label === 'string' && label.trim()) {
      return label.trim();
    }
    if (typeof minutes === 'number' && minutes > 0) {
      return `${minutes} mins`;
    }
    return null;
  }

  private normalizeFormat(value: any): InterviewCalendarEvent['type'] {
    const text = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (text.includes('virtual') || text.includes('zoom') || text.includes('teams')) {
      return 'Virtual';
    }
    if (text.includes('onsite') || text.includes('office')) {
      return 'Onsite';
    }
    if (text.includes('person')) {
      return 'In person';
    }
    return 'Virtual';
  }

  private normalizeVerdict(value: any): InterviewFeedbackEntry['verdict'] {
    const text = typeof value === 'string' ? value.trim().toLowerCase() : '';
    if (text.startsWith('adv')) {
      return 'Advance';
    }
    if (text.startsWith('hold')) {
      return 'Hold for next round';
    }
    return 'Reject';
  }

  private extractStringArray(source: any): string[] {
    if (!source) {
      return [];
    }
    if (Array.isArray(source)) {
        return source
          .map(item => {
            if (typeof item === 'string') {
              return item.trim();
            }
            if (item && typeof item === 'object') {
              const value = item.label ?? item.name ?? item.title ?? item.value ?? item.id;
              if (typeof value === 'string') {
                return value.trim();
              }
              if (value !== undefined && value !== null) {
                return `${value}`.trim();
              }
            }
            return `${item ?? ''}`.trim();
          })
          .filter(Boolean);
    }
    if (typeof source === 'string') {
      return source
        .split(/[,\n;]+/)
        .map(part => part.trim())
        .filter(Boolean);
    }
    return [];
  }

  private toDate(value: any): Date | null {
    if (!value) {
      return null;
    }
    if (value instanceof Date) {
      return isNaN(value.getTime()) ? null : value;
    }
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  private toNumber(value: any, fallback = 0): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private coerceId(raw: any): string {
    const candidates = [
      raw?.id,
      raw?.Id,
      raw?.interviewId,
      raw?.InterviewId,
      raw?.publicId,
      raw?.PublicId,
      raw?.code,
      raw?.Code
    ];
    for (const candidate of candidates) {
      if (candidate !== undefined && candidate !== null) {
        return String(candidate);
      }
    }
    return `int-${Math.random().toString(36).slice(2, 10)}`;
  }
}
