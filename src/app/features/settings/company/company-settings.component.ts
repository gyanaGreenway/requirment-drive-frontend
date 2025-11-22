import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './company-settings.component.html',
  styleUrls: ['./company-settings.component.css']
})
export class CompanySettingsComponent {
  company = { name: 'RecruitmentDrive', location: 'Remote', timezone: 'UTC' };
}
