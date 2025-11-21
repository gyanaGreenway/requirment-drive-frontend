import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError, interval, Subscription } from 'rxjs';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';

export interface AuthResponse {
  token: string;
  user?: any;
  role?: string;
  userId?: number;
  email?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Session tracking
  private sessionExpiresAtSubject = new BehaviorSubject<Date | null>(null);
  public sessionExpiresAt$ = this.sessionExpiresAtSubject.asObservable();

  private sessionWarningMinutesLeftSubject = new BehaviorSubject<number | null>(null);
  public sessionWarningMinutesLeft$ = this.sessionWarningMinutesLeftSubject.asObservable();

  private tickSub?: Subscription;
  private warningThresholdMinutes = 5; // show warning in last 5 minutes by default

  constructor(private api: ApiService) {
    // attempt to load token/user from localStorage
    const rawUser = localStorage.getItem('currentUser');
    if (rawUser) {
      this.currentUserSubject.next(JSON.parse(rawUser));
    }

    const token = localStorage.getItem('token');
    if (token) {
      this.initializeSessionFromToken(token);
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const payloads: any[] = [
      { email, password },
      { username: email, password },
      { userName: email, password },
      { email, password, username: email, userName: email }
    ];
    return this.tryLoginVariants(payloads);
  }

  loginWithUsername(username: string, password: string): Observable<AuthResponse> {
    const payloads: any[] = [
      { username, password },
      { userName: username, password },
      { email: username, password },
      { username, userName: username, email: username, password }
    ];
    return this.tryLoginVariants(payloads);
  }

  private tryLoginVariants(payloads: any[], endpointVariants?: string[]): Observable<AuthResponse> {
    const endpoints = endpointVariants ?? [
      environment.authLoginEndpoint || 'auth/login',
      'auth/login',
      'Auth/Login',
      'auth/hr/login',
      'Auth/Hr/Login',
      'hr/login',
      'Hr/Login'
    ];
    if (!payloads.length) return throwError(() => new Error('No login payloads specified'));
    const [payload, ...restPayloads] = payloads;
    return new Observable<AuthResponse>(observer => {
      this.tryEndpointRecursive(payload, endpoints, observer, () => {
        if (restPayloads.length) {
          // Try next payload with full endpoint list again
          const next$ = this.tryLoginVariants(restPayloads, endpoints);
          next$.subscribe({ next: v => { observer.next(v); observer.complete(); }, error: e => observer.error(e) });
        } else {
          observer.error(new Error('All login variants failed'));
        }
      });
    });
  }

  private tryEndpointRecursive(payload: any, endpoints: string[], observer: any, onFailAll: () => void): void {
    if (!endpoints.length) { onFailAll(); return; }
    const [ep, ...rest] = endpoints;
    this.api.post<AuthResponse>(ep, payload).subscribe({
      next: (res) => {
        if (res && res.token) {
          localStorage.setItem('token', res.token);
          this.initializeSessionFromToken(res.token);
        }
        const normalizedUser = res.user ?? {
          id: res.userId,
          email: res.email,
          role: res.role
        };
        if (normalizedUser) {
          localStorage.setItem('currentUser', JSON.stringify(normalizedUser));
          this.currentUserSubject.next(normalizedUser);
        }
        observer.next(res);
        observer.complete();
      },
      error: (err) => {
        // Retry on 404/405 (endpoint mismatch). For 401, still try next variants before giving up.
        if (err.status === 404 || err.status === 405 || err.status === 401) {
          this.tryEndpointRecursive(payload, rest, observer, onFailAll);
        } else {
          onFailAll();
        }
      }
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
    this.sessionExpiresAtSubject.next(null);
    this.sessionWarningMinutesLeftSubject.next(null);
    if (this.tickSub) {
      this.tickSub.unsubscribe();
      this.tickSub = undefined;
    }
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }

  getCurrentUserProfile(): Observable<any> {
    return this.api.get<any>('auth/me');
  }

  getCandidateId(): number | null {
    const user = this.getCurrentUser();
    return user?.candidateId || user?.id || null;
  }

  // ===== JWT/session helpers =====
  private initializeSessionFromToken(token: string): void {
    try {
      const payload = this.decodeJwt(token);
      const expSec: number | undefined = payload?.exp;
      if (!expSec) {
        this.sessionExpiresAtSubject.next(null);
        return;
      }
      const expiresAt = new Date(expSec * 1000);
      this.sessionExpiresAtSubject.next(expiresAt);
      // Start ticking each 15s to update warnings
      if (this.tickSub) this.tickSub.unsubscribe();
      this.tickSub = interval(15000).subscribe(() => this.updateSessionWarning());
      // Immediately compute once
      this.updateSessionWarning();
    } catch {
      this.sessionExpiresAtSubject.next(null);
    }
  }

  private updateSessionWarning(): void {
    const expiresAt = this.sessionExpiresAtSubject.value;
    if (!expiresAt) {
      this.sessionWarningMinutesLeftSubject.next(null);
      return;
    }
    const remainingMs = expiresAt.getTime() - Date.now();
    if (remainingMs <= 0) {
      this.sessionWarningMinutesLeftSubject.next(0);
      return;
    }
    const minutesLeft = Math.ceil(remainingMs / 60000);
    if (minutesLeft <= this.warningThresholdMinutes) {
      this.sessionWarningMinutesLeftSubject.next(minutesLeft);
    } else {
      this.sessionWarningMinutesLeftSubject.next(null);
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = this.decodeJwt(token);
      const expSec: number | undefined = payload?.exp;
      if (!expSec) return true; // no exp claim -> assume valid
      return Date.now() < expSec * 1000;
    } catch {
      return false;
    }
  }

  getTokenRemainingMs(): number | null {
    const expiresAt = this.sessionExpiresAtSubject.value;
    return expiresAt ? Math.max(0, expiresAt.getTime() - Date.now()) : null;
  }

  private decodeJwt(token: string): any {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const json = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'));
    try {
      return JSON.parse(decodeURIComponent(escape(json)));
    } catch {
      return JSON.parse(json);
    }
  }
}
