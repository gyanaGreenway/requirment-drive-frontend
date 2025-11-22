import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-email-templates-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './email-templates-settings.component.html',
  styleUrls: ['./email-templates-settings.component.css']
})
export class EmailTemplatesSettingsComponent {
  templates = [
    { name: 'Interview Invitation', updated: '2025-11-01' },
    { name: 'Offer Letter', updated: '2025-11-10' }
  ];
}
