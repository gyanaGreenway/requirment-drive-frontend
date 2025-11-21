import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
	const router = inject(Router);
	return next(req).pipe(
		catchError((error: HttpErrorResponse) => {
			if (error.status === 401) {
				// Skip redirect for login attempts so component can show message
				const isAuthLogin = /auth\/login/i.test(req.url);
				if (!isAuthLogin) {
					const rawUser = localStorage.getItem('currentUser');
					let loginPath = '/candidate-login';
					if (rawUser) {
						try {
							const u = JSON.parse(rawUser);
							const role = (u?.role || '').toString().toLowerCase();
							if (role === 'hr' || role === 'admin' || role === 'manager') loginPath = '/hr-login';
						} catch {}
					}
					localStorage.removeItem('token');
					localStorage.removeItem('currentUser');
					router.navigate([loginPath], { queryParams: { session: 'expired' } });
				}
			}
			return throwError(() => error);
		})
	);
};
