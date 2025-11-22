import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { CommonModule, NgClass, NgForOf, NgIf } from '@angular/common';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { JobService } from '../../core/services/job.service';
import { CandidateService } from '../../core/services/candidate.service';
import { ApplicationService } from '../../core/services/application.service';
import { ApplicationStatus, JobApplication } from '../../shared/models/application.model';
import { APPLICATION_STATUS_LABELS } from '../../shared/models/application-status-labels';
import { AuthService } from '../../core/services/auth';
import { Subscription } from 'rxjs';

interface NavItem {
  id: string;
  label: string;
  icon?: string;
  route?: string;
  exact?: boolean;
  matchPrefixes?: string[];
  children?: NavItem[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet, NgIf, NgForOf, NgClass],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  router: Router;
  showDropdown = false;
  sidebarCollapsed = false;
  recentApplications: JobApplication[] = [];
  stats = {
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    totalApplications: 0,
    newApplications: 0,
    shortlistedApplications: 0,
    hiredApplications: 0,
    rejectedApplications: 0
  };
  loading = false;
  recentLoading = false;
  recentError: string | null = null;

  // Session warning
  sessionMinutesLeft: number | null = null;
  showSessionBanner = false;
  readonly navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'bi-speedometer2',
      route: '/dashboard',
      exact: true
    },
    {
      id: 'recruitment',
      label: 'Recruitment',
      icon: 'bi-diagram-3',
      matchPrefixes: ['/dashboard/jobs', '/dashboard/candidates', '/dashboard/applications'],
      children: [
        { id: 'recruitment-jobs', label: 'Jobs', route: '/dashboard/jobs', exact: true },
        { id: 'recruitment-candidates', label: 'Candidates', route: '/dashboard/candidates', exact: true },
        { id: 'recruitment-applications', label: 'Applications', route: '/dashboard/applications', exact: true }
      ]
    },
    {
      id: 'interviews',
      label: 'Interviews',
      icon: 'bi-calendar-event',
      matchPrefixes: ['/dashboard/interviews'],
      children: [
        { id: 'interviews-calendar', label: 'Calendar', route: '/dashboard/interviews/calendar', exact: true },
        { id: 'interviews-schedule', label: 'Schedule', route: '/dashboard/interviews/schedule', exact: true },
        { id: 'interviews-feedback', label: 'Feedback', route: '/dashboard/interviews/feedback', exact: true }
      ]
    },
    {
      id: 'hiring',
      label: 'Hiring',
      icon: 'bi-envelope-check',
      matchPrefixes: ['/dashboard/hiring'],
      children: [
        { id: 'hiring-offer-letters', label: 'Offer Letters', route: '/dashboard/hiring/offer-letters', exact: true },
        { id: 'hiring-offer-templates', label: 'Offer Templates', route: '/dashboard/hiring/offer-templates', exact: true }
      ]
    },
    {
      id: 'onboarding',
      label: 'Onboarding',
      icon: 'bi-person-plus',
      matchPrefixes: ['/dashboard/onboarding'],
      children: [
        { id: 'onboarding-new', label: 'New Hires', route: '/dashboard/onboarding/new-hires', exact: true },
        { id: 'onboarding-documents', label: 'Document Upload', route: '/dashboard/onboarding/document-upload', exact: true },
        { id: 'onboarding-tasks', label: 'Tasks', route: '/dashboard/onboarding/tasks', exact: true },
        { id: 'onboarding-checklist', label: 'Checklist', route: '/dashboard/onboarding/checklists', exact: true }
      ]
    },
    {
      id: 'bg-verification',
      label: 'BG Verification',
      icon: 'bi-shield-check',
      matchPrefixes: ['/dashboard/bg-verification'],
      children: [
        { id: 'bgv-pending', label: 'Pending', route: '/dashboard/bg-verification/pending', exact: true },
        { id: 'bgv-in-progress', label: 'In Progress', route: '/dashboard/bg-verification/in-progress', exact: true },
        { id: 'bgv-completed', label: 'Completed', route: '/dashboard/bg-verification/completed', exact: true },
        { id: 'bgv-reports', label: 'BGV Reports', route: '/dashboard/bg-verification/reports', exact: true }
      ]
    },
    {
      id: 'employees',
      label: 'Employees',
      icon: 'bi-people',
      matchPrefixes: ['/dashboard/employees'],
      children: [
        { id: 'employees-directory', label: 'Directory', route: '/dashboard/employees/directory', exact: true },
        { id: 'employees-departments', label: 'Departments', route: '/dashboard/employees/departments', exact: true },
        { id: 'employees-locations', label: 'Locations', route: '/dashboard/employees/locations', exact: true }
      ]
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: 'bi-folder2-open',
      matchPrefixes: ['/dashboard/documents'],
      children: [
        { id: 'documents-all', label: 'All Documents', route: '/dashboard/documents/all', exact: true },
        { id: 'documents-templates', label: 'HR Templates', route: '/dashboard/documents/hr-templates', exact: true }
      ]
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'bi-graph-up',
      matchPrefixes: ['/dashboard/reports'],
      children: [
        { id: 'reports-hiring', label: 'Hiring Reports', route: '/dashboard/reports/hiring', exact: true },
        { id: 'reports-onboarding', label: 'Onboarding Reports', route: '/dashboard/reports/onboarding', exact: true },
        { id: 'reports-bgv', label: 'BGV Reports', route: '/dashboard/reports/bgv', exact: true }
      ]
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'bi-gear',
      matchPrefixes: ['/dashboard/settings'],
      children: [
        { id: 'settings-users', label: 'Users & Roles', route: '/dashboard/settings/users-roles', exact: true },
        { id: 'settings-permissions', label: 'Permissions', route: '/dashboard/settings/permissions', exact: true },
        { id: 'settings-email', label: 'Email Templates', route: '/dashboard/settings/email-templates', exact: true },
        { id: 'settings-workflows', label: 'Workflows', route: '/dashboard/settings/workflow-stages', exact: true }
      ]
    }
  ];
  private expandedSections = new Set<string>();
  private routerSubscription?: Subscription;
  private sessionWarningSub?: Subscription;

  constructor(
    private jobService: JobService,
    private candidateService: CandidateService,
    private applicationService: ApplicationService,
    private authService: AuthService,
    router: Router
  ) {
    this.router = router;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile') && !target.closest('.profile-dropdown')) {
      this.showDropdown = false;
    }
  }

  ngOnInit(): void {
    this.loadStats();
    this.loadRecentApplications();

    // Subscribe to session warnings
    this.sessionWarningSub = this.authService.sessionWarningMinutesLeft$.subscribe(mins => {
      this.sessionMinutesLeft = mins;
      this.showSessionBanner = mins !== null && mins >= 0;
    });

    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.syncExpandedSections(event.urlAfterRedirects);
      }
    });
    this.syncExpandedSections(this.router.url);
  }

  isDashboardRoot(): boolean {
    const url = this.router.url;
    return url === '/dashboard' || url === '/dashboard/';
  }

  loadStats(): void {
    this.loading = true;
    
    // Load jobs
    this.jobService.getJobs(1, 1).subscribe({
      next: (result) => {
        this.stats.totalJobs = result.totalCount;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load job stats', err);
        this.loading = false;
      }
    });

    // Load active jobs
    this.jobService.getJobs(1, 1000).subscribe({
      next: (result) => {
        this.stats.activeJobs = result.items.filter(j => j.isActive).length;
      },
      error: (err) => console.error('Failed to load active jobs', err)
    });

    // Load candidates
    this.candidateService.getCandidates(1, 1).subscribe({
      next: (result) => {
        this.stats.totalCandidates = result.totalCount;
      },
      error: (err) => console.error('Failed to load candidate stats', err)
    });

    // Load applications
    this.applicationService.getApplications({ pageNumber: 1, pageSize: 1 }).subscribe({
      next: (result) => {
        this.stats.totalApplications = result.totalCount;
      },
      error: (err) => console.error('Failed to load application stats', err)
    });

    // Load applications by status
    const statuses: ApplicationStatus[] = [
      ApplicationStatus.New,
      ApplicationStatus.Shortlisted,
      ApplicationStatus.Hired,
      ApplicationStatus.Rejected
    ];

    statuses.forEach(status => {
      this.applicationService.getApplications({ 
        pageNumber: 1, 
        pageSize: 1, 
        status: status 
      }).subscribe({
        next: (result) => {
          switch (status) {
            case ApplicationStatus.New:
              this.stats.newApplications = result.totalCount;
              break;
            case ApplicationStatus.Shortlisted:
              this.stats.shortlistedApplications = result.totalCount;
              break;
            case ApplicationStatus.Hired:
              this.stats.hiredApplications = result.totalCount;
              break;
            case ApplicationStatus.Rejected:
              this.stats.rejectedApplications = result.totalCount;
              break;
          }
        },
        error: (err) => console.error(`Failed to load ${APPLICATION_STATUS_LABELS[status]} applications`, err)
      });
    });
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  loadRecentApplications(): void {
    this.recentLoading = true;
    this.recentError = null;
    this.applicationService.getApplications({
      pageNumber: 1,
      pageSize: 5,
      sortBy: 'appliedDate',
      sortOrder: 'desc'
    }).subscribe({
      next: (result) => {
        this.recentApplications = result.items || [];
        this.recentLoading = false;
      },
      error: (err) => {
        console.error('Failed to load recent applications', err);
        this.recentApplications = [];
        this.recentLoading = false;
        this.recentError = 'Unable to load recent applications.';
      }
    });
  }

  getUserInitials(): string {
    const user = this.authService.getCurrentUser();
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'HR';
  }

  getUserName(): string {
    const user = this.authService.getCurrentUser();
    return user?.email?.split('@')[0] || 'Admin User';
  }

  getUserEmail(): string {
    const user = this.authService.getCurrentUser();
    return user?.email || 'admin@example.com';
  }

  getUserRole(): string {
    const user = this.authService.getCurrentUser();
    return user?.role === 'HR' ? 'HR Manager' : 'User';
  }

  navigateToProfile(): void {
    this.showDropdown = false;
    this.router.navigate(['/dashboard/profile']);
  }

  navigateToSettings(): void {
    this.showDropdown = false;
    this.router.navigate(['/dashboard/settings']);
  }

  navigateToChangePassword(): void {
    this.showDropdown = false;
    this.router.navigate(['/dashboard/change-password']);
  }

  logout(): void {
    this.showDropdown = false;
    this.authService.logout();
    this.router.navigate(['/hr-login']);
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    if (this.sidebarCollapsed) {
      this.expandedSections.clear();
    } else {
      this.syncExpandedSections(this.router.url);
    }
  }

  viewApplication(applicationId: number): void {
    if (!applicationId) return;
    this.router.navigate(['/dashboard/applications', applicationId, 'status']);
  }

  getJobTitle(application: JobApplication): string {
    if (application.job?.title) return application.job.title;
    return `Job #${application.jobId}`;
  }

  getCandidateName(application: JobApplication): string {
    if (application.candidate) {
      const { firstName = '', lastName = '' } = application.candidate;
      const name = `${firstName} ${lastName}`.trim();
      if (name) return name;
    }
    return `Candidate #${application.candidateId}`;
  }

  getCandidateEmail(application: JobApplication): string {
    return application.candidate?.email || '';
  }

  getAppliedDate(application: JobApplication): string {
    return application.appliedDate ? new Date(application.appliedDate).toLocaleString() : '-';
  }

  getStatusLabel(status: ApplicationStatus | undefined): string {
    if (!status) return 'Unknown';
    return APPLICATION_STATUS_LABELS[status] ?? 'Unknown';
  }

  getStatusBadgeClass(status: ApplicationStatus | undefined): string {
    switch (status) {
      case ApplicationStatus.New:
        return 'status-badge status-new';
      case ApplicationStatus.Shortlisted:
        return 'status-badge status-shortlisted';
      case ApplicationStatus.Hired:
        return 'status-badge status-hired';
      case ApplicationStatus.Rejected:
        return 'status-badge status-rejected';
      default:
        return 'status-badge';
    }
  }

  toggleSection(item: NavItem): void {
    if (!item.children?.length) {
      return;
    }

    if (this.expandedSections.has(item.id)) {
      this.expandedSections.delete(item.id);
    } else {
      this.expandedSections.add(item.id);
    }
  }

  isExpanded(item: NavItem): boolean {
    if (!item.children?.length) {
      return false;
    }
    return this.expandedSections.has(item.id);
  }

  isItemActive(item: NavItem): boolean {
    return this.isRouteMatch(item, this.router.url);
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
    this.sessionWarningSub?.unsubscribe();
  }

  private syncExpandedSections(url: string): void {
    this.navItems.forEach(item => {
      if (item.children?.length && this.isRouteMatch(item, url)) {
        this.expandedSections.add(item.id);
      }
    });
  }

  private isRouteMatch(item: NavItem, url: string): boolean {
    if (item.matchPrefixes?.length) {
      const match = item.matchPrefixes.some(prefix => url.startsWith(prefix));
      if (match) {
        return true;
      }
    }

    if (item.route) {
      const normalizedUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      const normalizedRoute = item.route.endsWith('/') ? item.route.slice(0, -1) : item.route;
      if (item.exact) {
        return normalizedUrl === normalizedRoute;
      }
      return normalizedUrl.startsWith(normalizedRoute);
    }

    if (item.children?.length) {
      return item.children.some(child => this.isRouteMatch(child, url));
    }

    return false;
  }
}
