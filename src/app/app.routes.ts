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

export const routes: Routes = [
  { path: 'candidate-login', component: CandidateLoginComponent },
  { path: 'hr-login', component: HrLoginComponent },
  { path: 'candidate-dashboard', component: CandidateDashboardComponent },
  { path: 'candidate-profile', component: CandidateProfileComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
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
