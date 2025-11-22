import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-expiring-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expiring-jobs.component.html',
  styleUrls: ['./expiring-jobs.component.css']
})
export class ExpiringJobsComponent {
  // Placeholder data
  expiringJobs = [
    { title: 'Senior React Developer', daysLeft: 3 },
    { title: 'Backend .NET Engineer', daysLeft: 5 }
  ];
}
