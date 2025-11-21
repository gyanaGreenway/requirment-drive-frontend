import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const currentUser = this.authService.getCurrentUser();
    const isValid = this.authService.isAuthenticated();
    
    // Check if user is logged in
    if (!currentUser || !isValid) {
      const roleHint = currentUser?.role?.toLowerCase();
      const loginPath = roleHint === 'candidate' || roleHint === 'user' ? '/candidate-login' : '/hr-login';
      this.authService.logout();
      this.router.navigate([loginPath], { queryParams: { returnUrl: state.url } });
      return false;
    }

    // Check role-based access
    const requiredRole = route.data['role'] as string;
    if (requiredRole) {
      const userRole = currentUser.role?.toLowerCase();
      
      // HR/Admin can access dashboard routes
      if (requiredRole === 'hr' || requiredRole === 'admin') {
        if (userRole === 'hr' || userRole === 'admin' || userRole === 'manager') {
          return true;
        }
        // Redirect candidates trying to access admin routes
        this.router.navigate(['/candidate-dashboard']);
        return false;
      }
      
      // Candidate routes
      if (requiredRole === 'candidate') {
        if (userRole === 'candidate' || userRole === 'user') {
          return true;
        }
        // Redirect HR trying to access candidate routes
        this.router.navigate(['/dashboard']);
        return false;
      }
    }

    return true;
  }
}
