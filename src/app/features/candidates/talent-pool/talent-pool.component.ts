import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SkillStat { name: string; count: number; }

@Component({
  selector: 'app-talent-pool',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './talent-pool.component.html',
  styleUrls: ['./talent-pool.component.css']
})
export class TalentPoolComponent {
  total = 320;
  newThisWeek = 24;
  skills: SkillStat[] = [
    { name: 'Angular', count: 90 },
    { name: 'React', count: 110 },
    { name: 'Node.js', count: 70 },
    { name: 'UI/UX', count: 50 }
  ];
}
