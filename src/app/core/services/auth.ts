import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';

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

  constructor(private api: ApiService) {
    // attempt to load token/user from localStorage
    const rawUser = localStorage.getItem('currentUser');
    if (rawUser) {
      this.currentUserSubject.next(JSON.parse(rawUser));
    }
  }

  login(email: string, password: string): Observable<AuthResponse> {
    // Send flexible payload keys to match backend expectations
    const body: any = { email, password, username: email, userName: email };
    return new Observable(observer => {
      this.api.post<AuthResponse>('auth/login', body).subscribe({
        next: (res) => {
          if (res && res.token) {
            localStorage.setItem('token', res.token);
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
        error: (err) => observer.error(err)
      });
    });
  }

  loginWithUsername(username: string, password: string): Observable<AuthResponse> {
    const body: any = { username, userName: username, email: username, password };
    return new Observable(observer => {
      this.api.post<AuthResponse>('auth/login', body).subscribe({
        next: (res) => {
          if (res && res.token) {
            localStorage.setItem('token', res.token);
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
        error: (err) => observer.error(err)
      });
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }
}
