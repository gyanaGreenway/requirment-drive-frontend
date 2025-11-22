import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-source-analytics-report',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './source-analytics-report.component.html',
  styleUrls: ['./source-analytics-report.component.css']
})
export class SourceAnalyticsReportComponent {
  sources = [
    { source: 'LinkedIn', percent: 45 },
    { source: 'Referral', percent: 25 },
    { source: 'Website', percent: 18 },
    { source: 'Job Board', percent: 12 }
  ];
}
