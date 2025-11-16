import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  createdAt: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  show(message: string, opts?: { type?: ToastType; duration?: number; sound?: boolean }): void {
    const type: ToastType = opts?.type ?? 'info';
    const duration = Math.max(1000, Math.min(opts?.duration ?? 3000, 20000));
    const toast: Toast = {
      id: Math.random().toString(36).slice(2),
      message,
      type,
      duration,
      createdAt: Date.now(),
    };
    const list = this.toastsSubject.getValue();
    this.toastsSubject.next([...list, toast]);

    if (opts?.sound) {
      this.playBeep(type);
    }

    // Auto dismiss
    setTimeout(() => this.dismiss(toast.id), duration);
  }

  success(message: string, duration = 3000, sound = false) {
    this.show(message, { type: 'success', duration, sound });
  }

  error(message: string, duration = 4000, sound = false) {
    this.show(message, { type: 'error', duration, sound });
  }

  info(message: string, duration = 3000, sound = false) {
    this.show(message, { type: 'info', duration, sound });
  }

  warning(message: string, duration = 3500, sound = false) {
    this.show(message, { type: 'warning', duration, sound });
  }

  dismiss(id: string) {
    const list = this.toastsSubject.getValue();
    this.toastsSubject.next(list.filter(t => t.id !== id));
  }

  private playBeep(type: ToastType) {
    try {
      const AudioCtx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.connect(g);
      g.connect(ctx.destination);
      o.type = 'sine';
      // Different frequencies for different types
      const freq = type === 'success' ? 880 : type === 'error' ? 440 : type === 'warning' ? 660 : 990;
      o.frequency.value = freq;
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.06, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
      o.start(now);
      o.stop(now + 0.26);
    } catch {
      // ignore audio errors
    }
  }
}
