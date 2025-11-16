import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../../core/services/application.service';
import { JobService } from '../../../core/services/job.service';
import { CandidateService } from '../../../core/services/candidate.service';
import { 
  JobApplication, 
  ApplicationStatus, 
  UpdateApplicationStatusDto 
} from '../../../shared/models/application.model';

@Component({
  selector: 'app-application-status',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './application-status.component.html',
  styleUrls: ['./application-status.component.css']
})
export class ApplicationStatusComponent implements OnInit {
  application?: JobApplication;
  applicationId?: number;
  loading = false;
  error: string | null = null;
  submitting = false;
  
  newStatus?: ApplicationStatus;
  statusNotes = '';
  
  statusOptions = Object.values(ApplicationStatus);
  statusTransitions: { [key: string]: ApplicationStatus[] } = {
    'New': [ApplicationStatus.Shortlisted, ApplicationStatus.Rejected],
    'Shortlisted': [ApplicationStatus.Hired, ApplicationStatus.Rejected],
    'Rejected': [],
    'Hired': []
  };

  constructor(
    private applicationService: ApplicationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.applicationId = +params['id'];
      this.loadApplication();
    });
  }

  loadApplication(): void {
    if (!this.applicationId) return;
    this.loading = true;
    this.error = null;
    this.applicationService.getApplication(this.applicationId).subscribe({
      next: (application) => {
        this.application = application;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load application details.';
        this.loading = false;
        console.error(err);
      }
    });
  }

  getAvailableStatuses(): ApplicationStatus[] {
    if (!this.application) return [];
    return this.statusTransitions[this.application.status] || [];
  }

  canChangeStatus(): boolean {
    return this.getAvailableStatuses().length > 0;
  }

  updateStatus(): void {
    if (!this.applicationId || !this.newStatus) return;

    this.submitting = true;
    this.error = null;

    const updateDto: UpdateApplicationStatusDto = {
      applicationId: this.applicationId,
      status: this.newStatus,
      notes: this.statusNotes
    };

    this.applicationService.updateApplicationStatus(updateDto).subscribe({
      next: () => {
        this.loadApplication();
        this.newStatus = undefined;
        this.statusNotes = '';
        this.submitting = false;
      },
      error: (err) => {
        this.error = 'Failed to update application status. Please try again.';
        this.submitting = false;
        console.error(err);
      }
    });
  }

  getStatusClass(status: ApplicationStatus): string {
    switch (status) {
      case ApplicationStatus.New:
        return 'badge bg-primary';
      case ApplicationStatus.Shortlisted:
        return 'badge bg-info';
      case ApplicationStatus.Hired:
        return 'badge bg-success';
      case ApplicationStatus.Rejected:
        return 'badge bg-danger';
      default:
        return 'badge bg-secondary';
    }
  }

  backToList(): void {
    this.router.navigate(['/dashboard/applications']);
  }
}

