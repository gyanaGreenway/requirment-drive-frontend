import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-workflow-stages-settings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './workflow-stages-settings.component.html',
  styleUrls: ['./workflow-stages-settings.component.css']
})
export class WorkflowStagesSettingsComponent {
  stages = ['New', 'Shortlisted', 'Interview', 'Offer', 'Hired'];
}
