import { Routes } from '@angular/router';
import { CandidateLoginComponent } from './features/auth/candidate-login/candidate-login.component';
import { HrLoginComponent } from './features/auth/hr-login/hr-login.component';
import { DashboardComponent } from './layout/dashboard/dashboard.component';
import { JobListComponent } from './features/jobs/job-list/job-list.component';
import { JobCreateComponent } from './features/jobs/job-create/job-create.component';
import { JobDetailsComponent } from './features/jobs/job-details/job-details.component';
import { CandidateListComponent } from './features/candidates/candidate-list/candidate-list.component';
import { CandidateCreateComponent } from './features/candidates/candidate-create/candidate-create.component';
import { CandidateDetailsComponent } from './features/candidates/candidate-details/candidate-details.component';
import { CandidateDashboardComponent } from './features/candidates/candidate-dashboard/candidate-dashboard.component';
import { CandidateProfileComponent } from './features/candidates/candidate-profile/candidate-profile.component';
import { ApplicationListComponent } from './features/applications/application-list/application-list.component';
import { ApplicationStatusComponent } from './features/applications/application-status/application-status.component';
import { ApplicationCreateComponent } from './features/applications/application-create/application-create.component';
import { PublicJobsComponent } from './features/public-jobs/public-jobs.component';
import { PublicJobDetailsComponent } from './features/public-jobs/public-job-details.component';
import { JobApplicationComponent } from './features/public-jobs/job-application.component';
import { AuthGuard } from './core/guards/auth.guard';
// Newly added feature components (placeholders)
import { ExpiringJobsComponent } from './features/jobs/expiring-jobs/expiring-jobs.component';
import { ClosedJobsComponent } from './features/jobs/closed-jobs/closed-jobs.component';
import { TalentPoolComponent } from './features/candidates/talent-pool/talent-pool.component';
import { InterviewCalendarComponent } from './features/interviews/interview-calendar/interview-calendar.component';
import { InterviewScheduleComponent } from './features/interviews/interview-schedule/interview-schedule.component';
import { InterviewFeedbackComponent } from './features/interviews/interview-feedback/interview-feedback.component';
import { JobReportsComponent } from './features/reports/job-reports/job-reports.component';
import { ApplicationFunnelReportComponent } from './features/reports/application-funnel/application-funnel-report.component';
import { SourceAnalyticsReportComponent } from './features/reports/source-analytics/source-analytics-report.component';
import { HrPerformanceReportComponent } from './features/reports/hr-performance/hr-performance-report.component';
import { UsersRolesSettingsComponent } from './features/settings/users-roles/users-roles-settings.component';
import { CompanySettingsComponent } from './features/settings/company/company-settings.component';
import { EmailTemplatesSettingsComponent } from './features/settings/email-templates/email-templates-settings.component';
import { WorkflowStagesSettingsComponent } from './features/settings/workflow-stages/workflow-stages-settings.component';
import { OnboardingNewHiresComponent } from './features/onboarding/new-hires/onboarding-new-hires.component';
import { OnboardingDocumentUploadComponent } from './features/onboarding/document-upload/onboarding-document-upload.component';
import { OnboardingChecklistsComponent } from './features/onboarding/checklists/onboarding-checklists.component';
import { OnboardingTasksComponent } from './features/onboarding/tasks/onboarding-tasks.component';
import { OfferLettersComponent } from './features/hiring/offer-letters/offer-letters.component';
import { OfferTemplatesComponent } from './features/hiring/offer-templates/offer-templates.component';
import { BgvPendingComponent } from './features/bg-verification/pending/bgv-pending.component';
import { BgvInProgressComponent } from './features/bg-verification/in-progress/bgv-in-progress.component';
import { BgvCompletedComponent } from './features/bg-verification/completed/bgv-completed.component';
import { BgvReportsComponent } from './features/bg-verification/reports/bgv-reports.component';
import { EmployeesDirectoryComponent } from './features/employees/directory/employees-directory.component';
import { EmployeesDepartmentsComponent } from './features/employees/departments/employees-departments.component';
import { EmployeesLocationsComponent } from './features/employees/locations/employees-locations.component';
import { AllDocumentsComponent } from './features/documents/all-documents/all-documents.component';
import { DocumentsHrTemplatesComponent } from './features/documents/hr-templates/documents-hr-templates.component';
import { HiringReportsComponent } from './features/reports/hiring-reports/hiring-reports.component';
import { OnboardingReportsComponent } from './features/reports/onboarding-reports/onboarding-reports.component';
import { ReportsBgvReportsComponent } from './features/reports/bgv-reports/reports-bgv-reports.component';
import { PermissionsSettingsComponent } from './features/settings/permissions/permissions-settings.component';
import { ApplicationStatus } from './shared/models/application.model';

export const routes: Routes = [
  { path: 'candidate-login', component: CandidateLoginComponent },
  { path: 'hr-login', component: HrLoginComponent },
  { 
    path: 'candidate-dashboard', 
    component: CandidateDashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'candidate' }
  },
  { 
    path: 'candidate-profile', 
    component: CandidateProfileComponent,
    canActivate: [AuthGuard],
    data: { role: 'candidate' }
  },
  { 
    path: 'public-jobs', 
    component: PublicJobsComponent
  },
  { 
    path: 'public-jobs/:id', 
    component: PublicJobDetailsComponent
  },
  { 
    path: 'public-jobs/:id/apply', 
    component: JobApplicationComponent
  },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard],
    data: { role: 'hr' },
    children: [
      { path: 'jobs', component: JobListComponent },
      { path: 'jobs/create', component: JobCreateComponent },
      { path: 'jobs/:id', component: JobDetailsComponent },
      { path: 'jobs/:id/edit', component: JobCreateComponent },
      { path: 'jobs/expiring', component: ExpiringJobsComponent },
      { path: 'jobs/closed', component: ClosedJobsComponent },

      { path: 'candidates', component: CandidateListComponent },
      { path: 'candidates/create', component: CandidateCreateComponent },
      { path: 'candidates/:id', component: CandidateDetailsComponent },
      { path: 'candidates/:id/edit', component: CandidateCreateComponent },
      { path: 'candidates/talent-pool', component: TalentPoolComponent },

      { path: 'applications', component: ApplicationListComponent },
      { path: 'applications/create', component: ApplicationCreateComponent },
      { path: 'applications/:id/status', component: ApplicationStatusComponent },
      {
        path: 'applications/new',
        component: ApplicationListComponent,
        data: { status: ApplicationStatus.New }
      },
      {
        path: 'applications/shortlisted',
        component: ApplicationListComponent,
        data: { status: ApplicationStatus.Shortlisted }
      },
      {
        path: 'applications/interview-scheduled',
        component: ApplicationListComponent,
        data: { status: 'INTERVIEW_SCHEDULED' }
      },
      {
        path: 'applications/hired',
        component: ApplicationListComponent,
        data: { status: ApplicationStatus.Hired }
      },
      {
        path: 'applications/rejected',
        component: ApplicationListComponent,
        data: { status: ApplicationStatus.Rejected }
      },

      { path: 'interviews/calendar', component: InterviewCalendarComponent },
      { path: 'interviews/schedule', component: InterviewScheduleComponent },
      { path: 'interviews/feedback', component: InterviewFeedbackComponent },

      { path: 'hiring/offer-letters', component: OfferLettersComponent },
      { path: 'hiring/offer-templates', component: OfferTemplatesComponent },

      { path: 'onboarding/new-hires', component: OnboardingNewHiresComponent },
      { path: 'onboarding/document-upload', component: OnboardingDocumentUploadComponent },
      { path: 'onboarding/checklists', component: OnboardingChecklistsComponent },
      { path: 'onboarding/tasks', component: OnboardingTasksComponent },

      { path: 'bg-verification/pending', component: BgvPendingComponent },
      { path: 'bg-verification/in-progress', component: BgvInProgressComponent },
      { path: 'bg-verification/completed', component: BgvCompletedComponent },
      { path: 'bg-verification/reports', component: BgvReportsComponent },

      { path: 'employees/directory', component: EmployeesDirectoryComponent },
      { path: 'employees/departments', component: EmployeesDepartmentsComponent },
      { path: 'employees/locations', component: EmployeesLocationsComponent },

      { path: 'documents/all', component: AllDocumentsComponent },
      { path: 'documents/hr-templates', component: DocumentsHrTemplatesComponent },

      { path: 'reports/job-performance', component: JobReportsComponent },
      { path: 'reports/application-funnel', component: ApplicationFunnelReportComponent },
      { path: 'reports/source-analytics', component: SourceAnalyticsReportComponent },
      { path: 'reports/hr-performance', component: HrPerformanceReportComponent },
      { path: 'reports/hiring', component: HiringReportsComponent },
      { path: 'reports/onboarding', component: OnboardingReportsComponent },
      { path: 'reports/bg-verification', component: ReportsBgvReportsComponent },

      { path: 'settings/users-roles', component: UsersRolesSettingsComponent },
      { path: 'settings/company', component: CompanySettingsComponent },
      { path: 'settings/email-templates', component: EmailTemplatesSettingsComponent },
      { path: 'settings/workflow-stages', component: WorkflowStagesSettingsComponent },
      { path: 'settings/permissions', component: PermissionsSettingsComponent }
    ]
  },
  { path: '', redirectTo: '/candidate-login', pathMatch: 'full' },
  { path: '**', redirectTo: '/candidate-login' }
];
