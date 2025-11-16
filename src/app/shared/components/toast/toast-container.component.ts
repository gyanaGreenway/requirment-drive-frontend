import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { ToastService, Toast } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.css']
})
export class ToastContainerComponent {
  toasts$: Observable<Toast[]>;

  constructor(private toastService: ToastService) {
    this.toasts$ = this.toastService.toasts$;
  }

  trackById(_: number, t: Toast) { return t.id; }
  close(id: string) { this.toastService.dismiss(id); }
  classFor(t: Toast) {
    return {
      'toast-item': true,
      'success': t.type === 'success',
      'error': t.type === 'error',
      'info': t.type === 'info',
      'warning': t.type === 'warning',
    } as any;
  }
}
