import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-closed-jobs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './closed-jobs.component.html',
  styleUrls: ['./closed-jobs.component.css']
})
export class ClosedJobsComponent {
  closedJobs = [
    { title: 'UI/UX Designer', closedDate: new Date().toLocaleDateString() },
    { title: 'QA Automation Engineer', closedDate: new Date().toLocaleDateString() }
  ];
}
