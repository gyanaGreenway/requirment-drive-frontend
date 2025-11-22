import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hr-performance-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hr-performance-report.component.html',
  styleUrls: ['./hr-performance-report.component.css']
})
export class HrPerformanceReportComponent {
  recruiters = [
    { name: 'Mamta', interviews: 6, hires: 2, hiringRate: 33 },
    { name: 'Ranjan', interviews: 4, hires: 1, hiringRate: 25 }
  ];
}
