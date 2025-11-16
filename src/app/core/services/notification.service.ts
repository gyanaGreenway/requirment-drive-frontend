import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface Notification {
  id?: string;
  candidateId: number;
  jobId: number;
  jobTitle: string;
  message: string;
  matchPercentage: number;
  type: 'skill-match' | 'job-posting' | 'application-update';
  read: boolean;
  createdAt: Date | string;
  actionUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService extends ApiService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(http: HttpClient) {
    super(http);
  }

  /**
   * Get all notifications for a candidate
   */
  getCandidateNotifications(candidateId: number): Observable<Notification[]> {
    return this.get(`notifications/candidate/${candidateId}`);
  }

  /**
   * Get unread notifications count
   */
  getUnreadCount(candidateId: number): Observable<number> {
    return this.get(`notifications/candidate/${candidateId}/unread-count`);
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): Observable<void> {
    return this.put(`notifications/${notificationId}/read`, {});
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(candidateId: number): Observable<void> {
    return this.put(`notifications/candidate/${candidateId}/mark-all-read`, {});
  }

  /**
   * Create a new notification (for HR system to push)
   */
  createNotification(notification: Notification): Observable<Notification> {
    return this.post('notifications', notification);
  }

  /**
   * Delete a notification
   */
  deleteNotification(notificationId: string): Observable<void> {
    return this.delete(`notifications/${notificationId}`);
  }

  /**
   * Load notifications locally
   */
  loadNotifications(candidateId: number): void {
    this.getCandidateNotifications(candidateId).subscribe({
      next: (notifications) => {
        this.notificationsSubject.next(notifications);
        this.updateUnreadCount();
      },
      error: (err) => console.error('Failed to load notifications', err)
    });
  }

  /**
   * Add a notification locally
   */
  addNotification(notification: Notification): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...current]);
    this.updateUnreadCount();
  }

  /**
   * Update unread count
   */
  private updateUnreadCount(): void {
    const unreadCount = this.notificationsSubject.value.filter(n => !n.read).length;
    this.unreadCountSubject.next(unreadCount);
  }

  /**
   * Generate notification for job skill match
   */
  generateSkillMatchNotification(
    candidateId: number,
    jobId: number,
    jobTitle: string,
    matchPercentage: number,
    message: string
  ): Notification {
    return {
      candidateId,
      jobId,
      jobTitle,
      message,
      matchPercentage,
      type: 'skill-match',
      read: false,
      createdAt: new Date(),
      actionUrl: `/dashboard/jobs/${jobId}`
    };
  }

  /**
   * Generate notification for new job posting
   */
  generateJobPostingNotification(
    candidateId: number,
    jobId: number,
    jobTitle: string,
    message: string
  ): Notification {
    return {
      candidateId,
      jobId,
      jobTitle,
      message,
      matchPercentage: 0,
      type: 'job-posting',
      read: false,
      createdAt: new Date(),
      actionUrl: `/dashboard/jobs/${jobId}`
    };
  }

  /**
   * Generate notification for application status update
   */
  generateApplicationUpdateNotification(
    candidateId: number,
    jobId: number,
    jobTitle: string,
    status: string,
    message: string
  ): Notification {
    return {
      candidateId,
      jobId,
      jobTitle,
      message: `Your application status for "${jobTitle}" has been updated to: ${status}. ${message}`,
      matchPercentage: 0,
      type: 'application-update',
      read: false,
      createdAt: new Date(),
      actionUrl: `/candidate-dashboard`
    };
  }
}
