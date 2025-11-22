import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-permissions-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './permissions-settings.component.html',
  styleUrls: ['./permissions-settings.component.css']
})
export class PermissionsSettingsComponent {
  roles = [
    { name: 'HR Manager', access: ['Recruitment', 'Interviews', 'Reports'] },
    { name: 'Recruiter', access: ['Recruitment', 'Interviews'] },
    { name: 'Hiring Manager', access: ['Recruitment', 'Hiring', 'BG Verification'] }
  ];
}
