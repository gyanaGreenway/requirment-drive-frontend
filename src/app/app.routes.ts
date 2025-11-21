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
      { path: 'candidates', component: CandidateListComponent },
      { path: 'candidates/create', component: CandidateCreateComponent },
      { path: 'candidates/:id', component: CandidateDetailsComponent },
      { path: 'candidates/:id/edit', component: CandidateCreateComponent },
      { path: 'applications', component: ApplicationListComponent },
      { path: 'applications/create', component: ApplicationCreateComponent },
      { path: 'applications/:id/status', component: ApplicationStatusComponent }
    ]
  },
  { path: '', redirectTo: '/candidate-login', pathMatch: 'full' },
  { path: '**', redirectTo: '/candidate-login' }
];
