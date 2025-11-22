import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-job-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './job-reports.component.html',
  styleUrls: ['./job-reports.component.css']
})
export class JobReportsComponent {
  topJobs = [
    { title: 'Angular Lead', views: 1200, applications: 56, conversion: 4.6 },
    { title: 'React Dev', views: 900, applications: 40, conversion: 4.4 }
  ];
}
